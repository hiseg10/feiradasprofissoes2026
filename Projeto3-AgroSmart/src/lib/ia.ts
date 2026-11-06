import type { RespostaIA } from "./types";

const SISTEMA = `Você é o agrônomo educativo do AgroSmart, um projeto escolar de horta inteligente.
Sua tarefa é ajudar alunos e visitantes a entender possíveis problemas da planta a partir de uma foto.
Regras:
- Responda em português do Brasil, em linguagem simples.
- Traga até 3 hipóteses (praga, doença fúngica/bacteriana, deficiência nutricional, excesso ou falta de água, queimadura de sol).
- Diga o nível de confiança da análise (baixa, média ou alta) e o que precisa ser observado presencialmente.
- Sugira apenas cuidados gerais, orgânicos e seguros. Nunca indique defensivos proibidos ou dosagem sem receita agronômica.
- Deixe claro que a foto não substitui a avaliação de um engenheiro agrônomo.
- Termine com uma pergunta para o aluno continuar investigando.`;

type GeminiResposta = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
};

function provedorAtual(): "gemini" | "deepseek" | "groq" {
  const valor = (process.env.IA_PROVIDER ?? "gemini").toLowerCase();
  if (valor === "deepseek" || valor === "groq") return valor;
  return "gemini";
}

export async function diagnosticarPlanta({
  imagemBase64,
  mimeType,
  cultura,
}: {
  imagemBase64: string;
  mimeType: string;
  cultura?: string;
}): Promise<RespostaIA> {
  const provedor = provedorAtual();

  if (provedor === "gemini") {
    try {
      return await chamarGeminiVision(imagemBase64, mimeType, cultura);
    } catch {
      // cai no modo local
    }
  }

  return respostaLocal(cultura);
}

async function chamarGeminiVision(
  imagemBase64: string,
  mimeType: string,
  cultura?: string,
): Promise<RespostaIA> {
  const chave = process.env.GEMINI_API_KEY;
  if (!chave) throw new Error("GEMINI_API_KEY ausente");
  const modelo = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

  const contexto = cultura?.trim()
    ? `A cultura informada pelo aluno é: ${cultura.trim()}.`
    : "O aluno não informou a cultura.";

  const resposta = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${encodeURIComponent(chave)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `${SISTEMA}\n\n${contexto}` }] },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: "Analise a foto da folha e monte um diagnóstico educativo com hipóteses, confiança e próximos passos.",
              },
              {
                inlineData: {
                  mimeType,
                  data: imagemBase64,
                },
              },
            ],
          },
        ],
        generationConfig: { temperature: 0.3, maxOutputTokens: 900 },
      }),
      signal: AbortSignal.timeout(45_000),
    },
  );

  if (!resposta.ok) throw new Error(`Gemini respondeu ${resposta.status}`);
  const dados = (await resposta.json()) as GeminiResposta;
  const texto = (dados.candidates?.[0]?.content?.parts ?? [])
    .map((parte) => parte.text ?? "")
    .join("\n")
    .trim();
  if (!texto) throw new Error("Resposta vazia do Gemini");

  return { resposta: texto, provedor: "gemini", modelo, usadoFallback: false };
}

function respostaLocal(cultura?: string): RespostaIA {
  const nome = cultura?.trim() || "sua planta";
  const texto = [
    `Não consegui analisar a imagem com IA agora, mas posso te ajudar a investigar ${nome} no modo local.`,
    "Checklist rápido:",
    "1. Observe se as manchas começam nas folhas velhas ou novas — isso ajuda a diferenciar deficiência nutricional de doença.",
    "2. Veja se há bolor, teia fina ou insetos na parte de baixo das folhas.",
    "3. Confira a umidade do solo: encharcado e com cheiro forte indica excesso de água; seco e rachado indica falta.",
    "4. Compare com plantas vizinhas: se só uma está afetada, pode ser praga ou fungo localizado.",
    "5. Tire fotos da folha inteira, do verso e do caule, com boa luz, e tente novamente.",
    "Confiança: baixa (análise sem imagem processada).",
    "Lembrete: a foto não substitui a avaliação de um engenheiro agrônomo. Siga as recomendações da assistência técnica local.",
    "Qual dessas observações aparece na sua planta?",
  ].join("\n");

  return {
    resposta: texto,
    provedor: "local",
    modelo: "checklist-agronomico",
    usadoFallback: true,
  };
}

import { PONTOS } from "./conteudo";

export type MensagemIA = {
  papel: "user" | "assistant";
  texto: string;
};

export type RespostaIA = {
  resposta: string;
  provedor: string;
  modelo: string;
  usadoFallback: boolean;
};

const SISTEMA = `Você é o guia do Florestan Conecta, um projeto escolar de turismo e comércio local.
Regras:
- Responda em português do Brasil, com tom acolhedor e linguagem simples.
- Use apenas os pontos cadastrados no contexto. Não invente estabelecimentos, endereços ou horários.
- Se o visitante pedir algo que não está na lista, diga com gentileza que ainda não está no guia e sugira uma alternativa próxima da lista.
- Monte roteiros curtos (2 a 4 horas) quando pedirem, explicando o deslocamento a pé.
- Sempre lembre que horários e contatos podem mudar e devem ser confirmados.
- Respostas curtas: no máximo 3 parágrafos ou uma lista curta.`;

type GeminiResposta = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
};

type OpenAIResposta = {
  choices?: { message?: { content?: string } }[];
};

const OPENAI_COMPATIVEIS = {
  deepseek: {
    url: "https://api.deepseek.com/chat/completions",
    chave: () => process.env.DEEPSEEK_API_KEY,
    modelo: () => process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
  },
  groq: {
    url: "https://api.groq.com/openai/v1/chat/completions",
    chave: () => process.env.GROQ_API_KEY,
    modelo: () => process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
  },
} as const;

function provedorAtual(): "gemini" | "deepseek" | "groq" {
  const valor = (process.env.IA_PROVIDER ?? "gemini").toLowerCase();
  if (valor === "deepseek" || valor === "groq") return valor;
  return "gemini";
}

export async function consultarGuia(
  historico: MensagemIA[],
  contexto: string,
): Promise<RespostaIA> {
  const provedor = provedorAtual();
  try {
    if (provedor === "gemini") return await chamarGemini(historico, contexto);
    return await chamarOpenAICompativel(provedor, historico, contexto);
  } catch {
    return respostaLocal(historico);
  }
}

async function chamarGemini(
  historico: MensagemIA[],
  contexto: string,
): Promise<RespostaIA> {
  const chave = process.env.GEMINI_API_KEY;
  if (!chave) throw new Error("GEMINI_API_KEY ausente");
  const modelo = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

  const resposta = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${encodeURIComponent(chave)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: `${SISTEMA}\n\nPontos do guia:\n${contexto}` }],
        },
        contents: historico.map((mensagem) => ({
          role: mensagem.papel === "assistant" ? "model" : "user",
          parts: [{ text: mensagem.texto }],
        })),
        generationConfig: { temperature: 0.5, maxOutputTokens: 800 },
      }),
      signal: AbortSignal.timeout(30_000),
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

async function chamarOpenAICompativel(
  provedor: "deepseek" | "groq",
  historico: MensagemIA[],
  contexto: string,
): Promise<RespostaIA> {
  const config = OPENAI_COMPATIVEIS[provedor];
  const chave = config.chave();
  if (!chave) throw new Error(`Chave de ${provedor} ausente`);
  const modelo = config.modelo();

  const resposta = await fetch(config.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${chave}`,
    },
    body: JSON.stringify({
      model: modelo,
      temperature: 0.5,
      max_tokens: 800,
      messages: [
        { role: "system", content: `${SISTEMA}\n\nPontos do guia:\n${contexto}` },
        ...historico.map((mensagem) => ({ role: mensagem.papel, content: mensagem.texto })),
      ],
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!resposta.ok) throw new Error(`${provedor} respondeu ${resposta.status}`);
  const dados = (await resposta.json()) as OpenAIResposta;
  const texto = dados.choices?.[0]?.message?.content?.trim();
  if (!texto) throw new Error(`Resposta vazia de ${provedor}`);

  return { resposta: texto, provedor, modelo, usadoFallback: false };
}

function resumePonto(ponto: (typeof PONTOS)[number]): string {
  return `${ponto.nome} (${ponto.categoria}) — ${ponto.dica}`;
}

function respostaLocal(historico: MensagemIA[]): RespostaIA {
  const pergunta = [...historico].reverse().find((m) => m.papel === "user")?.texto ?? "";
  const texto = pergunta.toLowerCase();
  const partes: string[] = [
    "Estou sem conexão com a IA agora, então vou usar o guia local. Horários e contatos podem mudar; confirme antes de sair.",
  ];

  if (texto.includes("roteiro") || texto.includes("itiner") || texto.includes("tarde") || texto.includes("horas")) {
    const destaques = PONTOS.filter((ponto) => ponto.destaque).slice(0, 4);
    partes.push(
      "Roteiro sugerido:\n" +
        destaques.map((ponto, indice) => `${indice + 1}. ${resumePonto(ponto)}`).join("\n"),
    );
  } else if (texto.includes("comer") || texto.includes("comida") || texto.includes("café") || texto.includes("lanche")) {
    partes.push(
      "Opções para comer:\n" +
        PONTOS.filter((ponto) => ponto.categoria === "Comer")
          .map((ponto) => `- ${resumePonto(ponto)}`)
          .join("\n"),
    );
  } else if (texto.includes("artesanato") || texto.includes("presente") || texto.includes("lembrança")) {
    partes.push(
      "Artesanato local:\n" +
        PONTOS.filter((ponto) => ponto.categoria === "Artesanato")
          .map((ponto) => `- ${resumePonto(ponto)}`)
          .join("\n"),
    );
  } else if (texto.includes("criança") || texto.includes("familia") || texto.includes("família") || texto.includes("parque")) {
    partes.push(
      "Para ir com crianças:\n" +
        PONTOS.filter((ponto) => ponto.tags.some((tag) => ["parquinho", "família", "praça"].includes(tag)))
          .map((ponto) => `- ${resumePonto(ponto)}`)
          .join("\n"),
    );
  } else if (texto.includes("foto") || texto.includes("instagram")) {
    partes.push(
      "Lugares com boa luz para fotos:\n" +
        PONTOS.filter((ponto) => ponto.tags.some((tag) => ["foto", "praça", "museu"].includes(tag)))
          .map((ponto) => `- ${resumePonto(ponto)}`)
          .join("\n"),
    );
  } else {
    partes.push(
      "Posso montar um roteiro, indicar onde comer, sugerir artesanato local ou opções para ir com crianças. O que você prefere?",
    );
  }

  partes.push("Veja todos os pontos na página inicial do Florestan Conecta.");

  return {
    resposta: partes.join("\n\n"),
    provedor: "local",
    modelo: "roteiro-local",
    usadoFallback: true,
  };
}

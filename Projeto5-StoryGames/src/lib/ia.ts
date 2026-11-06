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

const SISTEMA = `Você é o curador da Story Games, uma loja fictícia de jogos narrativos criada por alunos para a Feira das Profissões Florestan 2026.
Regras:
- Responda em português do Brasil, com tom acolhedor e linguagem simples.
- Recomende apenas jogos que estão no catálogo fornecido. Nunca invente títulos, estúdios ou preços.
- Explique em dois parágrafos curtos por que cada jogo combina com o perfil do visitante.
- Considere gênero, duração, clima, tags e nota.
- Deixe claro que a loja é fictícia e que nada é comprado de verdade.
- Não prometa que o jogo é perfeito; fale de pontos fortes e de para quem ele funciona.`;

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

export async function consultarIA(
  historico: MensagemIA[],
  contexto: string,
  textoFallback?: string,
): Promise<RespostaIA> {
  const provedor = provedorAtual();
  try {
    if (provedor === "gemini") return await chamarGemini(historico, contexto);
    return await chamarOpenAICompativel(provedor, historico, contexto);
  } catch {
    return {
      resposta:
        textoFallback ??
        "Não consegui falar com a IA agora, mas você pode explorar o catálogo por gênero, duração e avaliações.",
      provedor: "local",
      modelo: "recomendador-local",
      usadoFallback: true,
    };
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
          parts: [{ text: `${SISTEMA}\n\nCatálogo disponível:\n${contexto}` }],
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
        { role: "system", content: `${SISTEMA}\n\nCatálogo disponível:\n${contexto}` },
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

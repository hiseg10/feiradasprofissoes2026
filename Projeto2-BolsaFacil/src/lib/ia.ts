import type { MensagemIA, RespostaIA } from "./types";

const SISTEMA = `Você é o Curador do Bolsa Fácil, um assistente educativo de educação financeira para o cidadão comum brasileiro.
Regras:
- Explique em português do Brasil, com linguagem simples e exemplos do dia a dia.
- Use os dados de mercado fornecidos no contexto. Não invente cotações.
- Nunca faça recomendação de compra, venda ou alocação. Diga que o conteúdo é educativo.
- Sempre cite os riscos e a importância de diversificar.
- Se a pergunta fugir de finanças, traga a conversa de volta com gentileza.
- Respostas curtas: no máximo 3 parágrafos.`;

type Provedor = "gemini" | "deepseek" | "groq";

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

function provedorAtual(): Provedor {
  const valor = (process.env.IA_PROVIDER ?? "gemini").toLowerCase();
  if (valor === "deepseek" || valor === "groq") return valor;
  return "gemini";
}

export async function consultarIA(
  historico: MensagemIA[],
  contexto: string,
): Promise<RespostaIA> {
  const provedor = provedorAtual();
  try {
    if (provedor === "gemini") return await chamarGemini(historico, contexto);
    return await chamarOpenAICompativel(provedor, historico, contexto);
  } catch {
    return respostaLocal(historico, contexto);
  }
}

async function chamarGemini(
  historico: MensagemIA[],
  contexto: string,
): Promise<RespostaIA> {
  const chave = process.env.GEMINI_API_KEY;
  if (!chave) throw new Error("GEMINI_API_KEY ausente");
  const modelo = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

  const contents = historico.map((m) => ({
    role: m.papel === "assistant" ? "model" : "user",
    parts: [{ text: m.texto }],
  }));

  const resposta = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${encodeURIComponent(chave)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: `${SISTEMA}\n\nDados atuais de mercado:\n${contexto}` }],
        },
        contents,
        generationConfig: { temperature: 0.4, maxOutputTokens: 900 },
      }),
      signal: AbortSignal.timeout(30_000),
    },
  );

  if (!resposta.ok) throw new Error(`Gemini respondeu ${resposta.status}`);
  const dados = (await resposta.json()) as GeminiResposta;
  const texto = (dados.candidates?.[0]?.content?.parts ?? [])
    .map((p) => p.text ?? "")
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
      temperature: 0.4,
      max_tokens: 900,
      messages: [
        { role: "system", content: `${SISTEMA}\n\nDados atuais de mercado:\n${contexto}` },
        ...historico.map((m) => ({ role: m.papel, content: m.texto })),
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

function respostaLocal(historico: MensagemIA[], contexto: string): RespostaIA {
  const pergunta = [...historico].reverse().find((m) => m.papel === "user")?.texto ?? "";
  const texto = pergunta.toLowerCase();
  const partes: string[] = [
    "Estou sem conexão com o provedor de IA neste momento, então vou responder no modo educativo local.",
  ];

  if (texto.includes("selic") || texto.includes("juros")) {
    partes.push(
      "A Selic é a taxa básica de juros da economia brasileira, definida pelo Banco Central. Ela influencia o custo do crédito, o rendimento da renda fixa e a inflação. Quando a Selic sobe, investimentos pós-fixados tendem a render mais; quando cai, a renda variável costuma ficar mais atrativa.",
    );
  } else if (texto.includes("ação") || texto.includes("bolsa") || texto.includes("renda variável")) {
    partes.push(
      "Ações são pequenas partes de uma empresa negociadas na bolsa. O retorno vem da valorização e dos dividendos, mas o preço oscila todos os dias. Por isso, ações pedem horizonte longo, diversificação e tolerância a risco.",
    );
  } else if (texto.includes("fii") || texto.includes("imóvel") || texto.includes("fundo imobiliário")) {
    partes.push(
      "Os FIIs permitem investir em imóveis ou em títulos ligados ao setor imobiliário sem comprar um imóvel inteiro. A renda vem dos aluguéis e da valorização das cotas, mas também há risco de vacância e de oscilação no preço.",
    );
  } else if (texto.includes("cdb") || texto.includes("tesouro") || texto.includes("renda fixa")) {
    partes.push(
      "Na renda fixa você empresta dinheiro para um banco ou para o governo em troca de uma remuneração combinada. Tesouro Direto e CDB são exemplos. É importante olhar risco, liquidez, taxa e tributação, não só a rentabilidade prometida.",
    );
  } else if (texto.includes("cripto") || texto.includes("bitcoin")) {
    partes.push(
      "Criptoativos são ativos digitais de alta volatilidade. Não há garantia de rentabilidade nem proteção do FGC. Se a pessoa decidir estudar o tema, o mais seguro é começar por conteúdo básico e nunca investir recursos essenciais.",
    );
  } else {
    partes.push(
      "Posso explicar renda fixa, ações, FIIs, ETFs, juros compostos, risco e diversificação. Me faça uma pergunta específica que eu detalho com exemplos.",
    );
  }

  partes.push(`Dados de mercado usados nesta resposta:\n${contexto}`);
  partes.push(
    "Lembrete: este conteúdo é educativo e não representa recomendação de investimento. Procure um profissional certificado antes de decidir.",
  );

  return {
    resposta: partes.join("\n\n"),
    provedor: "local",
    modelo: "regras-educativas",
    usadoFallback: true,
  };
}

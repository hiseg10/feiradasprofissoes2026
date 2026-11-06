import { COTACOES_MOCK, gerarCotacaoMock, INDICADORES_MOCK } from "./mock";
import type {
  Cotacao,
  Indicador,
  RespostaCotacoes,
  RespostaIndicadores,
} from "./types";

export const TICKERS_PADRAO = [
  "PETR4",
  "VALE3",
  "ITUB4",
  "BBAS3",
  "WEGE3",
  "B3SA3",
  "MGLU3",
  "EGIE3",
  "HGLG11",
  "MXRF11",
];

type BrapiItem = {
  symbol?: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  historicalDataPrice?: { close?: number }[];
};

type BcbItem = {
  data?: string;
  valor?: string;
};

type CacheItem = {
  valor: unknown;
  expira: number;
};

const cache = new Map<string, CacheItem>();

function lerCache<T>(chave: string): T | null {
  const item = cache.get(chave);
  if (!item || item.expira < Date.now()) {
    cache.delete(chave);
    return null;
  }
  return item.valor as T;
}

function salvarCache(chave: string, valor: unknown, ttlMs: number): void {
  cache.set(chave, { valor, expira: Date.now() + ttlMs });
}

function normalizarSimbolos(simbolos: string[]): string[] {
  const lista = simbolos
    .map((s) => s.trim().toUpperCase())
    .filter((s) => /^[A-Z0-9]{3,10}$/.test(s));
  return Array.from(new Set(lista)).slice(0, 12);
}

function mapearBrapi(item: BrapiItem): Cotacao | null {
  if (!item.symbol || typeof item.regularMarketPrice !== "number") return null;
  const mock = COTACOES_MOCK.find((c) => c.simbolo === item.symbol);
  const historico = (item.historicalDataPrice ?? [])
    .map((p) => p.close)
    .filter((n): n is number => typeof n === "number" && Number.isFinite(n));

  return {
    simbolo: item.symbol,
    nome: item.shortName || item.longName || mock?.nome || item.symbol,
    preco: item.regularMarketPrice,
    variacao: item.regularMarketChange ?? 0,
    variacaoPercentual: item.regularMarketChangePercent ?? 0,
    moeda: "BRL",
    atualizadoEm: new Date().toISOString(),
    fonte: "brapi",
    historico: historico.length >= 2 ? historico : mock?.historico ?? [item.regularMarketPrice],
  };
}

export async function getCotacoes(simbolos: string[] = TICKERS_PADRAO): Promise<RespostaCotacoes> {
  const lista = normalizarSimbolos(simbolos);
  const alvo = lista.length ? lista : TICKERS_PADRAO;
  const chave = `cot:${alvo.join(",")}`;
  const emCache = lerCache<RespostaCotacoes>(chave);
  if (emCache) return emCache;

  const token = process.env.BRAPI_TOKEN;
  if (token) {
    try {
      const url = `https://brapi.dev/api/quote/${alvo.join(",")}?token=${encodeURIComponent(token)}&range=1mo&interval=1d`;
      const resposta = await fetch(url, {
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      if (resposta.ok) {
        const dados = (await resposta.json()) as { results?: BrapiItem[] };
        const cotacoes = (dados.results ?? [])
          .map(mapearBrapi)
          .filter((c): c is Cotacao => c !== null);
        if (cotacoes.length) {
          const saida: RespostaCotacoes = {
            cotacoes,
            fonte: "brapi",
            atualizadoEm: new Date().toISOString(),
          };
          salvarCache(chave, saida, 60_000);
          return saida;
        }
      }
    } catch {
      // cai para os dados de demonstração
    }
  }

  const cotacoes = alvo.map(
    (simbolo) => COTACOES_MOCK.find((c) => c.simbolo === simbolo) ?? gerarCotacaoMock(simbolo),
  );
  const saida: RespostaCotacoes = {
    cotacoes,
    fonte: "mock",
    atualizadoEm: new Date().toISOString(),
  };
  salvarCache(chave, saida, 15_000);
  return saida;
}

async function buscarBcb(codigo: number): Promise<{ valor: number; data: string } | null> {
  try {
    const resposta = await fetch(
      `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${codigo}/dados/ultimos/1?formato=json`,
      { cache: "no-store", signal: AbortSignal.timeout(7000) },
    );
    if (!resposta.ok) return null;
    const dados = (await resposta.json()) as BcbItem[];
    const item = dados[0];
    if (!item?.valor) return null;
    const valor = Number(item.valor.replace(",", "."));
    if (!Number.isFinite(valor)) return null;
    return { valor, data: item.data ?? "" };
  } catch {
    return null;
  }
}

export async function getIndicadores(): Promise<RespostaIndicadores> {
  const chave = "indicadores";
  const emCache = lerCache<RespostaIndicadores>(chave);
  if (emCache) return emCache;

  const [selic, cdi, ipca] = await Promise.all([buscarBcb(11), buscarBcb(12), buscarBcb(433)]);

  const indicadores: Indicador[] = [
    selic
      ? { nome: "Selic", valor: selic.valor, unidade: "% ao ano", data: selic.data, fonte: "bcb" }
      : INDICADORES_MOCK[0],
    cdi
      ? { nome: "CDI", valor: cdi.valor, unidade: "% ao ano", data: cdi.data, fonte: "bcb" }
      : INDICADORES_MOCK[1],
    ipca
      ? { nome: "IPCA (mês)", valor: ipca.valor, unidade: "%", data: ipca.data, fonte: "bcb" }
      : INDICADORES_MOCK[2],
  ];

  const saida: RespostaIndicadores = {
    indicadores,
    fonte: indicadores.some((i) => i.fonte === "bcb") ? "bcb" : "mock",
    atualizadoEm: new Date().toISOString(),
  };
  salvarCache(chave, saida, 60 * 60 * 1000);
  return saida;
}

export function contextoParaIA(
  cotacoes: Cotacao[],
  indicadores: Indicador[],
  fonteMercado: string,
): string {
  const linhas = [
    `Fonte das cotações: ${fonteMercado === "brapi" ? "brapi.dev (dados reais)" : "modo demonstração"}.`,
    ...cotacoes.map((c) => {
      const sinal = c.variacaoPercentual >= 0 ? "+" : "";
      return `${c.simbolo} (${c.nome}): R$ ${c.preco.toFixed(2)} (${sinal}${c.variacaoPercentual.toFixed(2)}% no dia)`;
    }),
    ...indicadores.map((i) => `${i.nome}: ${i.valor} ${i.unidade} (${i.data})`),
  ];
  return linhas.join("\n");
}

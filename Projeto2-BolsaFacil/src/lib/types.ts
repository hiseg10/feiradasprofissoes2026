export type FonteMercado = "brapi" | "mock";
export type FonteIndicador = "bcb" | "mock";

export type Cotacao = {
  simbolo: string;
  nome: string;
  preco: number;
  variacao: number;
  variacaoPercentual: number;
  moeda: string;
  atualizadoEm: string;
  fonte: FonteMercado;
  historico: number[];
};

export type Indicador = {
  nome: string;
  valor: number;
  unidade: string;
  data: string;
  fonte: FonteIndicador;
};

export type RespostaCotacoes = {
  cotacoes: Cotacao[];
  fonte: FonteMercado;
  atualizadoEm: string;
};

export type RespostaIndicadores = {
  indicadores: Indicador[];
  fonte: FonteIndicador;
  atualizadoEm: string;
};

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

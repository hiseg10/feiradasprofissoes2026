import type { Cotacao, Indicador } from "./types";

export const COTACOES_MOCK: Cotacao[] = [
  {
    simbolo: "PETR4",
    nome: "Petrobras PN",
    preco: 38.42,
    variacao: 0.56,
    variacaoPercentual: 1.48,
    moeda: "BRL",
    atualizadoEm: "",
    fonte: "mock",
    historico: [36.9, 37.2, 36.8, 37.4, 37.1, 37.8, 38.1, 38.42],
  },
  {
    simbolo: "VALE3",
    nome: "Vale ON",
    preco: 61.87,
    variacao: -0.72,
    variacaoPercentual: -1.15,
    moeda: "BRL",
    atualizadoEm: "",
    fonte: "mock",
    historico: [63.4, 63.1, 62.8, 62.5, 62.9, 62.3, 62.1, 61.87],
  },
  {
    simbolo: "ITUB4",
    nome: "Itaú Unibanco PN",
    preco: 34.15,
    variacao: 0.23,
    variacaoPercentual: 0.68,
    moeda: "BRL",
    atualizadoEm: "",
    fonte: "mock",
    historico: [33.2, 33.5, 33.4, 33.8, 33.7, 33.9, 34.0, 34.15],
  },
  {
    simbolo: "BBAS3",
    nome: "Banco do Brasil ON",
    preco: 27.63,
    variacao: 0.41,
    variacaoPercentual: 1.51,
    moeda: "BRL",
    atualizadoEm: "",
    fonte: "mock",
    historico: [26.4, 26.8, 26.6, 27.0, 27.2, 27.1, 27.4, 27.63],
  },
  {
    simbolo: "WEGE3",
    nome: "WEG ON",
    preco: 52.9,
    variacao: -0.35,
    variacaoPercentual: -0.66,
    moeda: "BRL",
    atualizadoEm: "",
    fonte: "mock",
    historico: [54.1, 53.8, 53.9, 53.4, 53.5, 53.1, 53.0, 52.9],
  },
  {
    simbolo: "B3SA3",
    nome: "B3 ON",
    preco: 12.48,
    variacao: 0.12,
    variacaoPercentual: 0.97,
    moeda: "BRL",
    atualizadoEm: "",
    fonte: "mock",
    historico: [12.1, 12.2, 12.0, 12.3, 12.2, 12.4, 12.35, 12.48],
  },
  {
    simbolo: "MGLU3",
    nome: "Magazine Luiza ON",
    preco: 9.21,
    variacao: -0.18,
    variacaoPercentual: -1.92,
    moeda: "BRL",
    atualizadoEm: "",
    fonte: "mock",
    historico: [9.8, 9.6, 9.7, 9.5, 9.4, 9.35, 9.3, 9.21],
  },
  {
    simbolo: "EGIE3",
    nome: "Engie Brasil ON",
    preco: 41.36,
    variacao: 0.29,
    variacaoPercentual: 0.71,
    moeda: "BRL",
    atualizadoEm: "",
    fonte: "mock",
    historico: [40.4, 40.7, 40.6, 40.9, 41.0, 41.1, 41.2, 41.36],
  },
  {
    simbolo: "HGLG11",
    nome: "CSHG Logística FII",
    preco: 162.4,
    variacao: 0.5,
    variacaoPercentual: 0.31,
    moeda: "BRL",
    atualizadoEm: "",
    fonte: "mock",
    historico: [160.8, 161.2, 161.0, 161.6, 161.9, 162.0, 162.1, 162.4],
  },
  {
    simbolo: "MXRF11",
    nome: "Maxi Renda FII",
    preco: 10.32,
    variacao: 0.02,
    variacaoPercentual: 0.19,
    moeda: "BRL",
    atualizadoEm: "",
    fonte: "mock",
    historico: [10.2, 10.24, 10.22, 10.27, 10.25, 10.29, 10.3, 10.32],
  },
];

export const INDICADORES_MOCK: Indicador[] = [
  { nome: "Selic", valor: 12.25, unidade: "% ao ano", data: "04/11/2026", fonte: "mock" },
  { nome: "CDI", valor: 12.15, unidade: "% ao ano", data: "04/11/2026", fonte: "mock" },
  { nome: "IPCA (mês)", valor: 0.38, unidade: "%", data: "04/11/2026", fonte: "mock" },
];

export function gerarCotacaoMock(simbolo: string): Cotacao {
  const base = 20 + (simbolo.length * 7) % 60;
  const historico = Array.from({ length: 8 }, (_, i) =>
    Number((base + Math.sin(i + simbolo.length) * 1.8).toFixed(2)),
  );
  const preco = historico[historico.length - 1];
  const anterior = historico[historico.length - 2] || preco;
  const variacao = Number((preco - anterior).toFixed(2));
  return {
    simbolo,
    nome: simbolo,
    preco,
    variacao,
    variacaoPercentual: Number(((variacao / anterior) * 100).toFixed(2)),
    moeda: "BRL",
    atualizadoEm: "",
    fonte: "mock",
    historico,
  };
}

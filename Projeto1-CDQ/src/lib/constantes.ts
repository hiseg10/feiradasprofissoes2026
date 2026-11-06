export const CATEGORIAS = [
  { valor: "eletronicos", rotulo: "Eletrônicos" },
  { valor: "celulares", rotulo: "Celulares" },
  { valor: "moveis", rotulo: "Móveis" },
  { valor: "eletrodomesticos", rotulo: "Eletrodomésticos" },
  { valor: "roupas", rotulo: "Roupas e calçados" },
  { valor: "livros", rotulo: "Livros e estudos" },
  { valor: "esportes", rotulo: "Esportes" },
  { valor: "brinquedos", rotulo: "Brinquedos" },
  { valor: "servicos", rotulo: "Serviços" },
  { valor: "outros", rotulo: "Outros" },
] as const;

export type Categoria = (typeof CATEGORIAS)[number]["valor"];

export function rotuloCategoria(valor: string): string {
  return CATEGORIAS.find((c) => c.valor === valor)?.rotulo ?? "Outros";
}

export const CONDICOES = [
  { valor: "novo", rotulo: "Novo" },
  { valor: "seminovo", rotulo: "Seminovo" },
  { valor: "usado", rotulo: "Usado" },
  { valor: "nao_aplicavel", rotulo: "Não se aplica" },
] as const;

export function rotuloCondicao(valor: string): string {
  return CONDICOES.find((c) => c.valor === valor)?.rotulo ?? "Usado";
}

export const STATUS_ANUNCIO = ["pendente", "aprovado", "rejeitado", "vendido"] as const;
export type StatusAnuncio = (typeof STATUS_ANUNCIO)[number];

export const STATUS_ANUNCIO_LABEL: Record<StatusAnuncio, string> = {
  pendente: "Em análise",
  aprovado: "Publicado",
  rejeitado: "Rejeitado",
  vendido: "Vendido",
};

export const STATUS_ANUNCIO_COR: Record<StatusAnuncio, string> = {
  pendente: "bg-amber-100 text-amber-800",
  aprovado: "bg-brand-100 text-brand-800",
  rejeitado: "bg-red-100 text-red-700",
  vendido: "bg-slate-100 text-slate-600",
};

export const STATUS_USUARIO = ["pendente", "aprovado", "bloqueado"] as const;
export type StatusUsuario = (typeof STATUS_USUARIO)[number];

export const STATUS_USUARIO_LABEL: Record<StatusUsuario, string> = {
  pendente: "Aguardando aprovação",
  aprovado: "Aprovado",
  bloqueado: "Bloqueado",
};

export const DIAS_IMPULSIONAMENTO = [3, 7, 15, 30] as const;
export const PRECO_DIA_PADRAO_CENTAVOS = 500;

export const CORES_CATEGORIA: Record<string, string> = {
  eletronicos: "from-sky-400 to-sky-600",
  celulares: "from-indigo-400 to-indigo-600",
  moveis: "from-amber-400 to-amber-600",
  eletrodomesticos: "from-cyan-400 to-cyan-600",
  roupas: "from-rose-400 to-rose-600",
  livros: "from-violet-400 to-violet-600",
  esportes: "from-emerald-400 to-emerald-600",
  brinquedos: "from-pink-400 to-pink-600",
  servicos: "from-teal-400 to-teal-600",
  outros: "from-slate-400 to-slate-600",
};

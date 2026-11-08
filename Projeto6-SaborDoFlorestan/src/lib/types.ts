export type Categoria = "Salgados" | "Doces" | "Bebidas" | "Combos";

export const CATEGORIAS: Categoria[] = [
  "Salgados",
  "Doces",
  "Bebidas",
  "Combos",
];

export type Produto = {
  id: number;
  nome: string;
  descricao: string | null;
  categoria: Categoria;
  precoCentavos: number;
  estoque: number;
  ativo: number;
  emoji: string;
};

export type ItemCarrinho = {
  produtoId: number;
  quantidade: number;
};

export type ItemPedido = {
  produtoId: number;
  nome: string;
  emoji: string;
  precoCentavos: number;
  quantidade: number;
};

export type FormaPagamento = "pix" | "cartao" | "dinheiro";

export type Cargo = "caixa" | "atendente" | "garçon" | "operador_cozinha";

export type Equipe = {
  id: number;
  nome: string;
  cargo: Cargo;
  codigoOperacao: string | null;
  ativo: number;
  criadoEm: string;
  atualizadoEm: string;
};

export type StatusPedido =
  | "novo"
  | "preparando"
  | "pronto"
  | "entregue"
  | "cancelado";

export type Pedido = {
  id: number;
  numero: string;
  cliente: string | null;
  totalCentavos: number;
  formaPagamento: FormaPagamento;
  detalhePagamento: string | null;
  valorRecebidoCentavos: number;
  trocoCentavos: number;
  status: StatusPedido;
  pago: boolean;
  equipeId: number | null;
  criadoEm: string;
  atualizadoEm: string;
  itens: ItemPedido[];
};

export type Resumo = {
  totalCentavos: number;
  pedidos: number;
  ticketMedioCentavos: number;
  porForma: Record<FormaPagamento, number>;
  topProdutos: {
    nome: string;
    quantidade: number;
    totalCentavos: number;
  }[];
};

export type ModoOperacao = "cliente" | "caixa" | "atendente" | "operador";

export type Sessao = {
  modo: ModoOperacao;
  operadorId: number | null;
  operadorNome: string | null;
  operadorCargo: Cargo | null;
};

export const MODOS: ModoOperacao[] = [
  "cliente",
  "caixa",
  "atendente",
  "operador",
];

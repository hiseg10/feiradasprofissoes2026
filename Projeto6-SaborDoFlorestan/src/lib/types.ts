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

export type StatusPedido =
  | "pago"
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

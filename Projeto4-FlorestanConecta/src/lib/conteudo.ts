export type Categoria = "Comer" | "Artesanato" | "Turismo" | "Serviços" | "Agro";

export type Ponto = {
  slug: string;
  nome: string;
  categoria: Categoria;
  emoji: string;
  descricao: string;
  endereco: string;
  horario: string;
  telefone?: string;
  destaque?: boolean;
  dica: string;
  tags: string[];
};

export const CATEGORIAS: Categoria[] = ["Comer", "Artesanato", "Turismo", "Serviços", "Agro"];

export const CORES_CATEGORIA: Record<
  Categoria,
  { chip: string; gradiente: string; texto: string }
> = {
  Comer: {
    chip: "bg-amber-100 text-amber-800",
    gradiente: "from-amber-400 to-orange-500",
    texto: "text-amber-700",
  },
  Artesanato: {
    chip: "bg-rose-100 text-rose-700",
    gradiente: "from-rose-400 to-pink-500",
    texto: "text-rose-700",
  },
  Turismo: {
    chip: "bg-sky-100 text-sky-700",
    gradiente: "from-sky-400 to-cyan-500",
    texto: "text-sky-700",
  },
  Serviços: {
    chip: "bg-slate-200 text-slate-700",
    gradiente: "from-slate-500 to-slate-700",
    texto: "text-slate-700",
  },
  Agro: {
    chip: "bg-emerald-100 text-emerald-700",
    gradiente: "from-emerald-400 to-teal-500",
    texto: "text-emerald-700",
  },
};

/**
 * Dados de demonstração.
 * Substitua nomes, endereços, horários e contatos pelos parceiros reais
 * antes da feira, com autorização dos estabelecimentos.
 */
export const PONTOS: Ponto[] = [
  {
    slug: "cafe-do-bairro",
    nome: "Café do Bairro",
    categoria: "Comer",
    emoji: "☕",
    descricao:
      "Café de esquina com torra local, pães de fermentação natural e mesas na calçada. Ponto de encontro clássico da manhã.",
    endereco: "Rua das Acácias, 120",
    horario: "Seg a sáb, 7h às 18h",
    telefone: "(00) 00000-0000",
    destaque: true,
    dica: "Peça o café coado da casa e o pão de queijo de fermentação natural.",
    tags: ["café", "pão", "café da manhã", "encontro"],
  },
  {
    slug: "padaria-pao-quentinho",
    nome: "Padaria Pão Quentinho",
    categoria: "Comer",
    emoji: "🥖",
    descricao:
      "Padaria de bairro com produção própria, salgados assados na hora e bolos caseiros por encomenda.",
    endereco: "Avenida Central, 45",
    horario: "Todos os dias, 6h às 20h",
    telefone: "(00) 00000-0001",
    dica: "O pão francês sai quentinho às 6h30 e às 16h.",
    tags: ["padaria", "bolo", "salgado", "pão"],
  },
  {
    slug: "cantinho-do-acai",
    nome: "Cantinho do Açaí",
    categoria: "Comer",
    emoji: "🍧",
    descricao:
      "Açaí com acompanhamentos regionais, vitaminas de frutas e lanches leves. Opção rápida para a tarde.",
    endereco: "Rua do Comércio, 210",
    horario: "Ter a dom, 12h às 22h",
    destaque: true,
    dica: "Experimente o açaí com farinha de tapioca e banana.",
    tags: ["açaí", "lanche", "sobremesa", "tarde"],
  },
  {
    slug: "atelie-maos-de-barro",
    nome: "Ateliê Mãos de Barro",
    categoria: "Artesanato",
    emoji: "🏺",
    descricao:
      "Ateliê de cerâmica que produz peças utilitárias e decorativas. Oferece oficinas para iniciantes em alguns fins de semana.",
    endereco: "Rua do Artesão, 88",
    horario: "Qua a sáb, 9h às 17h",
    telefone: "(00) 00000-0002",
    destaque: true,
    dica: "Pergunte sobre as oficinas de torno; as vagas são limitadas.",
    tags: ["cerâmica", "oficina", "presente", "arte"],
  },
  {
    slug: "oficina-de-bordado",
    nome: "Oficina de Bordado",
    categoria: "Artesanato",
    emoji: "🧵",
    descricao:
      "Grupo de bordadeiras que produz toalhas, bolsas e peças com motivos locais. Encomendas personalizadas.",
    endereco: "Praça das Acácias, 12",
    horario: "Seg a sex, 13h às 18h",
    dica: "As peças com motivos da praça são feitas por encomenda.",
    tags: ["bordado", "artesanato", "encomenda", "presente"],
  },
  {
    slug: "feira-livre",
    nome: "Feira Livre do Bairro",
    categoria: "Agro",
    emoji: "🥬",
    descricao:
      "Feira semanal com hortaliças, frutas da estação e produtos de pequenos produtores da região.",
    endereco: "Praça das Acácias",
    horario: "Sábados, 6h às 13h",
    destaque: true,
    dica: "Chegue cedo para encontrar as verduras mais frescas e conversar com os produtores.",
    tags: ["feira", "fruta", "verdura", "produtor", "orgânico"],
  },
  {
    slug: "museu-da-memoria-local",
    nome: "Museu da Memória Local",
    categoria: "Turismo",
    emoji: "🏛️",
    descricao:
      "Acervo de fotos, objetos e relatos sobre a história do bairro. Visitas guiadas com moradores antigos.",
    endereco: "Rua da Estação, 300",
    horario: "Qui a dom, 10h às 16h",
    telefone: "(00) 00000-0003",
    dica: "Pergunte pela visita guiada; ela costuma acontecer às 14h.",
    tags: ["museu", "história", "visita guiada", "cultura"],
  },
  {
    slug: "praca-das-acacias",
    nome: "Praça das Acácias",
    categoria: "Turismo",
    emoji: "🌳",
    descricao:
      "Praça arborizada com parquinho, quadra e feira nos fins de semana. Boa para caminhada e piquenique.",
    endereco: "Praça das Acácias, s/n",
    horario: "Aberto 24h",
    dica: "No fim da tarde a luz fica ótima para fotos entre as árvores.",
    tags: ["praça", "parquinho", "caminhada", "foto", "família"],
  },
  {
    slug: "bicicletaria-roda-livre",
    nome: "Bicicletaria Roda Livre",
    categoria: "Serviços",
    emoji: "🚲",
    descricao:
      "Conserto e manutenção de bicicletas, aluguel por período e dicas de rotas seguras pelo bairro.",
    endereco: "Rua das Palmeiras, 55",
    horario: "Seg a sáb, 8h às 18h",
    telefone: "(00) 00000-0004",
    dica: "Pergunte pelo mapa de rotas tranquilas para pedalar com crianças.",
    tags: ["bicicleta", "aluguel", "conserto", "rota"],
  },
  {
    slug: "barbearia-estilo",
    nome: "Barbearia Estilo",
    categoria: "Serviços",
    emoji: "💈",
    descricao:
      "Barbearia tradicional com atendimento por ordem de chegada, corte, barba e papo bom.",
    endereco: "Rua do Comércio, 150",
    horario: "Ter a sáb, 9h às 19h",
    dica: "Vá no início da manhã para evitar fila no sábado.",
    tags: ["barbearia", "corte", "barba", "serviço"],
  },
];

export function buscarPonto(slug: string): Ponto | undefined {
  return PONTOS.find((ponto) => ponto.slug === slug);
}

export function contextoGuia(): string {
  const linhas = PONTOS.map((ponto) => {
    const telefone = ponto.telefone ? ` Telefone: ${ponto.telefone}.` : "";
    return `- ${ponto.nome} (${ponto.categoria}): ${ponto.descricao} Endereço: ${ponto.endereco}. Horário: ${ponto.horario}.${telefone} Dica: ${ponto.dica}`;
  });
  return [
    "Pontos cadastrados no guia (dados de demonstração, substitua pelos parceiros reais):",
    ...linhas,
  ].join("\n");
}

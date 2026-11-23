export type Categoria = "Comer" | "Artesanato" | "Turismo" | "Serviços" | "Agro";

export type Coordenadas = {
  lat: number;
  lng: number;
};

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
  coordenadas?: Coordenadas;
};

export const BAIRRO = "Deus Quer";
export const CIDADE = "Teresina – PI";
export const LOCAL = `${BAIRRO}, ${CIDADE}`;

export const MAPS_BAIRRO =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent(`${BAIRRO}, ${CIDADE}`);

export const MAPS_EMBED =
  "https://www.openstreetmap.org/export/embed.html?bbox=-42.7165%2C-5.1320%2C-42.6920%2C-5.1080&layer=mapnik&marker=-5.1189%2C-42.6981";

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
 * Pontos públicos do bairro Deus Quer, em Teresina – PI.
 * Dados geográficos do OpenStreetMap (© colaboradores OSM, ODbL).
 * Horários, contatos e funcionamento devem ser confirmados com cada local.
 * As categorias Artesanato e Agro ficam reservadas para parceiros locais.
 */
export const PONTOS: Ponto[] = [
  {
    slug: "praca-do-deus-quer",
    nome: "Praça do Deus Quer",
    categoria: "Turismo",
    emoji: "🌳",
    descricao:
      "Praça pública do bairro, com área de convivência e espaço usado pelos moradores para caminhada, encontros e atividades ao ar livre.",
    endereco: "Rua Cecy Nepomuceno Pires, Deus Quer, Teresina – PI",
    horario: "Acesso livre",
    destaque: true,
    dica: "Vá no fim da tarde, quando o movimento de moradores é maior; confirme a programação de eventos da comunidade.",
    tags: ["praça", "lazer", "caminhada", "família", "deus quer"],
    coordenadas: { lat: -5.1188903, lng: -42.6981404 },
  },
  {
    slug: "gabs-burguer",
    nome: "Gabs Burguer",
    categoria: "Comer",
    emoji: "🍔",
    descricao:
      "Hamburgueria na Avenida Luiz Vieira, no bairro Deus Quer. Consulte os canais oficiais para cardápio, horários e pedidos.",
    endereco: "Avenida Luiz Vieira, Deus Quer, Teresina – PI",
    horario: "Confirme horários e pedidos nos canais oficiais",
    destaque: true,
    dica: "Confirme cardápio, horário e forma de pedido antes de sair; o local aparece como acesso recente no mapa do bairro.",
    tags: ["hambúrguer", "lanche", "comida", "noite", "deus quer"],
  },
  {
    slug: "ubs-deus-quer",
    nome: "UBS Deus Quer",
    categoria: "Serviços",
    emoji: "🩺",
    descricao:
      "Unidade Básica de Saúde que atende a comunidade do Deus Quer e região, com serviços de atenção primária.",
    endereco: "Bairro Deus Quer, Teresina – PI",
    horario: "Dias úteis; confirme atendimento e agendamento",
    destaque: true,
    dica: "Leve documento com foto e cartão do SUS; confirme o horário de funcionamento pelo canal oficial da unidade.",
    tags: ["saúde", "ubs", "atendimento", "sus", "deus quer"],
    coordenadas: { lat: -5.120867, lng: -42.703778 },
  },
  {
    slug: "ue-professor-florestan-fernandes",
    nome: "UE Professor Florestan Fernandes",
    categoria: "Serviços",
    emoji: "🏫",
    descricao:
      "Unidade escolar que dá nome ao projeto Florestan Conecta, no Conjunto Recanto dos Pássaros, atendendo estudantes da comunidade.",
    endereco: "Rua Rodoufo da Costa e Silva, Conj. Recanto dos Pássaros, Deus Quer, Teresina – PI",
    horario: "Dias letivos; confirme horários com a escola",
    destaque: true,
    dica: "Visitas e eventos devem ser combinados antes com a direção da escola.",
    tags: ["escola", "educação", "florestan", "feira das profissões", "deus quer"],
    coordenadas: { lat: -5.1206769, lng: -42.7077829 },
  },
  {
    slug: "escola-municipal-bom-principio",
    nome: "Escola Municipal Bom Princípio",
    categoria: "Serviços",
    emoji: "🎒",
    descricao:
      "Escola municipal de referência no bairro, na Avenida Professor Camilo Filho, atendendo crianças e adolescentes da comunidade.",
    endereco: "Avenida Professor Camilo Filho, Deus Quer, Teresina – PI",
    horario: "Dias letivos; confirme horários com a escola",
    destaque: true,
    dica: "Visitas e eventos devem ser combinados antes com a direção da escola.",
    tags: ["escola", "educação", "criança", "deus quer"],
    coordenadas: { lat: -5.125925, lng: -42.709117 },
  },
  {
    slug: "conjunto-recanto-dos-passaros",
    nome: "Conjunto Recanto dos Pássaros",
    categoria: "Turismo",
    emoji: "🐦",
    descricao:
      "Conjunto residencial do bairro Deus Quer, usado como referência de endereço e ponto de partida para caminhadas pela região.",
    endereco: "Conjunto Recanto dos Pássaros, Deus Quer, Teresina – PI",
    horario: "Acesso livre às vias públicas",
    destaque: true,
    dica: "A área é residencial: mantenha o volume baixo e respeite o sossego dos moradores.",
    tags: ["conjunto", "residencial", "caminhada", "recanto dos pássaros", "deus quer"],
    coordenadas: { lat: -5.1174918, lng: -42.7073481 },
  },
  {
    slug: "point-da-batatinha",
    nome: "Point da Batatinha",
    categoria: "Comer",
    emoji: "🍟",
    descricao:
      "Lanchonete de comida rápida na Rua Cecy Nepomuceno Pires, no bairro Deus Quer. Confirme cardápio e horário.",
    endereco: "Rua Cecy Nepomuceno Pires, Deus Quer, Teresina – PI",
    horario: "Confirme horários nos canais oficiais",
    dica: "Confirme cardápio e horário; é uma opção de lanche rápido perto da Praça do Deus Quer.",
    tags: ["lanche", "batata", "comida rápida", "deus quer"],
    coordenadas: { lat: -5.118606, lng: -42.698134 },
  },
  {
    slug: "bar-do-vicente",
    nome: "Bar do Vicente",
    categoria: "Comer",
    emoji: "🍺",
    descricao:
      "Bar de bairro na região da Praça do Deus Quer. Confirme horário e formas de pagamento.",
    endereco: "Bairro Deus Quer, Teresina – PI",
    horario: "Confirme horários de funcionamento",
    dica: "Vá cedo no fim de semana; confirme horário e formas de pagamento.",
    tags: ["bar", "bebida", "encontro", "noite", "deus quer"],
    coordenadas: { lat: -5.119005, lng: -42.697397 },
  },
  {
    slug: "bar-calcada-da-fama",
    nome: "Bar Calçada da Fama",
    categoria: "Comer",
    emoji: "🎶",
    descricao:
      "Bar próximo à Praça do Deus Quer, com clima de encontro de bairro. Confirme a programação do dia.",
    endereco: "Bairro Deus Quer, Teresina – PI",
    horario: "Confirme horários de funcionamento",
    dica: "Confirme a programação do dia antes de ir.",
    tags: ["bar", "música", "encontro", "fim de tarde", "deus quer"],
    coordenadas: { lat: -5.119365, lng: -42.698883 },
  },
  {
    slug: "tusma-templo-de-umbanda",
    nome: "TUSMA – Templo de Umbanda",
    categoria: "Turismo",
    emoji: "🛐",
    descricao:
      "Templo de Umbanda no bairro Deus Quer, espaço de prática religiosa e de valorização da cultura afro-brasileira.",
    endereco: "Avenida Luiz Vieira, Deus Quer, Teresina – PI",
    horario: "Consulte os horários de culto",
    dica: "Respeite os horários de culto e só participe de eventos abertos ao público; confirme a programação com antecedência.",
    tags: ["umbanda", "religião", "cultura", "templo", "deus quer"],
  },
  {
    slug: "igreja-adventista-deus-quer",
    nome: "Igreja Adventista do Sétimo Dia – Deus Quer",
    categoria: "Turismo",
    emoji: "⛪",
    descricao:
      "Igreja do bairro com atividades religiosas e comunitárias; consulte a programação semanal.",
    endereco: "Bairro Deus Quer, Teresina – PI",
    horario: "Confirme a programação de cultos",
    dica: "Confirme os horários dos cultos antes de visitar.",
    tags: ["igreja", "religião", "culto", "comunidade", "deus quer"],
    coordenadas: { lat: -5.119764, lng: -42.700564 },
  },
  {
    slug: "congregacao-crista-deus-quer",
    nome: "Congregação Cristã no Brasil – Deus Quer",
    categoria: "Turismo",
    emoji: "🕊️",
    descricao:
      "Templo da Congregação Cristã no Brasil no bairro Deus Quer, com cultos e encontros da comunidade.",
    endereco: "Rua Cecy Nepomuceno Pires, Deus Quer, Teresina – PI",
    horario: "Confirme a programação de cultos",
    dica: "Confirme os horários e evite visitas durante os cultos sem combinado prévio.",
    tags: ["igreja", "religião", "culto", "comunidade", "deus quer"],
    coordenadas: { lat: -5.119154, lng: -42.699998 },
  },
  {
    slug: "capela-nossa-senhora-de-lourdes",
    nome: "Capela de Nossa Senhora de Lourdes",
    categoria: "Turismo",
    emoji: "🙏",
    descricao:
      "Capela católica na Avenida Professor Camilo Filho, ligada à APSA, com celebrações e atividades da comunidade.",
    endereco: "Avenida Professor Camilo Filho, Deus Quer, Teresina – PI",
    horario: "Confirme a programação de missas",
    dica: "Consulte a paróquia ou a APSA para confirmar missas e eventos.",
    tags: ["igreja", "capela", "religião", "missa", "deus quer"],
  },
  {
    slug: "quadra-poliesportiva-deus-quer",
    nome: "Quadra Poliesportiva do Deus Quer",
    categoria: "Turismo",
    emoji: "🏀",
    descricao:
      "Quadra poliesportiva do bairro, voltada a jogos e atividades de lazer da comunidade.",
    endereco: "Bairro Deus Quer, Teresina – PI",
    horario: "Acesso conforme uso da comunidade",
    dica: "Combine o uso com a comunidade local e leve água; confirme se há atividades programadas.",
    tags: ["esporte", "quadra", "jogo", "lazer", "deus quer"],
  },
  {
    slug: "campo-society-recanto-dos-passaros",
    nome: "Campo Society Recanto dos Pássaros",
    categoria: "Turismo",
    emoji: "⚽",
    descricao:
      "Campo society no Conjunto Recanto dos Pássaros, voltado a partidas e treinos da comunidade.",
    endereco: "Rua Seu Olívar, Conj. Recanto dos Pássaros, Deus Quer, Teresina – PI",
    horario: "Consulte a agenda de jogos",
    dica: "Confirme a reserva do campo com os responsáveis antes de ir.",
    tags: ["futebol", "esporte", "campo", "lazer", "deus quer"],
    coordenadas: { lat: -5.1184968, lng: -42.7106059 },
  },
  {
    slug: "academia-aero-fit",
    nome: "Academia Aero Fit",
    categoria: "Serviços",
    emoji: "🏋️",
    descricao:
      "Academia de bairro na Avenida Luiz Vieira. Consulte planos, horários e atividades oferecidas.",
    endereco: "Avenida Luiz Vieira, Deus Quer, Teresina – PI",
    horario: "Consulte planos e horários",
    dica: "Confirme planos, horários e a necessidade de avaliação física antes de começar.",
    tags: ["academia", "exercício", "saúde", "esporte", "deus quer"],
    coordenadas: { lat: -5.119618, lng: -42.698202 },
  },
  {
    slug: "estudio-alyne-nayara-beauty",
    nome: "Estúdio Alyne Nayara Beauty",
    categoria: "Serviços",
    emoji: "💅",
    descricao:
      "Estúdio de beleza no bairro Deus Quer. Agende pelo contato oficial e confirme serviços, valores e horários.",
    endereco: "Quadra B1, Casa 1, Deus Quer, Teresina – PI",
    horario: "Atendimento com agendamento",
    dica: "Agende pelo contato oficial e confirme valores e horários.",
    tags: ["beleza", "estética", "cabelo", "agendamento", "deus quer"],
    coordenadas: { lat: -5.116921, lng: -42.704274 },
  },
  {
    slug: "cmei-ramses-bahury",
    nome: "CMEI Ramses Bahury de Sousa Ramos",
    categoria: "Serviços",
    emoji: "🧸",
    descricao:
      "Centro Municipal de Educação Infantil que atende crianças do bairro Deus Quer.",
    endereco: "Rua Cecy Nepomuceno Pires, Deus Quer, Teresina – PI",
    horario: "Dias letivos; confirme com a unidade",
    dica: "Matrículas e visitas devem ser tratadas diretamente com a direção da unidade.",
    tags: ["educação", "infância", "creche", "escola", "deus quer"],
    coordenadas: { lat: -5.119230, lng: -42.701415 },
  },
  {
    slug: "cmei-recanto-dos-passaros",
    nome: "CMEI Recanto dos Pássaros",
    categoria: "Serviços",
    emoji: "🎨",
    descricao:
      "Centro Municipal de Educação Infantil no Conjunto Recanto dos Pássaros, no bairro Deus Quer.",
    endereco: "Rua Dom Henrique Soares, Conj. Recanto dos Pássaros, Deus Quer, Teresina – PI",
    horario: "Dias letivos; confirme com a unidade",
    dica: "Confirme horários e documentos para matrícula diretamente com a unidade.",
    tags: ["educação", "infância", "creche", "escola", "deus quer"],
    coordenadas: { lat: -5.1180185, lng: -42.7094858 },
  },
];

export function buscarPonto(slug: string): Ponto | undefined {
  return PONTOS.find((ponto) => ponto.slug === slug);
}

export function categoriasComPontos(pontos: Ponto[] = PONTOS): Categoria[] {
  return CATEGORIAS.filter((categoria) =>
    pontos.some((ponto) => ponto.categoria === categoria),
  );
}

export function linkMapaPonto(ponto: Ponto): string {
  const alvo = ponto.coordenadas
    ? `${ponto.coordenadas.lat},${ponto.coordenadas.lng}`
    : `${ponto.nome}, ${ponto.endereco}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(alvo)}`;
}

export function contextoGuia(): string {
  const linhas = PONTOS.map((ponto) => {
    const telefone = ponto.telefone ? ` Telefone: ${ponto.telefone}.` : "";
    return `- ${ponto.nome} (${ponto.categoria}): ${ponto.descricao} Endereço: ${ponto.endereco}. Horário: ${ponto.horario}.${telefone} Dica: ${ponto.dica}`;
  });
  return [
    `Pontos cadastrados no bairro ${BAIRRO}, em ${CIDADE} (dados públicos do OpenStreetMap; confirme horários e funcionamento):`,
    ...linhas,
  ].join("\n");
}

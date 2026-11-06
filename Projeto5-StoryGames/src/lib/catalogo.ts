export type Avaliacao = {
  autor: string;
  nota: number;
  horas: number;
  texto: string;
  data: string;
};

export type Porte = "leve" | "medio" | "pesado";

export type Jogo = {
  slug: string;
  titulo: string;
  desenvolvedora: string;
  publicadora: string;
  lancamento: string;
  generos: string[];
  tags: string[];
  precoCentavos: number;
  desconto: number;
  nota: number;
  totalAvaliacoes: number;
  emoji: string;
  cores: [string, string];
  descricao: string;
  descricaoCurta: string;
  destaques: string[];
  porte: Porte;
  tempoMedioHoras: number;
  conquistas: number;
  destaque?: boolean;
  maisVendido?: boolean;
  avaliacoes: Avaliacao[];
};

function reviews(
  ...itens: [string, number, number, string, string][]
): Avaliacao[] {
  return itens.map(([autor, nota, horas, texto, data]) => ({
    autor,
    nota,
    horas,
    texto,
    data,
  }));
}

export const JOGOS: Jogo[] = [
  {
    slug: "a-ultima-estacao",
    titulo: "A Última Estação",
    desenvolvedora: "Linha Férrea Studio",
    publicadora: "Estúdio Aurora",
    lancamento: "2025-09-18",
    generos: ["Narrativo", "Mistério"],
    tags: ["Escolhas", "Emocional", "Finais múltiplos"],
    precoCentavos: 4990,
    desconto: 20,
    nota: 4.8,
    totalAvaliacoes: 1842,
    emoji: "🚂",
    cores: ["#0f766e", "#0f172a"],
    descricao:
      "Uma inspetora de trens chega a uma estação esquecida para investigar o desaparecimento de um passageiro. Cada conversa revela uma versão diferente da mesma noite. Suas escolhas mudam quem sai da estação — e quem fica.",
    descricaoCurta: "Um mistério de estação com escolhas que reescrevem a noite.",
    destaques: [
      "Diálogos com consequências reais",
      "Trilha sonora original gravada ao vivo",
      "Cinco finais diferentes",
    ],
    porte: "medio",
    tempoMedioHoras: 6,
    conquistas: 18,
    destaque: true,
    maisVendido: true,
    avaliacoes: reviews(
      ["Marina", 5, 7, "Chorei no final e fiquei pensando na história por dias. A ambientação é impecável.", "12/10/2026"],
      ["Rafael", 4, 6, "Muito bom, mas o terceiro capítulo arrasta um pouco. Ainda assim, vale cada minuto.", "02/09/2026"],
    ),
  },
  {
    slug: "cartas-para-amanha",
    titulo: "Cartas para Amanhã",
    desenvolvedora: "Pequeno Papel",
    publicadora: "Estúdio Aurora",
    lancamento: "2026-02-14",
    generos: ["Narrativo", "Drama"],
    tags: ["Emocional", "Curto", "Escolhas"],
    precoCentavos: 2990,
    desconto: 0,
    nota: 4.7,
    totalAvaliacoes: 963,
    emoji: "✉️",
    cores: ["#7c3aed", "#1e1b4b"],
    descricao:
      "Uma pessoa comum encontra uma caixa de cartas que nunca enviou. Ao abrir cada uma, ela revisita decisões que mudaram o rumo de sua vida. Um jogo curto sobre arrependimento, coragem e recomeços.",
    descricaoCurta: "Cartas não enviadas, escolhas antigas e a chance de recomeçar.",
    destaques: [
      "História curta para uma noite",
      "Escolhas que mudam o tom da relação",
      "Modo maratona com comentários dos desenvolvedores",
    ],
    porte: "leve",
    tempoMedioHoras: 4,
    conquistas: 12,
    maisVendido: true,
    avaliacoes: reviews(
      ["Bia", 5, 4, "Um dos jogos mais bonitos que já joguei. Simples, mas certeiro.", "18/10/2026"],
      ["Caio", 4, 3, "Curto e emocionante. Só queria que tivesse mais um capítulo.", "21/08/2026"],
    ),
  },
  {
    slug: "o-farol-de-vidro",
    titulo: "O Farol de Vidro",
    desenvolvedora: "Costa Norte",
    publicadora: "Farol Editorial",
    lancamento: "2024-10-31",
    generos: ["Mistério", "Terror"],
    tags: ["Investigação", "Terror psicológico", "Trilha sonora"],
    precoCentavos: 5990,
    desconto: 15,
    nota: 4.6,
    totalAvaliacoes: 2210,
    emoji: "🕯️",
    cores: ["#b45309", "#1c1917"],
    descricao:
      "Um faroleiro aceita um turno de inverno em uma ilha onde a luz não chega ao mar. À medida que a névoa sobe, os hóspedes começam a lembrar de coisas que nunca aconteceram. Um terror lento sobre memória e culpa.",
    descricaoCurta: "Um farol isolado, uma névoa estranha e memórias que não são suas.",
    destaques: [
      "Terror psicológico sem sustos baratos",
      "Ilha explorável em ritmo próprio",
      "Trilha sonora com instrumentos acústicos",
    ],
    porte: "medio",
    tempoMedioHoras: 8,
    conquistas: 22,
    avaliacoes: reviews(
      ["Helena", 5, 9, "A tensão cresce devagar e gruda na gente. Final excelente.", "30/10/2026"],
      ["Diego", 4, 7, "Ótima atmosfera. Alguns puzzles são meio obscuros, mas nada que estrague.", "05/09/2026"],
    ),
  },
  {
    slug: "cidade-submersa",
    titulo: "Cidade Submersa",
    desenvolvedora: "Maré Alta Games",
    publicadora: "Estúdio Aurora",
    lancamento: "2025-06-12",
    generos: ["Aventura", "Ficção científica"],
    tags: ["Exploração", "Quebra-cabeça", "Mundo aberto"],
    precoCentavos: 7990,
    desconto: 0,
    nota: 4.5,
    totalAvaliacoes: 1540,
    emoji: "🌊",
    cores: ["#0e7490", "#082f49"],
    descricao:
      "Depois de uma enchente que não acabou, uma mergulhadora explora os prédios de uma cidade abandonada em busca do irmão. Cada andar submerso guarda uma pista e um quebra-cabeça ambiental. Um jogo sobre esperança em lugares improváveis.",
    descricaoCurta: "Explore uma cidade submersa e procure pistas entre os andares alagados.",
    destaques: [
      "Exploração vertical em uma cidade alagada",
      "Quebra-cabeças baseados em física",
      "Modo fotografia com filtros subaquáticos",
    ],
    porte: "pesado",
    tempoMedioHoras: 10,
    conquistas: 26,
    avaliacoes: reviews(
      ["Nina", 5, 12, "A exploração é recompensadora e o final me pegou de surpresa.", "14/10/2026"],
      ["Léo", 4, 9, "Bonito e criativo. Só achei o mapa um pouco confuso no começo.", "03/08/2026"],
    ),
  },
  {
    slug: "neon-e-memoria",
    titulo: "Neon & Memória",
    desenvolvedora: "Circuito Lunar",
    publicadora: "Pixel Norte",
    lancamento: "2026-03-07",
    generos: ["Ficção científica", "Narrativo"],
    tags: ["Cyberpunk", "Escolhas", "Emocional"],
    precoCentavos: 6990,
    desconto: 30,
    nota: 4.9,
    totalAvaliacoes: 3120,
    emoji: "🌃",
    cores: ["#db2777", "#1e1b4b"],
    descricao:
      "Em uma metrópole onde lembranças podem ser compradas e vendidas, uma entregadora encontra uma memória que não deveria existir. Para descobrir a verdade, ela precisa decidir em quem confiar — inclusive em si mesma.",
    descricaoCurta: "Uma memória proibida em uma cidade que comercializa lembranças.",
    destaques: [
      "Narrativa ramificada com seis finais",
      "Visual neon desenhado à mão",
      "Trilha sonora synthwave original",
    ],
    porte: "medio",
    tempoMedioHoras: 7,
    conquistas: 20,
    destaque: true,
    maisVendido: true,
    avaliacoes: reviews(
      ["Yuri", 5, 8, "Melhor narrativa que joguei este ano. As escolhas realmente importam.", "20/10/2026"],
      ["Camila", 5, 7, "Personagens incríveis e uma trilha sonora que eu ouço até hoje.", "11/10/2026"],
    ),
  },
  {
    slug: "a-casa-que-respira",
    titulo: "A Casa que Respira",
    desenvolvedora: "Sótão Rosa",
    publicadora: "Farol Editorial",
    lancamento: "2024-08-09",
    generos: ["Terror", "Mistério"],
    tags: ["Terror psicológico", "Investigação", "Curto"],
    precoCentavos: 3990,
    desconto: 0,
    nota: 4.4,
    totalAvaliacoes: 876,
    emoji: "🏚️",
    cores: ["#4c1d95", "#0f172a"],
    descricao:
      "Uma família se muda para uma casa que parece respirar. À noite, as paredes se movem e os objetos mudam de lugar. Um terror doméstico sobre o que preferimos não enxergar.",
    descricaoCurta: "Uma casa viva e uma família que finge não perceber.",
    destaques: [
      "Terror doméstico em primeira pessoa",
      "Ambiente que reage às suas escolhas",
      "Duração de uma sessão",
    ],
    porte: "leve",
    tempoMedioHoras: 5,
    conquistas: 14,
    avaliacoes: reviews(
      ["Ana", 4, 5, "Sustos bem construídos e uma atmosfera opressiva do jeito certo.", "25/09/2026"],
      ["Pedro", 4, 4, "Curto e eficiente. O final poderia ser mais claro.", "07/07/2026"],
    ),
  },
  {
    slug: "pequenos-mundos",
    titulo: "Pequenos Mundos",
    desenvolvedora: "Broto Studio",
    publicadora: "Estúdio Aurora",
    lancamento: "2025-11-21",
    generos: ["Cozy", "Aventura"],
    tags: ["Exploração", "Cozy", "Fotografia"],
    precoCentavos: 5490,
    desconto: 10,
    nota: 4.8,
    totalAvaliacoes: 2670,
    emoji: "🪴",
    cores: ["#15803d", "#052e16"],
    descricao:
      "Você herda uma estufa abandonada e decide transformá-la em um pequeno refúgio. Plante, decore, fotografe e conheça os vizinhos. Um jogo sem pressa sobre cuidar de lugares e de pessoas.",
    descricaoCurta: "Cultive uma estufa, decore seu cantinho e conheça os vizinhos.",
    destaques: [
      "Modo livre sem combate e sem cronômetro",
      "Sistema de fotografia com álbum compartilhável",
      "Trilha sonora acústica relaxante",
    ],
    porte: "pesado",
    tempoMedioHoras: 12,
    conquistas: 30,
    destaque: true,
    avaliacoes: reviews(
      ["Luiza", 5, 15, "Meu jogo conforto. Jogo um pouco todo dia e sempre descubro algo novo.", "16/10/2026"],
      ["Tomás", 5, 10, "Linda direção de arte e uma comunidade fictícia muito querida.", "29/09/2026"],
    ),
  },
  {
    slug: "rota-404",
    titulo: "Rota 404",
    desenvolvedora: "Estrada Vazia",
    publicadora: "Pixel Norte",
    lancamento: "2025-04-04",
    generos: ["Thriller", "Mistério"],
    tags: ["Investigação", "Tenso", "Escolhas"],
    precoCentavos: 4490,
    desconto: 0,
    nota: 4.3,
    totalAvaliacoes: 712,
    emoji: "🛣️",
    cores: ["#ca8a04", "#1c1917"],
    descricao:
      "Um motorista de aplicativo aceita uma corrida para um endereço que não existe. A cada parada, a cidade parece mais vazia e o passageiro mais familiar. Um thriller de estrada em tempo real.",
    descricaoCurta: "Uma corrida para um endereço inexistente que não termina bem.",
    destaques: [
      "Narrativa em tempo real",
      "Decisões rápidas com consequências",
      "Som ambiente binaural",
    ],
    porte: "medio",
    tempoMedioHoras: 6,
    conquistas: 16,
    avaliacoes: reviews(
      ["Ícaro", 4, 6, "A tensão é constante e o formato de corrida funciona muito bem.", "19/09/2026"],
      ["Sofia", 4, 5, "Gostei bastante, mas queria mais tempo com alguns personagens.", "08/08/2026"],
    ),
  },
  {
    slug: "entre-nos-o-mar",
    titulo: "Entre Nós, o Mar",
    desenvolvedora: "Maré Alta Games",
    publicadora: "Farol Editorial",
    lancamento: "2025-12-05",
    generos: ["Romance", "Narrativo"],
    tags: ["Emocional", "Curto", "Escolhas"],
    precoCentavos: 2490,
    desconto: 0,
    nota: 4.6,
    totalAvaliacoes: 1190,
    emoji: "💙",
    cores: ["#0284c7", "#0c4a6e"],
    descricao:
      "Duas pessoas que se conheceram em uma balsa voltam à mesma travessia anos depois. Entre conversas, silêncios e lembranças, elas precisam decidir se o que sentem ainda cabe no presente.",
    descricaoCurta: "Uma travessia de balsa e uma conversa que pode mudar tudo.",
    destaques: [
      "História curta e intensa",
      "Diálogos com escolhas afetivas",
      "Modo comentário com a equipe",
    ],
    porte: "leve",
    tempoMedioHoras: 3,
    conquistas: 10,
    maisVendido: true,
    avaliacoes: reviews(
      ["Clara", 5, 3, "Peguei no coração. É curto, mas cada diálogo tem peso.", "22/10/2026"],
      ["Murilo", 4, 3, "Bonito e bem escrito. Só queria um epílogo maior.", "01/09/2026"],
    ),
  },
  {
    slug: "a-biblioteca-de-cinzas",
    titulo: "A Biblioteca de Cinzas",
    desenvolvedora: "Pergaminho Negro",
    publicadora: "Estúdio Aurora",
    lancamento: "2026-01-23",
    generos: ["Fantasia", "Aventura"],
    tags: ["Exploração", "Fantasia", "Longo"],
    precoCentavos: 8990,
    desconto: 25,
    nota: 4.7,
    totalAvaliacoes: 1488,
    emoji: "📚",
    cores: ["#7f1d1d", "#1c1917"],
    descricao:
      "Uma biblioteca que queimou há séculos continua abrindo suas portas para leitores curiosos. Cada livro leva a um mundo diferente — e alguns deles querem ser lidos até o fim. Uma fantasia sobre histórias que nos transformam.",
    descricaoCurta: "Uma biblioteca em ruínas e livros que abrem passagens para outros mundos.",
    destaques: [
      "Cinco mundos para explorar",
      "Sistema de escolhas entre capítulos",
      "Arte conceitual com estética de gravura",
    ],
    porte: "pesado",
    tempoMedioHoras: 15,
    conquistas: 34,
    destaque: true,
    avaliacoes: reviews(
      ["Vitória", 5, 18, "Uma carta de amor aos livros. A direção de arte é absurda.", "13/10/2026"],
      ["Gustavo", 4, 14, "Muito criativo. Só a curva de dificuldade no final é irregular.", "27/09/2026"],
    ),
  },
  {
    slug: "sinal-perdido",
    titulo: "Sinal Perdido",
    desenvolvedora: "Antena Sul",
    publicadora: "Pixel Norte",
    lancamento: "2025-07-17",
    generos: ["Ficção científica", "Mistério"],
    tags: ["Ficção científica", "Investigação", "Solitário"],
    precoCentavos: 6490,
    desconto: 0,
    nota: 4.5,
    totalAvaliacoes: 934,
    emoji: "📡",
    cores: ["#4338ca", "#111827"],
    descricao:
      "Uma técnica de rádio em uma estação remota capta um sinal que parece vir do futuro. A cada mensagem decodificada, o presente muda de forma sutil. Uma história sobre solidão, tempo e escolhas.",
    descricaoCurta: "Um sinal de rádio do futuro muda o presente de uma estação isolada.",
    destaques: [
      "Quebra-cabeças de decodificação",
      "Narrativa em formato de diário",
      "Ambiente sonoro imersivo",
    ],
    porte: "medio",
    tempoMedioHoras: 9,
    conquistas: 24,
    avaliacoes: reviews(
      ["Renata", 5, 10, "Fiquei obcecada pelos sinais. O final amarra tudo muito bem.", "06/10/2026"],
      ["André", 4, 8, "Excelente ideia, execução muito boa. Alguns trechos técnicos demais.", "17/08/2026"],
    ),
  },
  {
    slug: "domingo-as-3h",
    titulo: "Domingo às 3h",
    desenvolvedora: "Café Frio",
    publicadora: "Farol Editorial",
    lancamento: "2025-05-30",
    generos: ["Cozy", "Drama"],
    tags: ["Cozy", "Emocional", "Curto"],
    precoCentavos: 1990,
    desconto: 0,
    nota: 4.2,
    totalAvaliacoes: 640,
    emoji: "☕",
    cores: ["#a16207", "#292524"],
    descricao:
      "Uma madrugada insone em uma lanchonete vazia. Entre uma xícara e outra, você conversa com pessoas que também não conseguem dormir. Um jogo sobre pequenas confissões e a beleza de estar acordado.",
    descricaoCurta: "Uma lanchonete de madrugada e conversas que só acontecem às 3h.",
    destaques: [
      "Experiência curta e contemplativa",
      "Diálogos com tom de conversa real",
      "Trilha sonora lo-fi original",
    ],
    porte: "leve",
    tempoMedioHoras: 2,
    conquistas: 8,
    avaliacoes: reviews(
      ["Elisa", 4, 2, "Gostoso de jogar antes de dormir. Me lembrou conversas reais.", "09/10/2026"],
      ["Bruno", 4, 2, "Simples e honesto. Cabe em uma madrugada.", "15/07/2026"],
    ),
  },
  {
    slug: "o-jardim-de-inverno",
    titulo: "O Jardim de Inverno",
    desenvolvedora: "Broto Studio",
    publicadora: "Estúdio Aurora",
    lancamento: "2026-04-10",
    generos: ["Cozy", "Romance"],
    tags: ["Cozy", "Romance", "Fotografia"],
    precoCentavos: 3490,
    desconto: 20,
    nota: 4.6,
    totalAvaliacoes: 810,
    emoji: "❄️",
    cores: ["#0369a1", "#1e3a8a"],
    descricao:
      "Um jardim botânico fecha para o inverno e só duas pessoas continuam lá: você e o novo jardineiro. Entre estufas, neve e plantas raras, uma relação floresce devagar. Um romance cozy sobre cuidado e paciência.",
    descricaoCurta: "Um jardim de inverno, dois jardineiros e uma relação que cresce devagar.",
    destaques: [
      "Romance sem pressa",
      "Sistema de fotografia botânica",
      "Trilha sonora com piano e cordas",
    ],
    porte: "medio",
    tempoMedioHoras: 6,
    conquistas: 16,
    avaliacoes: reviews(
      ["Lívia", 5, 7, "Fofo do começo ao fim. A química entre os personagens é muito natural.", "18/10/2026"],
      ["Otávio", 4, 6, "Gostoso de jogar no frio. Só queria mais variedade de plantas.", "02/10/2026"],
    ),
  },
  {
    slug: "vozes-do-porao",
    titulo: "Vozes do Porão",
    desenvolvedora: "Sótão Rosa",
    publicadora: "Farol Editorial",
    lancamento: "2024-10-13",
    generos: ["Terror"],
    tags: ["Terror psicológico", "Curto", "Solitário"],
    precoCentavos: 2790,
    desconto: 0,
    nota: 4.1,
    totalAvaliacoes: 522,
    emoji: "🔦",
    cores: ["#365314", "#1a2e05"],
    descricao:
      "Você desce ao porão para trocar um fusível e encontra uma porta que não deveria existir. A cada passo, uma voz diferente tenta convencê-lo a ficar. Um terror curto e claustrofóbico.",
    descricaoCurta: "Um porão, uma porta impossível e vozes que querem que você fique.",
    destaques: [
      "Terror em espaço fechado",
      "Sustos baseados em som",
      "Duração de uma sessão",
    ],
    porte: "leve",
    tempoMedioHoras: 4,
    conquistas: 12,
    avaliacoes: reviews(
      ["Iago", 4, 4, "Claustrofóbico na medida certa. Joguei de fone e me arrependi.", "28/09/2026"],
      ["Nath", 4, 3, "Bom susto, mas o final poderia ser mais trabalhado.", "12/06/2026"],
    ),
  },
  {
    slug: "depois-da-chuva",
    titulo: "Depois da Chuva",
    desenvolvedora: "Pequeno Papel",
    publicadora: "Farol Editorial",
    lancamento: "2025-08-22",
    generos: ["Drama", "Romance"],
    tags: ["Emocional", "Escolhas", "Finais múltiplos"],
    precoCentavos: 3290,
    desconto: 10,
    nota: 4.4,
    totalAvaliacoes: 705,
    emoji: "🌧️",
    cores: ["#475569", "#0f172a"],
    descricao:
      "Depois de uma tempestade, dois vizinhos encontram cartas antigas escondidas em um muro. Reconstruir a história de quem morou ali pode aproximá-los — ou revelar algo que preferiam não saber.",
    descricaoCurta: "Cartas escondidas em um muro e dois vizinhos reconstruindo o passado.",
    destaques: [
      "Três finais possíveis",
      "Sistema de confiança entre personagens",
      "Trilha sonora com violão",
    ],
    porte: "leve",
    tempoMedioHoras: 5,
    conquistas: 14,
    avaliacoes: reviews(
      ["Tainá", 5, 5, "Uma história delicada e bem contada. Me emocionou de um jeito inesperado.", "20/10/2026"],
      ["Vitor", 4, 5, "Ótimo ritmo. Só achei o primeiro ato um pouco lento.", "23/08/2026"],
    ),
  },
  {
    slug: "atlas-das-coisas-perdidas",
    titulo: "Atlas das Coisas Perdidas",
    desenvolvedora: "Pergaminho Negro",
    publicadora: "Estúdio Aurora",
    lancamento: "2026-05-15",
    generos: ["Aventura", "Fantasia"],
    tags: ["Exploração", "Fantasia", "Quebra-cabeça"],
    precoCentavos: 7490,
    desconto: 15,
    nota: 4.8,
    totalAvaliacoes: 1320,
    emoji: "🗺️",
    cores: ["#92400e", "#1c1917"],
    descricao:
      "Um mapa antigo mostra onde ficam todas as coisas que o mundo perdeu: bússolas, sonhos, nomes e até pessoas. Uma cartógrafa parte em busca de algo que ela mesma esqueceu. Uma aventura sobre memória e pertencimento.",
    descricaoCurta: "Um mapa das coisas perdidas e uma jornada para encontrar o que esquecemos.",
    destaques: [
      "Mundo em forma de mapa-múndi ilustrado",
      "Quebra-cabeças de rotas e símbolos",
      "Narração poética em português",
    ],
    porte: "pesado",
    tempoMedioHoras: 11,
    conquistas: 28,
    destaque: true,
    avaliacoes: reviews(
      ["Isabela", 5, 13, "Um dos mundos mais bonitos que já explorei. Cada canto tem uma história.", "17/10/2026"],
      ["Henrique", 4, 10, "Muito bonito e criativo. Alguns puzzles exigem caderninho.", "05/09/2026"],
    ),
  },
];

export function buscarJogo(slug: string): Jogo | undefined {
  return JOGOS.find((jogo) => jogo.slug === slug);
}

export function buscarJogos(slugs: string[]): Jogo[] {
  return slugs
    .map((slug) => buscarJogo(slug))
    .filter((jogo): jogo is Jogo => Boolean(jogo));
}

export function precoFinal(jogo: Jogo): number {
  return Math.round(jogo.precoCentavos * (1 - jogo.desconto / 100));
}

export function generosUnicos(): string[] {
  return Array.from(new Set(JOGOS.flatMap((jogo) => jogo.generos))).sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
}

export function jogosSemelhantes(jogo: Jogo, limite = 4): Jogo[] {
  return JOGOS.filter(
    (item) =>
      item.slug !== jogo.slug &&
      item.generos.some((genero) => jogo.generos.includes(genero)),
  ).slice(0, limite);
}

export const REQUISITOS: Record<
  Porte,
  { minimo: string[]; recomendado: string[] }
> = {
  leve: {
    minimo: ["Windows 10 64-bit", "Intel Core i3-6100", "4 GB de RAM", "Intel HD Graphics 530", "6 GB de espaço"],
    recomendado: ["Windows 11 64-bit", "Intel Core i5-8400", "8 GB de RAM", "GTX 1050", "8 GB de espaço"],
  },
  medio: {
    minimo: ["Windows 10 64-bit", "Intel Core i5-7400", "8 GB de RAM", "GTX 960", "12 GB de espaço"],
    recomendado: ["Windows 11 64-bit", "Intel Core i5-10400", "16 GB de RAM", "GTX 1660", "16 GB de espaço"],
  },
  pesado: {
    minimo: ["Windows 10 64-bit", "Intel Core i5-9400", "12 GB de RAM", "GTX 1060", "20 GB de espaço"],
    recomendado: ["Windows 11 64-bit", "Intel Core i7-11700", "16 GB de RAM", "RTX 3060", "24 GB de espaço"],
  },
};

export function obterRequisitos(jogo: Jogo) {
  return REQUISITOS[jogo.porte];
}

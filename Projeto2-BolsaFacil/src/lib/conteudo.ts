export type Modulo = {
  titulo: string;
  resumo: string;
  topicos: string[];
};

export type Trilha = {
  id: string;
  titulo: string;
  descricao: string;
  emoji: string;
  modulos: Modulo[];
};

export const TRILHAS: Trilha[] = [
  {
    id: "primeiros-passos",
    titulo: "Primeiros passos",
    descricao: "O básico para entender o que é mercado financeiro e como o dinheiro trabalha.",
    emoji: "🌱",
    modulos: [
      {
        titulo: "O que é o mercado financeiro?",
        resumo: "É o ambiente onde quem tem dinheiro empresta ou investe para quem precisa de capital.",
        topicos: [
          "Famílias, empresas e governo se conectam por meio de bancos, corretoras e da bolsa.",
          "O preço do dinheiro no tempo é a taxa de juros.",
          "Investir é trocar consumo hoje por consumo maior no futuro, assumindo riscos.",
        ],
      },
      {
        titulo: "Renda fixa x renda variável",
        resumo: "A diferença está em saber (ou não) quanto vai render antes de investir.",
        topicos: [
          "Renda fixa: a regra de remuneração é combinada no início (ex.: CDB, Tesouro).",
          "Renda variável: o retorno depende do mercado (ex.: ações, FIIs, ETFs).",
          "Não existe investimento sem risco: existe risco que você entende e risco que você não entende.",
        ],
      },
      {
        titulo: "Risco x retorno",
        resumo: "Retornos maiores costumam exigir mais paciência e mais tolerância à oscilação.",
        topicos: [
          "Risco não é só perder dinheiro: é a chance de o resultado ser diferente do esperado.",
          "Diversificar reduz o risco específico de uma empresa ou setor.",
          "O horizonte de tempo muda completamente a decisão de investimento.",
        ],
      },
      {
        titulo: "Juros compostos",
        resumo: "Juros sobre juros: o efeito que faz o tempo valer mais do que parece.",
        topicos: [
          "R$ 100 por mês a 10% ao ano viram cerca de R$ 20 mil em 10 anos.",
          "Começar cedo vale mais do que começar grande.",
          "Taxas altas de administração corroem o efeito dos juros compostos.",
        ],
      },
    ],
  },
  {
    id: "renda-fixa",
    titulo: "Renda fixa",
    descricao: "Tesouro, CDB, LCI/LCA e os detalhes de liquidez e tributação.",
    emoji: "🏦",
    modulos: [
      {
        titulo: "Tesouro Direto",
        resumo: "Títulos públicos vendidos pelo governo para financiar suas atividades.",
        topicos: [
          "Tesouro Selic: pós-fixado, mais estável, bom para reserva de emergência.",
          "Tesouro Prefixado: taxa travada; se a Selic subir, o preço da cota pode cair.",
          "Tesouro IPCA+: protege da inflação e paga uma taxa real.",
        ],
      },
      {
        titulo: "CDB, LCI e LCA",
        resumo: "Títulos emitidos por bancos para captar dinheiro.",
        topicos: [
          "CDB costuma render percentual do CDI e tem FGC até R$ 250 mil por CPF e instituição.",
          "LCI e LCA são isentas de Imposto de Renda para pessoa física, mas têm carência.",
          "Compare sempre a rentabilidade líquida, não a bruta.",
        ],
      },
      {
        titulo: "Liquidez e tributação",
        resumo: "Quanto tempo o dinheiro fica preso e quanto o governo leva.",
        topicos: [
          "Reserva de emergência precisa de liquidez diária.",
          "Renda fixa tem tabela regressiva de IR: de 22,5% a 15% conforme o prazo.",
          "IOF só incide nos primeiros 30 dias.",
        ],
      },
    ],
  },
  {
    id: "renda-variavel",
    titulo: "Renda variável",
    descricao: "Ações, FIIs, ETFs e como a bolsa funciona na prática.",
    emoji: "📈",
    modulos: [
      {
        titulo: "Como funciona a bolsa",
        resumo: "A B3 é onde as empresas negociam ações e outros ativos com investidores.",
        topicos: [
          "O home broker é a plataforma da corretora usada para enviar ordens.",
          "O preço se forma pela oferta e demanda a cada instante.",
          "Dividendos são parte do lucro distribuída aos acionistas.",
        ],
      },
      {
        titulo: "Ações",
        resumo: "Comprar uma ação é se tornar sócio de uma pequena parte da empresa.",
        topicos: [
          "O retorno vem de valorização, dividendos ou ambos.",
          "Preço oscila por resultados, juros, câmbio e humor do mercado.",
          "Estudar o negócio é mais importante do que seguir dicas de rede social.",
        ],
      },
      {
        titulo: "Fundos imobiliários (FIIs)",
        resumo: "Uma forma de investir em imóveis sem comprar um imóvel inteiro.",
        topicos: [
          "Renda mensal de aluguéis é isenta de IR para pessoa física em muitos casos.",
          "Existem FIIs de tijolo (imóveis) e de papel (títulos de dívida imobiliária).",
          "Vacância e qualidade dos contratos importam muito.",
        ],
      },
      {
        titulo: "ETFs",
        resumo: "Cestas de ativos que você compra como se fossem uma única cota na bolsa.",
        topicos: [
          "Um ETF de S&P 500, por exemplo, replica um índice com uma única compra.",
          "Costumam ter taxa de administração baixa.",
          "Ainda assim oscilam e não têm garantia de retorno.",
        ],
      },
    ],
  },
  {
    id: "cuidados",
    titulo: "Cuidados essenciais",
    descricao: "Golpes, perfil de investidor e hábitos que protegem seu dinheiro.",
    emoji: "🛡️",
    modulos: [
      {
        titulo: "Golpes comuns",
        resumo: "Desconfie de promessas de retorno garantido e alto.",
        topicos: [
          "Ninguém pode garantir rendimento acima do mercado sem risco.",
          "Corretoras e assessores precisam estar registrados na CVM ou no Banco Central.",
          "Pix para pessoa física prometendo lucro é sinal clássico de fraude.",
        ],
      },
      {
        titulo: "Perfil de investidor",
        resumo: "Conservador, moderado ou arrojado: o perfil orienta a alocação.",
        topicos: [
          "O questionário da corretora não é burocracia: ele define seu limite.",
          "Perfil muda com o tempo e com os objetivos.",
          "Nunca invista em algo que você não consegue explicar.",
        ],
      },
      {
        titulo: "Diversificação",
        resumo: "Não coloque todos os ovos na mesma cesta.",
        topicos: [
          "Diversifique por classe de ativo, setor e prazo.",
          "Diversificar não elimina o risco de mercado, mas reduz o risco específico.",
          "Reserva de emergência vem antes de qualquer investimento arrojado.",
        ],
      },
    ],
  },
];

export type TermoGlossario = {
  termo: string;
  definicao: string;
};

export const GLOSSARIO: TermoGlossario[] = [
  { termo: "Ação", definicao: "Menor fração do capital de uma empresa negociada na bolsa." },
  { termo: "B3", definicao: "A bolsa oficial do Brasil, onde são negociadas ações, FIIs, ETFs e outros ativos." },
  { termo: "CDI", definicao: "Taxa de referência dos empréstimos entre bancos; muito usada em renda fixa." },
  { termo: "Dividendo", definicao: "Parcela do lucro da empresa distribuída aos acionistas." },
  { termo: "ETF", definicao: "Fundo negociado na bolsa que replica um índice ou cesta de ativos." },
  { termo: "FII", definicao: "Fundo de investimento imobiliário; distribui rendimentos periódicos aos cotistas." },
  { termo: "Liquidez", definicao: "Facilidade de transformar o investimento em dinheiro disponível." },
  { termo: "IPCA", definicao: "Índice oficial de inflação do Brasil, medido pelo IBGE." },
  { termo: "Selic", definicao: "Taxa básica de juros da economia brasileira, definida pelo Banco Central." },
  { termo: "Volatilidade", definicao: "Intensidade das oscilações de preço de um ativo ao longo do tempo." },
  { termo: "Corretora", definicao: "Instituição que intermedeia a compra e venda de investimentos." },
  { termo: "Home broker", definicao: "Plataforma da corretora usada para enviar ordens de compra e venda." },
  { termo: "Come-cotas", definicao: "Antecipação semestral de Imposto de Renda em alguns fundos." },
  { termo: "Taxa de administração", definicao: "Percentual cobrado periodicamente pela gestão de um fundo." },
  { termo: "FGC", definicao: "Fundo Garantidor de Créditos, que protege CDBs e outros títulos até um limite." },
  { termo: "Perfil de investidor", definicao: "Classificação do investidor em conservador, moderado ou arrojado." },
];

export type Investimento = {
  nome: string;
  risco: "Baixo" | "Médio" | "Alto";
  liquidez: string;
  retorno: string;
  minimo: string;
  ideal: string;
};

export const INVESTIMENTOS: Investimento[] = [
  { nome: "Tesouro Selic", risco: "Baixo", liquidez: "Diária", retorno: "Acompanha a Selic", minimo: "A partir de ~R$ 150", ideal: "Reserva de emergência e primeiro investimento" },
  { nome: "CDB", risco: "Baixo", liquidez: "D+0 a D+90", retorno: "Percentual do CDI", minimo: "Varia por banco", ideal: "Quem quer renda fixa simples e protegida pelo FGC" },
  { nome: "LCI / LCA", risco: "Baixo", liquidez: "Carência", retorno: "Percentual do CDI, isento de IR", minimo: "Varia por banco", ideal: "Quem pode deixar o dinheiro parado por mais tempo" },
  { nome: "Fundo DI", risco: "Baixo", liquidez: "D+1", retorno: "Próximo ao CDI", minimo: "A partir de R$ 100", ideal: "Quem quer praticidade e gestão profissional" },
  { nome: "Ações", risco: "Alto", liquidez: "D+2 após venda", retorno: "Valorização + dividendos", minimo: "1 ação", ideal: "Horizonte longo e tolerância à oscilação" },
  { nome: "FIIs", risco: "Médio", liquidez: "D+2 após venda", retorno: "Aluguéis + valorização", minimo: "1 cota", ideal: "Quem busca renda mensal e diversificação" },
  { nome: "ETFs", risco: "Médio", liquidez: "D+2 após venda", retorno: "Segue um índice", minimo: "1 cota", ideal: "Quem quer diversificar com uma única compra" },
  { nome: "Criptoativos", risco: "Alto", liquidez: "24h em corretoras", retorno: "Muito volátil", minimo: "Fração do ativo", ideal: "Apenas quem entende o risco e usa dinheiro que pode perder" },
];

export type PerguntaQuiz = {
  pergunta: string;
  opcoes: string[];
  correta: number;
  explicacao: string;
};

export const QUIZ: PerguntaQuiz[] = [
  {
    pergunta: "O que é a Selic?",
    opcoes: ["A taxa básica de juros da economia brasileira", "O imposto sobre ações", "O índice de inflação oficial", "Uma moeda digital do Banco Central"],
    correta: 0,
    explicacao: "A Selic é definida pelo Banco Central e serve de referência para toda a economia.",
  },
  {
    pergunta: "Comprar uma ação significa:",
    opcoes: ["Emprestar dinheiro ao governo", "Virar sócio de uma empresa", "Comprar um imóvel", "Depositar dinheiro na poupança"],
    correta: 1,
    explicacao: "A ação é uma fração do capital social da empresa. Você passa a ser sócio.",
  },
  {
    pergunta: "Qual investimento é mais indicado para a reserva de emergência?",
    opcoes: ["Criptoativos", "Ações de crescimento", "Tesouro Selic", "FIIs de papel"],
    correta: 2,
    explicacao: "O Tesouro Selic tem baixo risco e liquidez diária, combinação ideal para emergências.",
  },
  {
    pergunta: "O que são FIIs?",
    opcoes: ["Fundos de investimento imobiliário", "Financiamentos imobiliários", "Fundos de índice", "Títulos do agronegócio"],
    correta: 0,
    explicacao: "FIIs permitem investir no setor imobiliário por meio de cotas negociadas na bolsa.",
  },
  {
    pergunta: "Diversificar significa:",
    opcoes: ["Investir tudo no ativo que mais subiu", "Espalhar o dinheiro em ativos diferentes", "Deixar o dinheiro parado", "Comprar só ações de um setor"],
    correta: 1,
    explicacao: "Diversificar reduz o risco específico de uma empresa ou setor.",
  },
  {
    pergunta: "Um retorno garantido e muito acima do mercado é sinal de:",
    opcoes: ["Oportunidade imperdível", "Golpe ou risco altíssimo", "Investimento seguro", "Benefício do governo"],
    correta: 1,
    explicacao: "Não existe retorno alto garantido. Promessas assim são típicas de fraude.",
  },
  {
    pergunta: "O que é liquidez?",
    opcoes: ["O lucro do investimento", "A facilidade de resgatar o dinheiro", "O risco de perder tudo", "O imposto cobrado"],
    correta: 1,
    explicacao: "Liquidez é a rapidez com que você transforma o investimento em dinheiro disponível.",
  },
  {
    pergunta: "Juros compostos são:",
    opcoes: ["Juros apenas sobre o valor inicial", "Juros sobre juros", "Uma taxa fixa do governo", "Um imposto sobre investimentos"],
    correta: 1,
    explicacao: "Nos juros compostos, os rendimentos passam a render também, acelerando o crescimento.",
  },
];

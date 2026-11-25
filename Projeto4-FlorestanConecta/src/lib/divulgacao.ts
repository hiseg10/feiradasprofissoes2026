import { BAIRRO, CIDADE, linkMapaPonto, type Categoria, type Ponto } from "@/lib/conteudo";

export const SITE_URL = "https://feira-florestan-conecta.vercel.app";

export type CanalLegenda = "instagram" | "whatsapp" | "facebook" | "google";

export const CANAIS_LEGENDA: { id: CanalLegenda; nome: string; emoji: string }[] = [
  { id: "instagram", nome: "Instagram", emoji: "📸" },
  { id: "whatsapp", nome: "WhatsApp", emoji: "💬" },
  { id: "facebook", nome: "Facebook / X", emoji: "📣" },
  { id: "google", nome: "Google", emoji: "🔎" },
];

export type LinkRede = {
  id: string;
  nome: string;
  emoji: string;
  descricao: string;
  url: string;
};

export type SiteSugerido = {
  nome: string;
  emoji: string;
  descricao: string;
  url: string;
};

const CHAMADAS: Record<Categoria, string> = {
  Comer: "Que tal apoiar o comércio do bairro?",
  Turismo: "Um lugar que vale a visita no bairro.",
  Serviços: "Um serviço que atende a comunidade.",
  Artesanato: "Talento e produção local para valorizar.",
  Agro: "Produção e natureza no bairro.",
};

function normalizarHashtag(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "");
}

export function hashtagsPonto(ponto: Ponto): string {
  const tags = [
    "DeusQuer",
    "Teresina",
    "FlorestanConecta",
    "FeiraDasProfissoes",
    "ComercioLocal",
    normalizarHashtag(ponto.categoria),
    ...ponto.tags.map(normalizarHashtag),
  ]
    .filter(Boolean)
    .slice(0, 10);

  return [...new Set(tags)].map((tag) => `#${tag}`).join(" ");
}

export function linkDoPonto(ponto: Ponto, canal = "link"): string {
  const url = new URL(`/pontos/${ponto.slug}`, SITE_URL);
  url.searchParams.set("utm_source", canal);
  url.searchParams.set("utm_medium", canal === "qr" ? "offline" : "social");
  url.searchParams.set("utm_campaign", "florestan-conecta");
  return url.toString();
}

export function legendaPonto(ponto: Ponto, canal: CanalLegenda, link: string): string {
  const hashtags = hashtagsPonto(ponto);
  const titulo = `${ponto.emoji} ${ponto.nome} — ${ponto.categoria} no ${BAIRRO}`;
  const chamada = CHAMADAS[ponto.categoria];

  if (canal === "whatsapp") {
    return [
      `*${titulo}*`,
      chamada,
      ponto.descricao,
      `📍 ${ponto.endereco}`,
      `🕒 ${ponto.horario}`,
      "",
      `Veja no guia do bairro: ${link}`,
    ].join("\n");
  }

  if (canal === "google") {
    return [
      `${ponto.nome} — ${ponto.descricao}`,
      `Endereço: ${ponto.endereco}.`,
      `Horário: ${ponto.horario}.`,
      `Conheça o guia do bairro ${BAIRRO}, em ${CIDADE}: ${link}`,
    ].join(" ");
  }

  const dica = ponto.dica ? [`💡 ${ponto.dica}`, ""] : [];

  if (canal === "facebook") {
    return [
      titulo,
      "",
      chamada,
      ponto.descricao,
      "",
      `📍 ${ponto.endereco}`,
      `🕒 ${ponto.horario}`,
      ...dica,
      `Saiba mais: ${link}`,
      "",
      hashtags,
    ].join("\n");
  }

  return [
    `✨ ${titulo}`,
    "",
    chamada,
    ponto.descricao,
    "",
    `📍 ${ponto.endereco}`,
    `🕒 ${ponto.horario}`,
    ...dica,
    `Descubra esse e outros pontos no guia do ${BAIRRO}: ${link}`,
    "",
    hashtags,
  ].join("\n");
}

export function linksRedes(ponto: Ponto): LinkRede[] {
  const whatsapp = linkDoPonto(ponto, "whatsapp");
  const facebook = linkDoPonto(ponto, "facebook");
  const x = linkDoPonto(ponto, "x");
  const telegram = linkDoPonto(ponto, "telegram");
  const linkedin = linkDoPonto(ponto, "linkedin");

  return [
    {
      id: "whatsapp",
      nome: "WhatsApp",
      emoji: "💬",
      descricao: "Envie para contatos e grupos do bairro.",
      url: `https://wa.me/?text=${encodeURIComponent(legendaPonto(ponto, "whatsapp", whatsapp))}`,
    },
    {
      id: "facebook",
      nome: "Facebook",
      emoji: "📘",
      descricao: "Publique no feed ou em um grupo local.",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(facebook)}`,
    },
    {
      id: "x",
      nome: "X (Twitter)",
      emoji: "𝕏",
      descricao: "Poste um resumo com link.",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        legendaPonto(ponto, "facebook", x),
      )}`,
    },
    {
      id: "telegram",
      nome: "Telegram",
      emoji: "✈️",
      descricao: "Compartilhe em canais e grupos.",
      url: `https://t.me/share/url?url=${encodeURIComponent(telegram)}&text=${encodeURIComponent(
        legendaPonto(ponto, "facebook", telegram),
      )}`,
    },
    {
      id: "linkedin",
      nome: "LinkedIn",
      emoji: "💼",
      descricao: "Divulgue para a rede profissional.",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(linkedin)}`,
    },
  ];
}

function buscaOpenStreetMap(ponto: Ponto): string {
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(
    `${ponto.nome}, ${ponto.endereco}`,
  )}`;
}

function buscaTripAdvisor(ponto: Ponto): string {
  return `https://www.tripadvisor.com.br/Search?q=${encodeURIComponent(
    `${ponto.nome} ${CIDADE}`,
  )}`;
}

export function sitesEspecializados(ponto: Ponto): SiteSugerido[] {
  const comuns: SiteSugerido[] = [
    {
      nome: "Google Maps",
      emoji: "🗺️",
      descricao: "Atualize horário, fotos e avaliações do ponto.",
      url: linkMapaPonto(ponto),
    },
    {
      nome: "Google Business Profile",
      emoji: "🏪",
      descricao: "Crie ou reivindique a ficha do negócio.",
      url: "https://business.google.com/",
    },
    {
      nome: "OpenStreetMap",
      emoji: "🧭",
      descricao: "Confira e complete os dados do bairro.",
      url: buscaOpenStreetMap(ponto),
    },
  ];

  const porCategoria: Record<Categoria, SiteSugerido[]> = {
    Comer: [
      {
        nome: "iFood",
        emoji: "🍽️",
        descricao: "Cadastre delivery, cardápio e horários.",
        url: "https://www.ifood.com.br/",
      },
      {
        nome: "TripAdvisor",
        emoji: "⭐",
        descricao: "Apareça nas buscas de quem visita Teresina.",
        url: buscaTripAdvisor(ponto),
      },
    ],
    Turismo: [
      {
        nome: "TripAdvisor",
        emoji: "⭐",
        descricao: "Apareça nas buscas de quem visita Teresina.",
        url: buscaTripAdvisor(ponto),
      },
    ],
    Serviços: [],
    Artesanato: [
      {
        nome: "Facebook Marketplace",
        emoji: "🛍️",
        descricao: "Divulgue produtos para a vizinhança.",
        url: "https://www.facebook.com/marketplace/",
      },
    ],
    Agro: [
      {
        nome: "Facebook Marketplace",
        emoji: "🛍️",
        descricao: "Divulgue produtos para a vizinhança.",
        url: "https://www.facebook.com/marketplace/",
      },
    ],
  };

  return [...comuns, ...porCategoria[ponto.categoria]];
}

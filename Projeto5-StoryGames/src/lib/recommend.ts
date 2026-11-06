import { JOGOS, type Jogo } from "./catalogo";

export type Preferencias = {
  genero: string;
  tempo: string;
  humor: string;
};

const HUMOR_PARA_TAGS: Record<string, string[]> = {
  emocionante: ["Emocional", "Escolhas", "Drama"],
  misterioso: ["Investigação", "Mistério", "Terror psicológico"],
  aconchegante: ["Cozy", "Romance", "Fotografia"],
  tenso: ["Tenso", "Terror psicológico", "Solitário"],
  reflexivo: ["Emocional", "Finais múltiplos", "Narrativo"],
};

function pontuarTempo(tempo: string, horas: number): number {
  if (tempo === "curto") return horas <= 4 ? 5 : 0;
  if (tempo === "medio") return horas >= 5 && horas <= 9 ? 5 : 0;
  if (tempo === "longo") return horas >= 10 ? 5 : 0;
  return 1;
}

export function recomendarJogos(preferencias: Preferencias): Jogo[] {
  const { genero, tempo, humor } = preferencias;
  const tagsHumor = HUMOR_PARA_TAGS[humor] ?? [];

  return JOGOS.map((jogo) => {
    let pontos = jogo.nota;

    if (genero !== "tanto-faz") {
      if (jogo.generos.includes(genero)) pontos += 8;
      else if (jogo.tags.includes(genero)) pontos += 3;
    }

    pontos += pontuarTempo(tempo, jogo.tempoMedioHoras);

    if (humor !== "tanto-faz") {
      if (jogo.generos.some((item) => tagsHumor.includes(item))) pontos += 4;
      if (jogo.tags.some((item) => tagsHumor.includes(item))) pontos += 3;
    }

    if (jogo.desconto > 0) pontos += 0.5;

    return { jogo, pontos };
  })
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, 3)
    .map((item) => item.jogo);
}

export function textoFallbackRecomendacao(
  jogos: Jogo[],
  preferencias: Preferencias,
): string {
  const { genero, tempo, humor } = preferencias;
  const partes = [
    "A IA não está disponível agora, então usei o recomendador local do catálogo.",
    `Perfil escolhido: gênero ${genero === "tanto-faz" ? "livre" : genero}, duração ${tempo === "tanto-faz" ? "livre" : tempo} e clima ${humor === "tanto-faz" ? "livre" : humor}.`,
    ...jogos.map(
      (jogo, indice) =>
        `${indice + 1}. ${jogo.titulo} — ${jogo.descricaoCurta} (${jogo.tempoMedioHoras}h, nota ${jogo.nota.toFixed(1)})`,
    ),
    "Abra a página de cada jogo para ver requisitos, avaliações e preço. Esta é uma loja fictícia para a feira.",
  ];
  return partes.join("\n\n");
}

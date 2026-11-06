import { NextResponse } from "next/server";
import { JOGOS } from "@/lib/catalogo";
import { consultarIA } from "@/lib/ia";
import {
  recomendarJogos,
  textoFallbackRecomendacao,
  type Preferencias,
} from "@/lib/recommend";

export const dynamic = "force-dynamic";
export const maxDuration = 45;

type Corpo = {
  genero?: unknown;
  tempo?: unknown;
  humor?: unknown;
};

const GENEROS_VALIDOS = new Set<string>([
  "tanto-faz",
  ...JOGOS.flatMap((jogo) => jogo.generos),
]);
const TEMPOS_VALIDOS = new Set(["tanto-faz", "curto", "medio", "longo"]);
const HUMORES_VALIDOS = new Set([
  "tanto-faz",
  "emocionante",
  "misterioso",
  "aconchegante",
  "tenso",
  "reflexivo",
]);

function escolher(valor: unknown, validos: Set<string>, padrao: string): string {
  return typeof valor === "string" && validos.has(valor) ? valor : padrao;
}

export async function POST(request: Request) {
  let corpo: Corpo | null = null;
  try {
    corpo = (await request.json()) as Corpo;
  } catch {
    return NextResponse.json({ erro: "Corpo JSON inválido." }, { status: 400 });
  }

  const preferencias: Preferencias = {
    genero: escolher(corpo?.genero, GENEROS_VALIDOS, "tanto-faz"),
    tempo: escolher(corpo?.tempo, TEMPOS_VALIDOS, "tanto-faz"),
    humor: escolher(corpo?.humor, HUMORES_VALIDOS, "tanto-faz"),
  };

  const recomendados = recomendarJogos(preferencias);

  const contexto = JOGOS.map(
    (jogo) =>
      `- ${jogo.titulo} (${jogo.generos.join(", ")}; tags: ${jogo.tags.join(", ")}; ${jogo.tempoMedioHoras}h; nota ${jogo.nota.toFixed(1)}): ${jogo.descricaoCurta}`,
  ).join("\n");

  const mensagem = `Perfil do visitante: gênero ${preferencias.genero}, duração ${preferencias.tempo}, clima ${preferencias.humor}. As sugestões calculadas pelo sistema são: ${recomendados
    .map((jogo) => jogo.titulo)
    .join(", ")}. Explique por que essas três combinam com o perfil.`;

  const resposta = await consultarIA(
    [{ papel: "user", texto: mensagem }],
    contexto,
    textoFallbackRecomendacao(recomendados, preferencias),
  );

  return NextResponse.json(
    {
      ...resposta,
      recomendados: recomendados.map((jogo) => jogo.slug),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

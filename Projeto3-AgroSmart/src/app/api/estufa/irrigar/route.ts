import { NextResponse } from "next/server";
import { alterarBomba, atualizarLimites } from "@/lib/estufa";
import type { Limites } from "@/lib/types";

export const dynamic = "force-dynamic";

type Corpo = {
  acao?: unknown;
  limites?: unknown;
};

function numero(valor: unknown): number | null {
  if (typeof valor !== "number" || !Number.isFinite(valor)) return null;
  return valor;
}

export async function POST(request: Request) {
  let corpo: Corpo | null = null;
  try {
    corpo = (await request.json()) as Corpo;
  } catch {
    corpo = {};
  }

  const acao = corpo?.acao;
  if (acao === "ligar" || acao === "desligar" || acao === "auto") {
    return NextResponse.json(alterarBomba(acao), {
      headers: { "Cache-Control": "no-store" },
    });
  }

  if (corpo?.limites && typeof corpo.limites === "object") {
    const dados = corpo.limites as Record<string, unknown>;
    const parcial: Partial<Limites> = {};

    const minimo = numero(dados.umidadeSoloMin);
    const maximo = numero(dados.umidadeSoloMax);
    const temperaturaMax = numero(dados.temperaturaMax);

    if (minimo !== null) parcial.umidadeSoloMin = minimo;
    if (maximo !== null) parcial.umidadeSoloMax = maximo;
    if (temperaturaMax !== null) parcial.temperaturaMax = temperaturaMax;

    if (!Object.keys(parcial).length) {
      return NextResponse.json(
        { erro: "Informe ao menos um limite numérico." },
        { status: 400 },
      );
    }

    return NextResponse.json(atualizarLimites(parcial), {
      headers: { "Cache-Control": "no-store" },
    });
  }

  return NextResponse.json(
    { erro: "Informe uma ação (ligar, desligar, auto) ou limites." },
    { status: 400 },
  );
}

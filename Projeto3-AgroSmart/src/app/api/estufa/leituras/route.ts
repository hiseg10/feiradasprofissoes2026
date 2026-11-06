import { NextResponse } from "next/server";
import { obterEstado, registrarLeitura } from "@/lib/estufa";

export const dynamic = "force-dynamic";

type Corpo = {
  temperatura?: unknown;
  umidadeAr?: unknown;
  umidadeSolo?: unknown;
  luz?: unknown;
  bombaLigada?: unknown;
  fonte?: unknown;
};

function numero(valor: unknown, minimo: number, maximo: number): number | null {
  if (typeof valor !== "number" || !Number.isFinite(valor)) return null;
  if (valor < minimo || valor > maximo) return null;
  return valor;
}

export async function GET() {
  return NextResponse.json(obterEstado(), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  let corpo: Corpo | null = null;
  try {
    corpo = (await request.json()) as Corpo;
  } catch {
    return NextResponse.json({ erro: "Corpo JSON inválido." }, { status: 400 });
  }

  const fonte: "simulacao" | "esp32" | "arduino" =
    corpo?.fonte === "esp32" || corpo?.fonte === "arduino" ? corpo.fonte : "simulacao";
  const token = process.env.ESTUFA_TOKEN;

  if (token && fonte !== "simulacao" && request.headers.get("x-estufa-token") !== token) {
    return NextResponse.json({ erro: "Token do sensor inválido." }, { status: 401 });
  }

  const temperatura = numero(corpo?.temperatura, -10, 60);
  const umidadeAr = numero(corpo?.umidadeAr, 0, 100);
  const umidadeSolo = numero(corpo?.umidadeSolo, 0, 100);
  const luz = numero(corpo?.luz, 0, 100000);

  if (
    temperatura === null ||
    umidadeAr === null ||
    umidadeSolo === null ||
    luz === null
  ) {
    return NextResponse.json(
      {
        erro: "Envie temperatura, umidadeAr, umidadeSolo e luz como números válidos.",
      },
      { status: 400 },
    );
  }

  const estado = registrarLeitura({
    temperatura,
    umidadeAr,
    umidadeSolo,
    luz,
    fonte,
    bombaLigada:
      typeof corpo?.bombaLigada === "boolean" ? corpo.bombaLigada : undefined,
  });

  return NextResponse.json(estado, {
    headers: { "Cache-Control": "no-store" },
  });
}

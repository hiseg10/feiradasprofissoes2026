import { NextResponse } from "next/server";
import { diagnosticarPlanta } from "@/lib/ia";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MIME_ACEITOS = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

const LIMITE_BYTES = 5 * 1024 * 1024;

type Corpo = {
  imagem?: unknown;
  cultura?: unknown;
};

export async function POST(request: Request) {
  let corpo: Corpo | null = null;
  try {
    corpo = (await request.json()) as Corpo;
  } catch {
    return NextResponse.json({ erro: "Corpo JSON inválido." }, { status: 400 });
  }

  if (typeof corpo?.imagem !== "string") {
    return NextResponse.json({ erro: "Envie uma imagem em base64." }, { status: 400 });
  }

  const correspondencia = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(corpo.imagem);
  if (!correspondencia) {
    return NextResponse.json(
      { erro: "Formato de imagem inválido. Use data URL base64." },
      { status: 400 },
    );
  }

  const mimeType = correspondencia[1].toLowerCase();
  const base64 = correspondencia[2];

  if (!MIME_ACEITOS.has(mimeType)) {
    return NextResponse.json(
      { erro: "Formato não suportado. Use JPG, PNG, WEBP ou GIF." },
      { status: 400 },
    );
  }

  const tamanhoAproximado = Math.ceil((base64.length * 3) / 4);
  if (tamanhoAproximado > LIMITE_BYTES) {
    return NextResponse.json({ erro: "Imagem maior que 5 MB." }, { status: 413 });
  }

  const cultura =
    typeof corpo.cultura === "string" ? corpo.cultura.trim().slice(0, 80) : undefined;

  const resultado = await diagnosticarPlanta({
    imagemBase64: base64,
    mimeType,
    cultura,
  });

  return NextResponse.json(resultado, {
    headers: { "Cache-Control": "no-store" },
  });
}

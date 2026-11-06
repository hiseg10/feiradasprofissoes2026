import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { gerarPixPayload, referenciaPix } from "@/lib/pix";
import { montarItens } from "@/lib/queries";

export const dynamic = "force-dynamic";

type Corpo = {
  itens?: unknown;
};

export async function POST(request: Request) {
  try {
    const corpo = (await request.json()) as Corpo | null;
    const chave = process.env.PIX_KEY?.trim();

    if (!chave) {
      return NextResponse.json(
        {
          erro: "Configure PIX_KEY no .env.local para gerar o QR real do Pix. Use cartão ou dinheiro enquanto isso.",
        },
        { status: 400 },
      );
    }

    const client = await db();
    const { totalCentavos } = await montarItens(corpo?.itens, client);

    const payload = gerarPixPayload({
      chave,
      nome: process.env.PIX_MERCHANT_NAME ?? "SABOR DO FLORESTAN",
      cidade: process.env.PIX_MERCHANT_CITY ?? "TERESINA",
      valorCentavos: totalCentavos,
      referencia: referenciaPix(),
    });

    const qrDataUrl = await QRCode.toDataURL(payload, {
      margin: 1,
      width: 320,
      color: { dark: "#431407", light: "#FFFFFF" },
    });

    return NextResponse.json({
      valorCentavos: totalCentavos,
      payload,
      qrDataUrl,
    });
  } catch (erro) {
    return NextResponse.json(
      { erro: erro instanceof Error ? erro.message : "Erro ao gerar Pix." },
      { status: 400 },
    );
  }
}

import { NextResponse } from "next/server";
import { resetarVendas } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const corpo = (await request.json()) as { confirmar?: unknown } | null;
    if (corpo?.confirmar !== true) {
      return NextResponse.json(
        { erro: "Confirmação obrigatória para zerar as vendas." },
        { status: 400 },
      );
    }
    await resetarVendas();
    return NextResponse.json({ ok: true });
  } catch (erro) {
    return NextResponse.json(
      { erro: erro instanceof Error ? erro.message : "Erro ao zerar vendas." },
      { status: 500 },
    );
  }
}

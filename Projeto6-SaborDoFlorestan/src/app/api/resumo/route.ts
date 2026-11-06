import { NextResponse } from "next/server";
import { resumo } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dados = await resumo();
    return NextResponse.json(dados, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (erro) {
    return NextResponse.json(
      { erro: erro instanceof Error ? erro.message : "Erro ao gerar resumo." },
      { status: 500 },
    );
  }
}

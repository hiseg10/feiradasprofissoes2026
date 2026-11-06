import { NextResponse } from "next/server";
import { getCotacoes, TICKERS_PADRAO } from "@/lib/mercado";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tickers = url.searchParams.get("tickers");
  const simbolos = tickers
    ? tickers.split(",").map((t) => t.trim()).filter(Boolean)
    : TICKERS_PADRAO;

  const dados = await getCotacoes(simbolos);
  return NextResponse.json(dados, {
    headers: { "Cache-Control": "no-store" },
  });
}

import { NextResponse } from "next/server";
import { getIndicadores } from "@/lib/mercado";

export const dynamic = "force-dynamic";

export async function GET() {
  const dados = await getIndicadores();
  return NextResponse.json(dados, {
    headers: { "Cache-Control": "no-store" },
  });
}

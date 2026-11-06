import { NextResponse } from "next/server";
import { simularLeitura } from "@/lib/estufa";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(simularLeitura(), {
    headers: { "Cache-Control": "no-store" },
  });
}

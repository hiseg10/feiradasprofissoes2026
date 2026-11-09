import { NextResponse } from "next/server";
import { infoMp } from "@/lib/mp";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(infoMp(), {
    headers: { "Cache-Control": "no-store" },
  });
}

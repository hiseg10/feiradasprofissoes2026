import { NextResponse } from "next/server";
import { publicKeyAtiva } from "@/lib/mp";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { publicKey: publicKeyAtiva() },
    { headers: { "Cache-Control": "no-store" } },
  );
}

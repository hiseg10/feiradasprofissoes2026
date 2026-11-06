import { NextResponse } from "next/server";
import { destruirSessao } from "@/lib/auth";

export async function GET(request: Request) {
  await destruirSessao();
  return NextResponse.redirect(new URL("/entrar", request.url));
}

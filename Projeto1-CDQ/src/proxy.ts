import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESSAO } from "@/lib/sessao";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const temSessao = Boolean(request.cookies.get(COOKIE_SESSAO)?.value);
  const publica = pathname === "/entrar" || pathname === "/termos";
  const rotaAuth = pathname.startsWith("/api/auth");

  if (!temSessao && !publica && !rotaAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads|.*\\..*).*)"],
};

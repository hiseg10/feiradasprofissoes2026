import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { criarSessao, entrarComGoogle } from "@/lib/auth";
import { COOKIE_OAUTH } from "@/lib/sessao";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const store = await cookies();
  const stateSalvo = store.get(COOKIE_OAUTH)?.value;
  store.delete(COOKIE_OAUTH);

  if (!code || !state || !stateSalvo || state !== stateSalvo) {
    return NextResponse.redirect(new URL("/entrar?erro=estado", request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/entrar?erro=google", request.url));
  }

  const redirectUri = new URL("/api/auth/google/callback", request.url).toString();

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) {
      return NextResponse.redirect(new URL("/entrar?erro=google", request.url));
    }

    const tokens = (await tokenRes.json()) as { access_token?: string };
    if (!tokens.access_token) {
      return NextResponse.redirect(new URL("/entrar?erro=google", request.url));
    }

    const infoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!infoRes.ok) {
      return NextResponse.redirect(new URL("/entrar?erro=google", request.url));
    }

    const perfil = (await infoRes.json()) as {
      sub?: string;
      email?: string;
      name?: string;
      picture?: string;
      email_verified?: boolean;
    };

    if (!perfil.sub || !perfil.email || perfil.email_verified === false) {
      return NextResponse.redirect(new URL("/entrar?erro=google", request.url));
    }

    const usuario = await entrarComGoogle({
      sub: perfil.sub,
      email: perfil.email,
      name: perfil.name,
      picture: perfil.picture,
    });

    await criarSessao(usuario.id);

    const destino = usuario.status === "aprovado" ? "/" : "/aguardando";
    return NextResponse.redirect(new URL(destino, request.url));
  } catch {
    return NextResponse.redirect(new URL("/entrar?erro=google", request.url));
  }
}

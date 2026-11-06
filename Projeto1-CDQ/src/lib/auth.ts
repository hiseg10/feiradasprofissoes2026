import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { COOKIE_SESSAO, SESSAO_MAX_AGE } from "./sessao";

export type Papel = "admin" | "usuario";
export type StatusUsuario = "pendente" | "aprovado" | "bloqueado";

export type Usuario = {
  id: number;
  google_id: string | null;
  email: string;
  nome: string;
  avatar_url: string | null;
  role: Papel;
  status: StatusUsuario;
  criado_em: string;
  aprovado_em: string | null;
};

function segredo(): string {
  return process.env.AUTH_SECRET || "segredo-de-desenvolvimento";
}

function assinar(payload: string): string {
  return createHmac("sha256", segredo()).update(payload).digest("base64url");
}

export function criarToken(uid: number): string {
  const exp = Date.now() + SESSAO_MAX_AGE * 1000;
  const payload = Buffer.from(JSON.stringify({ uid, exp })).toString("base64url");
  return `${payload}.${assinar(payload)}`;
}

export function verificarToken(token: string | undefined | null): number | null {
  if (!token) return null;
  const [payload, assinatura] = token.split(".");
  if (!payload || !assinatura) return null;

  const esperada = Buffer.from(assinar(payload));
  const recebida = Buffer.from(assinatura);
  if (esperada.length !== recebida.length || !timingSafeEqual(esperada, recebida)) return null;

  try {
    const dados = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof dados.exp !== "number" || dados.exp < Date.now()) return null;
    if (typeof dados.uid !== "number") return null;
    return dados.uid;
  } catch {
    return null;
  }
}

export async function criarSessao(uid: number): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_SESSAO, criarToken(uid), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSAO_MAX_AGE,
  });
}

export async function destruirSessao(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_SESSAO);
}

export async function usuarioAtual(): Promise<Usuario | null> {
  const store = await cookies();
  const uid = verificarToken(store.get(COOKIE_SESSAO)?.value);
  if (!uid) return null;
  const client = await db();
  const resultado = await client.execute({ sql: "SELECT * FROM usuarios WHERE id = ?", args: [uid] });
  const usuario = resultado.rows[0] as unknown as Usuario | undefined;
  return usuario ?? null;
}

export async function exigirUsuario(): Promise<Usuario> {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/entrar");
  return usuario;
}

export async function exigirAprovado(): Promise<Usuario> {
  const usuario = await exigirUsuario();
  if (usuario.status === "pendente") redirect("/aguardando");
  if (usuario.status === "bloqueado") redirect("/bloqueado");
  return usuario;
}

export async function exigirAdmin(): Promise<Usuario> {
  const usuario = await exigirAprovado();
  if (usuario.role !== "admin") redirect("/");
  return usuario;
}

export function ehAdminEmail(email: string): boolean {
  const lista = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return lista.includes(email.trim().toLowerCase());
}

export type GooglePerfil = {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
};

export async function entrarComGoogle(perfil: GooglePerfil): Promise<Usuario> {
  const client = await db();
  const email = perfil.email.trim().toLowerCase();
  const nome = perfil.name?.trim() || email.split("@")[0];
  const avatar = perfil.picture ?? null;
  const admin = ehAdminEmail(email);

  const existente = await client.execute({
    sql: "SELECT * FROM usuarios WHERE email = ? OR google_id = ? LIMIT 1",
    args: [email, perfil.sub],
  });
  const atual = existente.rows[0] as unknown as Usuario | undefined;

  if (atual) {
    await client.execute({
      sql: `UPDATE usuarios SET google_id = ?, nome = ?, avatar_url = ?, email = ?,
                   role = CASE WHEN ? THEN 'admin' ELSE role END,
                   status = CASE WHEN ? THEN 'aprovado' ELSE status END,
                   aprovado_em = CASE WHEN ? AND aprovado_em IS NULL THEN datetime('now') ELSE aprovado_em END
             WHERE id = ?`,
      args: [perfil.sub, nome, avatar, email, admin ? 1 : 0, admin ? 1 : 0, admin ? 1 : 0, atual.id],
    });
    const atualizado = await client.execute({ sql: "SELECT * FROM usuarios WHERE id = ?", args: [atual.id] });
    return atualizado.rows[0] as unknown as Usuario;
  }

  const criado = await client.execute({
    sql: `INSERT INTO usuarios (google_id, email, nome, avatar_url, role, status, aprovado_em)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      perfil.sub,
      email,
      nome,
      avatar,
      admin ? "admin" : "usuario",
      admin ? "aprovado" : "pendente",
      admin ? new Date().toISOString() : null,
    ],
  });

  const usuario = await client.execute({
    sql: "SELECT * FROM usuarios WHERE id = ?",
    args: [Number(criado.lastInsertRowid)],
  });
  return usuario.rows[0] as unknown as Usuario;
}

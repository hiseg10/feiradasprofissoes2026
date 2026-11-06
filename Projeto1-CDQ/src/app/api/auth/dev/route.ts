import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { criarSessao } from "@/lib/auth";

export async function GET(request: Request) {
  if (process.env.DEV_LOGIN !== "1" || process.env.NODE_ENV === "production") {
    return NextResponse.redirect(new URL("/entrar", request.url));
  }

  const email =
    (process.env.ADMIN_EMAILS ?? "admin@cdq.local")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)[0] ?? "admin@cdq.local";

  const client = await db();
  const resultado = await client.execute({
    sql: "SELECT id FROM usuarios WHERE email = ?",
    args: [email],
  });

  let id = resultado.rows[0] ? Number(resultado.rows[0].id) : 0;
  if (!id) {
    const criado = await client.execute({
      sql: `INSERT INTO usuarios (google_id, email, nome, role, status, aprovado_em)
            VALUES (?, ?, 'Equipe CDQ', 'admin', 'aprovado', datetime('now'))`,
      args: [`dev:${email}`, email],
    });
    id = Number(criado.lastInsertRowid);
  }

  await criarSessao(id);
  return NextResponse.redirect(new URL("/", request.url));
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseCentavos } from "@/lib/format";

function texto(valor: FormDataEntryValue | null): string {
  return typeof valor === "string" ? valor.trim() : "";
}

function numero(valor: FormDataEntryValue | null): number {
  const n = Number.parseInt(texto(valor), 10);
  return Number.isFinite(n) ? n : 0;
}

export async function aprovarUsuarioAction(formData: FormData) {
  await exigirAdmin();
  const id = numero(formData.get("id"));
  if (!id) redirect("/admin?aba=usuarios");
  const client = await db();
  await client.execute({
    sql: "UPDATE usuarios SET status = 'aprovado', aprovado_em = COALESCE(aprovado_em, datetime('now')) WHERE id = ?",
    args: [id],
  });
  revalidatePath("/admin");
  redirect("/admin?aba=usuarios&ok=aprovado");
}

export async function bloquearUsuarioAction(formData: FormData) {
  const admin = await exigirAdmin();
  const id = numero(formData.get("id"));
  if (!id) redirect("/admin?aba=usuarios");
  if (id === admin.id) redirect("/admin?aba=usuarios&erro=proprio");
  const client = await db();
  await client.execute({ sql: "UPDATE usuarios SET status = 'bloqueado' WHERE id = ?", args: [id] });
  revalidatePath("/admin");
  redirect("/admin?aba=usuarios&ok=bloqueado");
}

export async function promoverUsuarioAction(formData: FormData) {
  await exigirAdmin();
  const id = numero(formData.get("id"));
  if (!id) redirect("/admin?aba=usuarios");
  const client = await db();
  await client.execute({
    sql: "UPDATE usuarios SET role = 'admin', status = 'aprovado', aprovado_em = COALESCE(aprovado_em, datetime('now')) WHERE id = ?",
    args: [id],
  });
  revalidatePath("/admin");
  redirect("/admin?aba=usuarios&ok=admin");
}

export async function rebaixarUsuarioAction(formData: FormData) {
  const admin = await exigirAdmin();
  const id = numero(formData.get("id"));
  if (!id) redirect("/admin?aba=usuarios");
  if (id === admin.id) redirect("/admin?aba=usuarios&erro=proprio");
  const client = await db();
  await client.execute({ sql: "UPDATE usuarios SET role = 'usuario' WHERE id = ?", args: [id] });
  revalidatePath("/admin");
  redirect("/admin?aba=usuarios&ok=usuario");
}

export async function aprovarAnuncioAction(formData: FormData) {
  await exigirAdmin();
  const id = numero(formData.get("id"));
  if (!id) redirect("/admin?aba=anuncios");
  const client = await db();
  await client.execute({
    sql: "UPDATE anuncios SET status = 'aprovado', motivo_rejeicao = NULL, atualizado_em = datetime('now') WHERE id = ?",
    args: [id],
  });
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/anuncio/${id}`);
  redirect("/admin?aba=anuncios&ok=aprovado");
}

export async function rejeitarAnuncioAction(formData: FormData) {
  await exigirAdmin();
  const id = numero(formData.get("id"));
  if (!id) redirect("/admin?aba=anuncios");
  const motivo = texto(formData.get("motivo")) || "Não atende às regras do bairro.";
  const client = await db();
  await client.execute({
    sql: "UPDATE anuncios SET status = 'rejeitado', motivo_rejeicao = ?, atualizado_em = datetime('now') WHERE id = ?",
    args: [motivo.slice(0, 300), id],
  });
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/anuncio/${id}`);
  redirect("/admin?aba=anuncios&ok=rejeitado");
}

export async function confirmarImpulsionamentoAction(formData: FormData) {
  await exigirAdmin();
  const id = numero(formData.get("id"));
  if (!id) redirect("/admin?aba=impulsionamentos");

  const client = await db();
  const pedido = await client.execute({
    sql: "SELECT * FROM impulsionamentos WHERE id = ? AND status = 'pendente'",
    args: [id],
  });
  if (pedido.rows.length === 0) {
    redirect("/admin?aba=impulsionamentos&erro=pedido");
  }

  const dias = Number(pedido.rows[0].dias);
  const anuncioId = Number(pedido.rows[0].anuncio_id);

  await client.execute({
    sql: `UPDATE anuncios SET impulsionado_ate = datetime(
            CASE WHEN impulsionado_ate IS NOT NULL AND impulsionado_ate > datetime('now')
                 THEN impulsionado_ate ELSE datetime('now') END,
            printf('+%d days', ?))
          WHERE id = ?`,
    args: [dias, anuncioId],
  });
  await client.execute({
    sql: "UPDATE impulsionamentos SET status = 'pago', pago_em = datetime('now') WHERE id = ?",
    args: [id],
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/meus-anuncios");
  revalidatePath(`/anuncio/${anuncioId}`);
  redirect("/admin?aba=impulsionamentos&ok=confirmado");
}

export async function cancelarImpulsionamentoAction(formData: FormData) {
  await exigirAdmin();
  const id = numero(formData.get("id"));
  if (!id) redirect("/admin?aba=impulsionamentos");
  const client = await db();
  await client.execute({
    sql: "UPDATE impulsionamentos SET status = 'cancelado' WHERE id = ? AND status = 'pendente'",
    args: [id],
  });
  revalidatePath("/admin");
  redirect("/admin?aba=impulsionamentos&ok=cancelado");
}

export async function salvarConfigAction(formData: FormData) {
  await exigirAdmin();
  const preco = parseCentavos(formData.get("precoDia"));
  const client = await db();
  await client.execute({
    sql: `INSERT INTO config (chave, valor) VALUES ('impulsionamento_preco_dia', ?)
          ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`,
    args: [String(Math.max(0, preco))],
  });
  revalidatePath("/admin");
  revalidatePath("/meus-anuncios");
  redirect("/admin?aba=config&ok=config");
}

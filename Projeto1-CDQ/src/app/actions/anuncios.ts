"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirAprovado } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPrecoDiaCentavos, obterAnuncio } from "@/lib/data";
import { CATEGORIAS, CONDICOES, DIAS_IMPULSIONAMENTO } from "@/lib/constantes";
import { apenasDigitos, parseCentavos } from "@/lib/format";
import { salvarFotos } from "@/lib/upload";

function texto(valor: FormDataEntryValue | null): string {
  return typeof valor === "string" ? valor.trim() : "";
}

function numero(valor: FormDataEntryValue | null): number {
  const n = Number.parseInt(texto(valor), 10);
  return Number.isFinite(n) ? n : 0;
}

const CATEGORIAS_VALIDAS = CATEGORIAS.map((c) => c.valor) as string[];
const CONDICOES_VALIDAS = CONDICOES.map((c) => c.valor) as string[];

type Campos = {
  titulo: string;
  descricao: string;
  precoCentavos: number;
  categoria: string;
  condicao: string;
  bairro: string;
  whatsapp: string;
};

function lerCampos(formData: FormData): Campos | null {
  const titulo = texto(formData.get("titulo"));
  const descricao = texto(formData.get("descricao"));
  const categoria = texto(formData.get("categoria"));
  const condicao = texto(formData.get("condicao"));
  const bairro = texto(formData.get("bairro")) || "Deus Quer";
  const whatsapp = apenasDigitos(texto(formData.get("whatsapp")));
  const precoCentavos = parseCentavos(formData.get("preco"));

  if (titulo.length < 3 || titulo.length > 90) return null;
  if (descricao.length < 10 || descricao.length > 1500) return null;
  if (!CATEGORIAS_VALIDAS.includes(categoria)) return null;
  if (!CONDICOES_VALIDAS.includes(condicao)) return null;
  if (whatsapp.length < 10 || whatsapp.length > 11) return null;

  return { titulo, descricao, precoCentavos, categoria, condicao, bairro, whatsapp };
}

function arquivosDe(formData: FormData): File[] {
  return formData
    .getAll("fotos")
    .filter((item): item is File => item instanceof File && item.size > 0);
}

export async function criarAnuncioAction(formData: FormData) {
  const usuario = await exigirAprovado();
  const campos = lerCampos(formData);
  if (!campos) redirect("/anuncios/novo?erro=campos");
  if (texto(formData.get("termos")) !== "on") redirect("/anuncios/novo?erro=termos");

  let fotos: string[] = [];
  try {
    fotos = await salvarFotos(arquivosDe(formData));
  } catch {
    redirect("/anuncios/novo?erro=foto");
  }

  const client = await db();
  await client.execute({
    sql: `INSERT INTO anuncios (usuario_id, titulo, descricao, preco_centavos, categoria, condicao, bairro, whatsapp, fotos, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente')`,
    args: [
      usuario.id,
      campos.titulo,
      campos.descricao,
      campos.precoCentavos,
      campos.categoria,
      campos.condicao,
      campos.bairro,
      campos.whatsapp,
      JSON.stringify(fotos),
    ],
  });

  revalidatePath("/");
  revalidatePath("/meus-anuncios");
  revalidatePath("/admin");
  redirect("/meus-anuncios?enviado=1");
}

export async function atualizarAnuncioAction(formData: FormData) {
  const usuario = await exigirAprovado();
  const id = numero(formData.get("id"));
  if (!id) redirect("/meus-anuncios");

  const anuncio = await obterAnuncio(id);
  if (!anuncio) redirect("/meus-anuncios");
  const admin = usuario.role === "admin";
  if (anuncio.usuario_id !== usuario.id && !admin) redirect("/meus-anuncios");

  const campos = lerCampos(formData);
  if (!campos) redirect(`/anuncios/${id}/editar?erro=campos`);

  let existentes: string[] = [];
  try {
    const lista = JSON.parse(texto(formData.get("fotos_atuais")) || "[]");
    if (Array.isArray(lista)) existentes = lista.filter((item) => typeof item === "string");
  } catch {
    existentes = [];
  }

  const remover = new Set(formData.getAll("remover_foto").filter((item): item is string => typeof item === "string"));
  existentes = existentes.filter((url) => !remover.has(url));

  let novas: string[] = [];
  try {
    novas = await salvarFotos(arquivosDe(formData));
  } catch {
    redirect(`/anuncios/${id}/editar?erro=foto`);
  }

  const fotos = [...existentes, ...novas].slice(0, 5);

  const client = await db();
  await client.execute({
    sql: `UPDATE anuncios SET titulo = ?, descricao = ?, preco_centavos = ?, categoria = ?, condicao = ?,
                 bairro = ?, whatsapp = ?, fotos = ?,
                 status = CASE WHEN ? THEN status ELSE 'pendente' END,
                 motivo_rejeicao = CASE WHEN ? THEN motivo_rejeicao ELSE NULL END,
                 atualizado_em = datetime('now')
           WHERE id = ?`,
    args: [
      campos.titulo,
      campos.descricao,
      campos.precoCentavos,
      campos.categoria,
      campos.condicao,
      campos.bairro,
      campos.whatsapp,
      JSON.stringify(fotos),
      admin ? 1 : 0,
      admin ? 1 : 0,
      id,
    ],
  });

  revalidatePath("/");
  revalidatePath("/meus-anuncios");
  revalidatePath(`/anuncio/${id}`);
  revalidatePath("/admin");
  redirect(admin ? `/anuncio/${id}` : "/meus-anuncios?editado=1");
}

export async function excluirAnuncioAction(formData: FormData) {
  const usuario = await exigirAprovado();
  const id = numero(formData.get("id"));
  if (!id) redirect("/meus-anuncios");

  const anuncio = await obterAnuncio(id);
  if (!anuncio) redirect("/meus-anuncios");
  const admin = usuario.role === "admin";
  if (anuncio.usuario_id !== usuario.id && !admin) redirect("/meus-anuncios");

  const client = await db();
  await client.execute({ sql: "DELETE FROM impulsionamentos WHERE anuncio_id = ?", args: [id] });
  await client.execute({ sql: "DELETE FROM anuncios WHERE id = ?", args: [id] });

  revalidatePath("/");
  revalidatePath("/meus-anuncios");
  revalidatePath("/admin");
  redirect(admin ? "/admin?aba=anuncios" : "/meus-anuncios?excluido=1");
}

export async function marcarVendidoAction(formData: FormData) {
  const usuario = await exigirAprovado();
  const id = numero(formData.get("id"));
  if (!id) redirect("/meus-anuncios");

  const anuncio = await obterAnuncio(id);
  if (!anuncio) redirect("/meus-anuncios");
  if (anuncio.usuario_id !== usuario.id && usuario.role !== "admin") redirect("/meus-anuncios");

  const client = await db();
  await client.execute({
    sql: "UPDATE anuncios SET status = 'vendido', atualizado_em = datetime('now') WHERE id = ?",
    args: [id],
  });

  revalidatePath("/");
  revalidatePath("/meus-anuncios");
  revalidatePath(`/anuncio/${id}`);
  redirect("/meus-anuncios?vendido=1");
}

export async function solicitarImpulsionamentoAction(formData: FormData) {
  const usuario = await exigirAprovado();
  const id = numero(formData.get("id"));
  const dias = numero(formData.get("dias"));

  if (!id || !DIAS_IMPULSIONAMENTO.includes(dias as (typeof DIAS_IMPULSIONAMENTO)[number])) {
    redirect("/meus-anuncios?erro=impulsionamento");
  }

  const anuncio = await obterAnuncio(id);
  if (!anuncio || anuncio.usuario_id !== usuario.id || anuncio.status !== "aprovado") {
    redirect("/meus-anuncios?erro=impulsionamento");
  }

  const client = await db();
  const pendente = await client.execute({
    sql: "SELECT id FROM impulsionamentos WHERE anuncio_id = ? AND status = 'pendente'",
    args: [id],
  });
  if (pendente.rows.length > 0) {
    redirect("/meus-anuncios?erro=impulsionamento");
  }

  const precoDia = await getPrecoDiaCentavos();
  const valor = precoDia * dias;

  await client.execute({
    sql: `INSERT INTO impulsionamentos (anuncio_id, usuario_id, dias, valor_centavos, status)
          VALUES (?, ?, ?, ?, 'pendente')`,
    args: [id, usuario.id, dias, valor],
  });

  revalidatePath("/meus-anuncios");
  revalidatePath("/admin");
  redirect("/meus-anuncios?impulsionamento=1");
}

export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { atualizarAnuncioAction } from "@/app/actions/anuncios";
import { AnuncioForm } from "@/components/AnuncioForm";
import { exigirAprovado } from "@/lib/auth";
import { fotosDe, obterAnuncio } from "@/lib/data";

export default async function EditarAnuncioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { id } = await params;
  const { erro } = await searchParams;
  const anuncioId = Number.parseInt(id, 10);
  if (!Number.isFinite(anuncioId)) notFound();

  const usuario = await exigirAprovado();
  const anuncio = await obterAnuncio(anuncioId);
  if (!anuncio) notFound();
  if (anuncio.usuario_id !== usuario.id && usuario.role !== "admin") notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <Link href={`/anuncio/${anuncio.id}`} className="text-sm font-medium text-brand-700 hover:underline">← Voltar ao anúncio</Link>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">Editar anúncio</h1>
      </div>
      <AnuncioForm
        action={atualizarAnuncioAction}
        modo="editar"
        erro={erro}
        anuncio={{
          id: anuncio.id,
          titulo: anuncio.titulo,
          descricao: anuncio.descricao,
          preco_centavos: anuncio.preco_centavos,
          categoria: anuncio.categoria,
          condicao: anuncio.condicao,
          bairro: anuncio.bairro,
          whatsapp: anuncio.whatsapp,
          fotos: fotosDe(anuncio),
        }}
      />
    </div>
  );
}

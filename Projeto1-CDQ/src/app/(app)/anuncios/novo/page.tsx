export const dynamic = "force-dynamic";

import Link from "next/link";
import { criarAnuncioAction } from "@/app/actions/anuncios";
import { AnuncioForm } from "@/components/AnuncioForm";

export default async function NovoAnuncioPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <Link href="/meus-anuncios" className="text-sm font-medium text-brand-700 hover:underline">← Meus anúncios</Link>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">Novo anúncio</h1>
        <p className="text-sm text-slate-500">Preencha os dados. A equipe do bairro aprova antes de publicar.</p>
      </div>
      <AnuncioForm action={criarAnuncioAction} modo="criar" erro={erro} />
    </div>
  );
}

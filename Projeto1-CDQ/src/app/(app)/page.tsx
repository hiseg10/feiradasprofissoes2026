export const dynamic = "force-dynamic";

import Link from "next/link";
import { CardAnuncio } from "@/components/CardAnuncio";
import { CATEGORIAS } from "@/lib/constantes";
import { exigirAprovado } from "@/lib/auth";
import { listarAnuncios } from "@/lib/data";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}) {
  const usuario = await exigirAprovado();
  const { q, categoria } = await searchParams;
  const busca = q ?? "";
  const cat = categoria ?? "";
  const anuncios = await listarAnuncios(busca, cat);

  function hrefCategoria(valor: string) {
    const params = new URLSearchParams();
    if (busca) params.set("q", busca);
    if (valor) params.set("categoria", valor);
    const query = params.toString();
    return query ? `/?${query}` : "/";
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 p-6 text-white sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-100">Bairro Deus Quer</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">O que você procura hoje?</h1>
        <p className="mt-1 max-w-xl text-sm text-brand-100">
          Olá, {usuario.nome.split(" ")[0]}. Anúncios de vizinhos, aprovados pela equipe do bairro. Compre, venda e troque com segurança.
        </p>
        <form className="mt-5 flex max-w-xl gap-2">
          {cat ? <input type="hidden" name="categoria" value={cat} /> : null}
          <input
            name="q"
            defaultValue={busca}
            className="w-full rounded-lg border-0 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none ring-2 ring-transparent focus:ring-amber-300"
            placeholder="Buscar por celular, bicicleta, geladeira..."
          />
          <button type="submit" className="btn-accent shrink-0">Buscar</button>
        </form>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link
          href={hrefCategoria("")}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            cat === "" ? "bg-brand-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
          }`}
        >
          Todos
        </Link>
        {CATEGORIAS.map((item) => (
          <Link
            key={item.valor}
            href={hrefCategoria(item.valor)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              cat === item.valor ? "bg-brand-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {item.rotulo}
          </Link>
        ))}
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            {busca ? `Resultados para “${busca}”` : cat ? CATEGORIAS.find((c) => c.valor === cat)?.rotulo : "Anúncios recentes"}
          </h2>
          <p className="text-sm text-slate-500">{anuncios.length} anúncio(s) encontrado(s).</p>
        </div>
        <Link href="/anuncios/novo" className="btn-secondary px-3 py-1.5 text-xs">Publicar</Link>
      </div>

      {anuncios.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm font-medium text-slate-600">Nenhum anúncio encontrado.</p>
          <p className="mt-1 text-xs text-slate-400">
            {busca || cat ? "Tente outra busca ou categoria." : "Seja o primeiro a anunciar no bairro."}
          </p>
          <Link href="/anuncios/novo" className="btn-primary mt-4">Criar anúncio</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {anuncios.map((anuncio) => (
            <CardAnuncio key={anuncio.id} anuncio={anuncio} />
          ))}
        </div>
      )}

      <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Tem algo parado em casa?</h3>
          <p className="text-xs text-slate-500">Publique no classificados do bairro e combine pelo WhatsApp.</p>
        </div>
        <Link href="/anuncios/novo" className="btn-primary">Anunciar agora</Link>
      </div>
    </div>
  );
}

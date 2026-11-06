import type { Metadata } from "next";
import StoreExplorer from "@/components/StoreExplorer";
import { JOGOS } from "@/lib/catalogo";

export const metadata: Metadata = {
  title: "Loja · Story Games",
  description: "Catálogo de jogos narrativos com filtros por gênero, preço e avaliação.",
};

export default async function LojaPage({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string; genero?: string }>;
}) {
  const { busca, genero } = await searchParams;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="max-w-3xl">
        <p className="eyebrow">Loja</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Encontre sua próxima história
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Catálogo fictício de jogos narrativos. Filtre por gênero, preço e avaliação. Nenhuma
          compra real é processada.
        </p>
      </header>

      <div className="mt-6">
        <StoreExplorer
          key={`${busca ?? ""}-${genero ?? ""}`}
          jogos={JOGOS}
          buscaInicial={busca ?? ""}
          generoInicial={genero ?? "todos"}
        />
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import LibraryView from "@/components/LibraryView";

export const metadata: Metadata = {
  title: "Biblioteca · Story Games",
  description: "Seus jogos comprados, com lançador simulado e instalação fictícia.",
};

export default function BibliotecaPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="max-w-2xl">
        <p className="eyebrow">Biblioteca</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Sua coleção de histórias
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Jogos comprados ficam aqui. O lançador é simulado e serve para demonstrar a experiência.
        </p>
      </header>
      <LibraryView />
    </main>
  );
}

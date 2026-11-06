import type { Metadata } from "next";
import WishlistView from "@/components/WishlistView";

export const metadata: Metadata = {
  title: "Lista de desejos · Story Games",
  description: "Jogos salvos para decidir depois.",
};

export default function ListaDesejosPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="max-w-2xl">
        <p className="eyebrow">Lista de desejos</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Para decidir com calma
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Salve jogos, compare preços e mova para o carrinho quando quiser.
        </p>
      </header>
      <WishlistView />
    </main>
  );
}

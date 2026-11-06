import type { Metadata } from "next";
import CartView from "@/components/CartView";

export const metadata: Metadata = {
  title: "Carrinho · Story Games",
  description: "Revise os jogos antes de finalizar a compra simulada.",
};

export default function CarrinhoPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="max-w-2xl">
        <p className="eyebrow">Carrinho</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Seu carrinho
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Revise os jogos antes de finalizar. A compra é simulada.
        </p>
      </header>
      <CartView />
    </main>
  );
}

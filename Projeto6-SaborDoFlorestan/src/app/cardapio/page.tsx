import type { Metadata } from "next";
import BotaoImprimir from "@/components/BotaoImprimir";
import { brl } from "@/lib/format";
import { listarProdutos } from "@/lib/queries";
import { CATEGORIAS } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cardápio · Sabor do Florestan",
  description: "Cardápio da cantina da Feira das Profissões Florestan 2026.",
};

export default async function CardapioPage() {
  const produtos = await listarProdutos(false);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="no-print mb-4 flex justify-end">
        <BotaoImprimir />
      </div>

      <header className="text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-600 text-lg font-black text-white">
          SF
        </span>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-ink">
          Sabor do Florestan
        </h1>
        <p className="mt-1 text-sm text-amber-900/60">
          Cardápio da cantina · Feira das Profissões Florestan 2026
        </p>
        <p className="mt-0.5 text-xs text-amber-900/50">
          2º ano A · Pix, cartão e dinheiro
        </p>
      </header>

      <div className="mt-6 space-y-5">
        {CATEGORIAS.map((categoria) => {
          const itens = produtos.filter(
            (produto) => produto.categoria === categoria,
          );
          if (!itens.length) return null;

          return (
            <section key={categoria} className="card p-5">
              <h2 className="text-lg font-black text-ink">{categoria}</h2>
              <div className="mt-3 space-y-1">
                {itens.map((produto) => (
                  <div
                    key={produto.id}
                    className="flex items-start justify-between gap-3 border-b border-brand-50 py-2 last:border-0"
                  >
                    <div className="flex min-w-0 gap-3">
                      <span className="text-2xl">{produto.emoji}</span>
                      <div>
                        <p className="text-sm font-bold text-ink">
                          {produto.nome}
                        </p>
                        <p className="text-xs text-amber-900/60">
                          {produto.descricao}
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 text-sm font-black text-brand-700">
                      {brl(produto.precoCentavos)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-amber-900/50">
        Preços em reais. O cardápio pode mudar conforme a disponibilidade.
      </p>
    </main>
  );
}

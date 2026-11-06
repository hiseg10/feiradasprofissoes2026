"use client";

import Link from "next/link";
import { useState } from "react";
import { useLoja } from "./LojaProvider";
import { precoFinal, type Jogo } from "@/lib/catalogo";
import { brl } from "@/lib/format";

export default function CartView() {
  const {
    pronto,
    itensCarrinho,
    subtotal,
    desconto,
    total,
    removerDoCarrinho,
    finalizarCompra,
  } = useLoja();
  const [comprados, setComprados] = useState<Jogo[]>([]);

  if (!pronto) {
    return <div className="card mt-6 h-48 animate-pulse" />;
  }

  if (comprados.length) {
    return (
      <div className="card mt-6 p-6">
        <p className="text-3xl">✓</p>
        <h2 className="mt-2 text-xl font-black text-white">Compra simulada concluída</h2>
        <p className="mt-1 text-sm text-slate-400">
          Os jogos abaixo foram para a sua biblioteca.
        </p>
        <ul className="mt-4 space-y-2">
          {comprados.map((jogo) => (
            <li
              key={jogo.slug}
              className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2 text-sm"
            >
              <span className="text-slate-200">{jogo.titulo}</span>
              <span className="text-lime-300">{brl(precoFinal(jogo))}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/biblioteca" className="btn-primary">
            Abrir biblioteca
          </Link>
          <Link href="/loja" className="btn-secondary">
            Continuar comprando
          </Link>
        </div>
        <p className="mt-4 text-[11px] text-slate-500">
          Nenhum pagamento real foi processado.
        </p>
      </div>
    );
  }

  if (!itensCarrinho.length) {
    return (
      <div className="card mt-6 p-10 text-center">
        <p className="text-4xl">🛒</p>
        <h2 className="mt-3 text-xl font-bold text-white">Seu carrinho está vazio</h2>
        <p className="mt-1 text-sm text-slate-400">
          Explore a loja e adicione jogos para a sua coleção.
        </p>
        <Link href="/loja" className="btn-primary mt-5">
          Ir para a loja
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        {itensCarrinho.map((jogo) => (
          <div key={jogo.slug} className="card flex items-center gap-3 p-3 sm:gap-4">
            <div
              className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg text-2xl"
              style={{
                background: `linear-gradient(135deg, ${jogo.cores[0]}, ${jogo.cores[1]})`,
              }}
            >
              {jogo.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/jogo/${jogo.slug}`}
                className="text-sm font-bold text-white hover:text-steam-300"
              >
                {jogo.titulo}
              </Link>
              <p className="text-xs text-slate-500">
                {jogo.generos.join(" · ")} · {jogo.tempoMedioHoras}h
              </p>
            </div>
            <div className="text-right">
              {jogo.desconto > 0 ? (
                <p className="text-[10px] text-slate-500 line-through">
                  {brl(jogo.precoCentavos)}
                </p>
              ) : null}
              <p className="text-sm font-bold text-lime-300">{brl(precoFinal(jogo))}</p>
            </div>
            <button
              type="button"
              onClick={() => removerDoCarrinho(jogo.slug)}
              className="btn-secondary shrink-0 px-2 py-1 text-xs"
            >
              Remover
            </button>
          </div>
        ))}
      </div>

      <aside className="card h-fit p-5 lg:sticky lg:top-24">
        <h2 className="text-sm font-bold text-white">Resumo</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-slate-400">Subtotal</dt>
            <dd className="text-slate-200">{brl(subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-400">Descontos</dt>
            <dd className="text-lime-300">{desconto > 0 ? `-${brl(desconto)}` : brl(0)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-white/10 pt-2 text-base font-bold">
            <dt className="text-white">Total</dt>
            <dd className="text-lime-300">{brl(total)}</dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={() => {
            const lista = finalizarCompra();
            if (lista.length) setComprados(lista);
          }}
          className="btn-primary mt-4 w-full"
        >
          Finalizar compra
        </button>
        <p className="mt-2 text-center text-[11px] text-slate-500">
          Pagamento simulado. Nada será cobrado.
        </p>
        <Link
          href="/loja"
          className="mt-3 block text-center text-xs text-steam-300 hover:underline"
        >
          Continuar comprando
        </Link>
      </aside>
    </div>
  );
}

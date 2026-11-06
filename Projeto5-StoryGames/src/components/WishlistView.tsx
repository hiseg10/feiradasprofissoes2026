"use client";

import Link from "next/link";
import { useLoja } from "./LojaProvider";
import GameCard from "./GameCard";
import { buscarJogos } from "@/lib/catalogo";

export default function WishlistView() {
  const {
    pronto,
    desejos,
    noCarrinho,
    possui,
    adicionarAoCarrinho,
    alternarDesejo,
  } = useLoja();

  if (!pronto) {
    return <div className="card mt-6 h-48 animate-pulse" />;
  }

  const jogos = buscarJogos(desejos);

  if (!jogos.length) {
    return (
      <div className="card mt-6 p-10 text-center">
        <p className="text-4xl">💙</p>
        <h2 className="mt-3 text-xl font-bold text-white">Sua lista está vazia</h2>
        <p className="mt-1 text-sm text-slate-400">
          Salve jogos para decidir com calma depois.
        </p>
        <Link href="/loja" className="btn-primary mt-5">
          Descobrir jogos
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {jogos.map((jogo) => {
        const dono = possui(jogo.slug);
        const noCarrinhoAtual = noCarrinho(jogo.slug);

        return (
          <div key={jogo.slug} className="space-y-2">
            <GameCard jogo={jogo} />
            <div className="flex gap-2">
              {dono ? (
                <Link href="/biblioteca" className="btn-secondary flex-1 px-3 py-2 text-xs">
                  Na biblioteca
                </Link>
              ) : noCarrinhoAtual ? (
                <Link href="/carrinho" className="btn-secondary flex-1 px-3 py-2 text-xs">
                  Já no carrinho
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    adicionarAoCarrinho(jogo.slug);
                    alternarDesejo(jogo.slug);
                  }}
                  className="btn-primary flex-1 px-3 py-2 text-xs"
                >
                  Mover para o carrinho
                </button>
              )}
              <button
                type="button"
                onClick={() => alternarDesejo(jogo.slug)}
                className="btn-secondary px-3 py-2 text-xs"
              >
                Remover
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

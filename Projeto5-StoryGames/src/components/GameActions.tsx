"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLoja } from "./LojaProvider";
import type { Jogo } from "@/lib/catalogo";

export default function GameActions({ jogo }: { jogo: Jogo }) {
  const router = useRouter();
  const {
    pronto,
    possui,
    noCarrinho,
    noDesejo,
    adicionarAoCarrinho,
    alternarDesejo,
  } = useLoja();
  const [mensagem, setMensagem] = useState<string | null>(null);

  if (!pronto) {
    return <div className="h-28 animate-pulse rounded-xl bg-white/5" />;
  }

  if (possui(jogo.slug)) {
    return (
      <div className="rounded-xl border border-lime-400/30 bg-lime-400/10 p-4">
        <p className="text-sm font-bold text-lime-200">Este jogo está na sua biblioteca</p>
        <Link href="/biblioteca" className="btn-primary mt-3 w-full">
          Abrir biblioteca
        </Link>
      </div>
    );
  }

  const jaNoCarrinho = noCarrinho(jogo.slug);

  return (
    <div className="space-y-2">
      <button
        type="button"
        className="btn-primary w-full"
        disabled={jaNoCarrinho}
        onClick={() => {
          adicionarAoCarrinho(jogo.slug);
          setMensagem("Adicionado ao carrinho.");
        }}
      >
        {jaNoCarrinho ? "Já está no carrinho" : "Adicionar ao carrinho"}
      </button>

      <button
        type="button"
        className="btn-secondary w-full"
        onClick={() => {
          adicionarAoCarrinho(jogo.slug);
          router.push("/carrinho");
        }}
      >
        Comprar agora
      </button>

      <button
        type="button"
        className="btn-secondary w-full"
        onClick={() => alternarDesejo(jogo.slug)}
      >
        {noDesejo(jogo.slug)
          ? "Remover da lista de desejos"
          : "Adicionar à lista de desejos"}
      </button>

      {mensagem ? <p className="text-center text-xs text-lime-300">{mensagem}</p> : null}
      {jaNoCarrinho ? (
        <Link href="/carrinho" className="block text-center text-xs text-steam-300 hover:underline">
          Ver carrinho
        </Link>
      ) : null}
    </div>
  );
}

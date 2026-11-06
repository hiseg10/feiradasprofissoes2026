"use client";

import { useEffect, useState } from "react";
import type { Cotacao } from "@/lib/types";
import { brl, percentual } from "@/lib/format";

export default function TickerTape({ inicial }: { inicial: Cotacao[] }) {
  const [cotacoes, setCotacoes] = useState(inicial);
  const [atualizadoEm, setAtualizadoEm] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    async function atualizar() {
      try {
        const resposta = await fetch("/api/mercado/cotacoes", { cache: "no-store" });
        if (!resposta.ok) return;
        const dados = (await resposta.json()) as { cotacoes?: Cotacao[]; atualizadoEm?: string };
        if (ativo && dados.cotacoes?.length) {
          setCotacoes(dados.cotacoes);
          setAtualizadoEm(dados.atualizadoEm ?? new Date().toISOString());
        }
      } catch {
        // mantém os últimos valores
      }
    }

    const id = setInterval(atualizar, 60_000);
    return () => {
      ativo = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="border-y border-white/10 bg-white/5">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2.5">
        <span className="flex shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
          Ao vivo
        </span>
        <div className="flex gap-5 overflow-x-auto pb-0.5">
          {cotacoes.map((cotacao) => {
            const alta = cotacao.variacaoPercentual >= 0;
            return (
              <div key={cotacao.simbolo} className="flex shrink-0 items-baseline gap-2 text-xs">
                <span className="font-bold text-white">{cotacao.simbolo}</span>
                <span className="text-slate-300">{brl(cotacao.preco)}</span>
                <span className={alta ? "font-semibold text-brand-300" : "font-semibold text-rose-300"}>
                  {percentual(cotacao.variacaoPercentual)}
                </span>
              </div>
            );
          })}
        </div>
        {atualizadoEm ? (
          <span className="ml-auto hidden shrink-0 text-[10px] text-slate-400 md:block">
            Atualizado{" "}
            {new Date(atualizadoEm).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        ) : null}
      </div>
    </div>
  );
}

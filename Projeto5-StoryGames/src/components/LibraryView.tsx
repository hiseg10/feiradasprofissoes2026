"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLoja } from "./LojaProvider";
import { buscarJogos, type Jogo } from "@/lib/catalogo";

export default function LibraryView() {
  const { pronto, biblioteca, instalados, instalar } = useLoja();
  const [jogoAberto, setJogoAberto] = useState<Jogo | null>(null);
  const [progresso, setProgresso] = useState(0);

  useEffect(() => {
    if (!jogoAberto) return;
    const id = window.setInterval(() => {
      setProgresso((valor) => {
        if (valor >= 100) {
          window.clearInterval(id);
          return 100;
        }
        return Math.min(100, valor + 10);
      });
    }, 150);
    return () => window.clearInterval(id);
  }, [jogoAberto]);

  if (!pronto) {
    return <div className="card mt-6 h-48 animate-pulse" />;
  }

  const jogos = buscarJogos(biblioteca);

  if (!jogos.length) {
    return (
      <div className="card mt-6 p-10 text-center">
        <p className="text-4xl">🎮</p>
        <h2 className="mt-3 text-xl font-bold text-white">Sua biblioteca está vazia</h2>
        <p className="mt-1 text-sm text-slate-400">
          Compre um jogo para começar sua coleção narrativa.
        </p>
        <Link href="/loja" className="btn-primary mt-5">
          Explorar a loja
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jogos.map((jogo) => {
          const instalado = instalados.includes(jogo.slug);
          return (
            <div key={jogo.slug} className="card overflow-hidden">
              <div
                className="relative flex aspect-[16/9] items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${jogo.cores[0]}, ${jogo.cores[1]})`,
                }}
              >
                <span className="text-4xl">{jogo.emoji}</span>
                {instalado ? (
                  <span className="badge absolute left-2 top-2 bg-lime-300 text-steam-950">
                    Instalado
                  </span>
                ) : null}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-white">{jogo.titulo}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {jogo.generos.join(" · ")} · ~{jogo.tempoMedioHoras}h
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProgresso(0);
                      setJogoAberto(jogo);
                    }}
                    className="btn-primary px-3 py-1.5 text-xs"
                  >
                    Jogar
                  </button>
                  <button
                    type="button"
                    onClick={() => instalar(jogo.slug)}
                    className="btn-secondary px-3 py-1.5 text-xs"
                  >
                    {instalado ? "Desinstalar" : "Instalar"}
                  </button>
                  <Link
                    href={`/jogo/${jogo.slug}`}
                    className="btn-secondary px-3 py-1.5 text-xs"
                  >
                    Página
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {jogoAberto ? (
        <GameLauncher
          jogo={jogoAberto}
          progresso={progresso}
          onFechar={() => setJogoAberto(null)}
        />
      ) : null}
    </div>
  );
}

function GameLauncher({
  jogo,
  progresso,
  onFechar,
}: {
  jogo: Jogo;
  progresso: number;
  onFechar: () => void;
}) {
  const pronto = progresso >= 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Lançador de ${jogo.titulo}`}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-steam-900">
        <div
          className="flex aspect-video items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${jogo.cores[0]}, ${jogo.cores[1]})`,
          }}
        >
          <span className="text-6xl">{jogo.emoji}</span>
        </div>
        <div className="p-5">
          <h2 className="text-lg font-black text-white">{jogo.titulo}</h2>
          <p className="mt-1 text-xs text-slate-400">
            {pronto ? "Sessão iniciada." : "Preparando o jogo..."}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-lime-400 transition-all"
              style={{ width: `${progresso}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Lançador simulado. Nenhum jogo real é executado.
          </p>
          <div className="mt-4 flex justify-end">
            <button type="button" onClick={onFechar} className="btn-primary px-4 py-2 text-sm">
              {pronto ? "Encerrar sessão" : "Cancelar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

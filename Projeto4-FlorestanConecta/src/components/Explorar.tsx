"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CATEGORIAS,
  CORES_CATEGORIA,
  type Categoria,
  type Ponto,
} from "@/lib/conteudo";

export default function Explorar({ pontos }: { pontos: Ponto[] }) {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<Categoria | "Todos">("Todos");

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return pontos.filter((ponto) => {
      const combinaCategoria = categoria === "Todos" || ponto.categoria === categoria;
      const texto = [ponto.nome, ponto.descricao, ponto.endereco, ...ponto.tags]
        .join(" ")
        .toLowerCase();
      const combinaBusca = !termo || texto.includes(termo);
      return combinaCategoria && combinaBusca;
    });
  }, [busca, categoria, pontos]);

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            ⌕
          </span>
          <input
            className="input pl-8"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Busque por café, artesanato, praça..."
            aria-label="Buscar pontos"
          />
        </div>
        <p className="text-xs text-slate-500">
          {filtrados.length} {filtrados.length === 1 ? "ponto" : "pontos"} encontrados
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategoria("Todos")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            categoria === "Todos"
              ? "bg-slate-900 text-white"
              : "border border-slate-300 bg-white text-slate-600 hover:border-slate-400"
          }`}
        >
          Todos
        </button>
        {CATEGORIAS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategoria(item)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              categoria === item
                ? "bg-slate-900 text-white"
                : "border border-slate-300 bg-white text-slate-600 hover:border-slate-400"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {filtrados.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((ponto) => {
            const cores = CORES_CATEGORIA[ponto.categoria];
            return (
              <Link
                key={ponto.slug}
                href={`/pontos/${ponto.slug}`}
                className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className={`relative flex h-28 items-center justify-center bg-gradient-to-br ${cores.gradiente}`}
                >
                  <span className="text-4xl drop-shadow-sm">{ponto.emoji}</span>
                  {ponto.destaque ? (
                    <span className="badge absolute right-2 top-2 bg-white/90 text-slate-700">
                      Destaque
                    </span>
                  ) : null}
                </div>
                <div className="p-4">
                  <span className={`badge ${cores.chip}`}>{ponto.categoria}</span>
                  <h3 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-teal-800">
                    {ponto.nome}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                    {ponto.descricao}
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
                    <span>📍</span>
                    {ponto.endereco}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-2xl">🔎</p>
          <p className="mt-2 text-sm font-semibold text-slate-700">Nenhum ponto encontrado</p>
          <p className="mt-1 text-xs text-slate-500">
            Tente outra palavra ou selecione a categoria &ldquo;Todos&rdquo;.
          </p>
        </div>
      )}
    </section>
  );
}

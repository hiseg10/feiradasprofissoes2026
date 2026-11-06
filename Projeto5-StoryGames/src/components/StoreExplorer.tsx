"use client";

import { useMemo, useState } from "react";
import GameCard from "./GameCard";
import { generosUnicos, precoFinal, type Jogo } from "@/lib/catalogo";

type Props = {
  jogos: Jogo[];
  buscaInicial?: string;
  generoInicial?: string;
};

const PRECOS = [
  { valor: "todos", rotulo: "Todos os preços" },
  { valor: "ate30", rotulo: "Até R$ 30" },
  { valor: "30a60", rotulo: "R$ 30 a R$ 60" },
  { valor: "acima60", rotulo: "Acima de R$ 60" },
];

const ORDENS = [
  { valor: "relevancia", rotulo: "Relevância" },
  { valor: "menor", rotulo: "Menor preço" },
  { valor: "maior", rotulo: "Maior preço" },
  { valor: "nota", rotulo: "Melhor avaliados" },
  { valor: "desconto", rotulo: "Maiores descontos" },
];

export default function StoreExplorer({
  jogos,
  buscaInicial = "",
  generoInicial = "todos",
}: Props) {
  const [busca, setBusca] = useState(buscaInicial);
  const [genero, setGenero] = useState(generoInicial || "todos");
  const [preco, setPreco] = useState("todos");
  const [ordem, setOrdem] = useState("relevancia");

  const generos = useMemo(() => generosUnicos(), []);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    const lista = jogos.filter((jogo) => {
      const texto = [
        jogo.titulo,
        jogo.desenvolvedora,
        jogo.publicadora,
        ...jogo.generos,
        ...jogo.tags,
      ]
        .join(" ")
        .toLowerCase();

      const combinaBusca = !termo || texto.includes(termo);
      const combinaGenero = genero === "todos" || jogo.generos.includes(genero);
      const valor = precoFinal(jogo) / 100;
      const combinaPreco =
        preco === "todos" ||
        (preco === "ate30" && valor <= 30) ||
        (preco === "30a60" && valor > 30 && valor <= 60) ||
        (preco === "acima60" && valor > 60);

      return combinaBusca && combinaGenero && combinaPreco;
    });

    return [...lista].sort((a, b) => {
      if (ordem === "menor") return precoFinal(a) - precoFinal(b);
      if (ordem === "maior") return precoFinal(b) - precoFinal(a);
      if (ordem === "nota") return b.nota - a.nota;
      if (ordem === "desconto") return b.desconto - a.desconto;
      return b.totalAvaliacoes - a.totalAvaliacoes;
    });
  }, [busca, genero, preco, ordem, jogos]);

  function limpar() {
    setBusca("");
    setGenero("todos");
    setPreco("todos");
    setOrdem("relevancia");
  }

  return (
    <div>
      <div className="card p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="md:col-span-2">
            <span className="label">Buscar</span>
            <input
              className="input"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              placeholder="Título, estúdio, tag..."
            />
          </label>
          <label>
            <span className="label">Gênero</span>
            <select
              className="input"
              value={genero}
              onChange={(evento) => setGenero(evento.target.value)}
            >
              <option value="todos">Todos</option>
              {generos.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Preço</span>
            <select
              className="input"
              value={preco}
              onChange={(evento) => setPreco(evento.target.value)}
            >
              {PRECOS.map((item) => (
                <option key={item.valor} value={item.valor}>
                  {item.rotulo}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Ordenar</span>
            <select
              className="input"
              value={ordem}
              onChange={(evento) => setOrdem(evento.target.value)}
            >
              {ORDENS.map((item) => (
                <option key={item.valor} value={item.valor}>
                  {item.rotulo}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button type="button" onClick={limpar} className="btn-secondary w-full">
              Limpar filtros
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          {filtrados.length} {filtrados.length === 1 ? "jogo encontrado" : "jogos encontrados"}
        </p>
      </div>

      {filtrados.length ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtrados.map((jogo) => (
            <GameCard key={jogo.slug} jogo={jogo} />
          ))}
        </div>
      ) : (
        <div className="card mt-5 p-10 text-center">
          <p className="text-sm font-semibold text-white">Nenhum jogo encontrado</p>
          <p className="mt-1 text-xs text-slate-400">
            Tente outro termo ou limpe os filtros.
          </p>
        </div>
      )}
    </div>
  );
}

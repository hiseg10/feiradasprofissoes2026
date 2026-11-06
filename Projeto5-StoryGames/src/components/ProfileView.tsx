"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useLoja } from "./LojaProvider";

export default function ProfileView() {
  const {
    pronto,
    nome,
    definirNome,
    biblioteca,
    desejos,
    carrinho,
    reiniciar,
  } = useLoja();
  const [salvo, setSalvo] = useState(false);
  const inputNome = useRef<HTMLInputElement>(null);

  if (!pronto) {
    return <div className="card mt-6 h-48 animate-pulse" />;
  }

  const conquistas = [
    { titulo: "Primeiro passo", descricao: "Adicione um jogo à biblioteca.", desbloqueada: biblioteca.length >= 1 },
    { titulo: "Colecionador", descricao: "Tenha 3 jogos na biblioteca.", desbloqueada: biblioteca.length >= 3 },
    { titulo: "Maratonista", descricao: "Tenha 5 jogos na biblioteca.", desbloqueada: biblioteca.length >= 5 },
    { titulo: "Planejador", descricao: "Coloque 3 jogos na lista de desejos.", desbloqueada: desejos.length >= 3 },
    { titulo: "Carrinho cheio", descricao: "Tenha 2 jogos no carrinho.", desbloqueada: carrinho.length >= 2 },
  ];

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[320px_1fr]">
      <div className="card p-5 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-steam-600 text-2xl font-black text-white">
          {nome.slice(0, 2).toUpperCase()}
        </div>
        <h2 className="mt-3 text-lg font-bold text-white">{nome}</h2>
        <p className="text-xs text-slate-500">Conta simulada · Story Games</p>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-white/5 p-2">
            <p className="text-lg font-black text-white">{biblioteca.length}</p>
            <p className="text-[10px] text-slate-500">Jogos</p>
          </div>
          <div className="rounded-xl bg-white/5 p-2">
            <p className="text-lg font-black text-white">{desejos.length}</p>
            <p className="text-[10px] text-slate-500">Desejos</p>
          </div>
          <div className="rounded-xl bg-white/5 p-2">
            <p className="text-lg font-black text-white">{carrinho.length}</p>
            <p className="text-[10px] text-slate-500">Carrinho</p>
          </div>
        </div>

        <div className="mt-4 text-left">
          <label htmlFor="nome" className="label">
            Nome de exibição
          </label>
          <input
            id="nome"
            key={nome}
            ref={inputNome}
            className="input"
            defaultValue={nome}
            maxLength={40}
          />
          <button
            type="button"
            className="btn-primary mt-2 w-full"
            onClick={() => {
              definirNome(inputNome.current?.value ?? nome);
              setSalvo(true);
              window.setTimeout(() => setSalvo(false), 2000);
            }}
          >
            Salvar nome
          </button>
          {salvo ? (
            <p className="mt-1 text-center text-xs text-lime-300">Nome atualizado.</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => {
            if (window.confirm("Zerar carrinho, biblioteca e desejos?")) {
              reiniciar();
            }
          }}
          className="mt-4 text-xs text-red-400 hover:underline"
        >
          Zerar dados da conta
        </button>
      </div>

      <div>
        <h2 className="text-lg font-bold text-white">Conquistas</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {conquistas.map((conquista) => (
            <div
              key={conquista.titulo}
              className={`card p-4 ${
                conquista.desbloqueada ? "border-lime-400/40" : "opacity-60"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-white">{conquista.titulo}</p>
                <span
                  className={`badge ${
                    conquista.desbloqueada
                      ? "bg-lime-400/15 text-lime-300"
                      : "bg-white/5 text-slate-500"
                  }`}
                >
                  {conquista.desbloqueada ? "Desbloqueada" : "Bloqueada"}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">{conquista.descricao}</p>
            </div>
          ))}
        </div>

        <div className="card mt-4 p-5">
          <h2 className="text-sm font-bold text-white">Atalhos</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/biblioteca" className="btn-secondary px-3 py-2 text-xs">
              Biblioteca
            </Link>
            <Link href="/lista-desejos" className="btn-secondary px-3 py-2 text-xs">
              Lista de desejos
            </Link>
            <Link href="/loja" className="btn-primary px-3 py-2 text-xs">
              Ir à loja
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

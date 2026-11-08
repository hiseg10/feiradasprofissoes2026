"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useSession } from "@/components/SessionProvider";
import type { Cargo, Equipe } from "@/lib/types";

function etiquetaCargo(cargo: string): string {
  switch (cargo) {
    case "caixa":
      return "Caixa";
    case "atendente":
      return "Atendente";
    case "garçon":
      return "Garçom";
    case "operador_cozinha":
      return "Operador de Cozinha";
    default:
      return cargo;
  }
}

export default function EquipesPanel() {
  const { sessao } = useSession();
  const isAdmin =
    (sessao.operadorNome ?? "").trim().toLowerCase() === "admin";
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [editando, setEditando] = useState<Equipe | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [codigoOperacao, setCodigoOperacao] = useState("");
  const [cargo, setCargo] = useState<Cargo>("caixa");

  const carregar = useCallback(async () => {
    try {
      const resposta = await fetch("/api/admin/equipes", { cache: "no-store" });
      if (!resposta.ok) throw new Error("Falha ao carregar equipes.");
      const dados = (await resposta.json()) as Equipe[];
      setEquipes(dados);
      setErro(null);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Erro ao carregar equipas.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => void carregar(), 0);
    return () => window.clearTimeout(id);
  }, [carregar]);

  async function criar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!nome.trim()) {
      setErro("Informe o nome da equipe.");
      return;
    }
    if (!codigoOperacao.trim()) {
      setErro("Informe o código de operação.");
      return;
    }
    try {
      const resposta = await fetch("/api/admin/equipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          cargo,
          codigoOperacao: codigoOperacao.trim(),
          ativo: 1,
        }),
      });
      const dados = (await resposta.json()) as (Equipe & { erro?: string });
      if (!resposta.ok || dados.erro) {
        throw new Error(dados.erro ?? "Falha ao salvar a equipe.");
      }
      setNome("");
      setCodigoOperacao("");
      setCargo("caixa");
      setErro(null);
      await carregar();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Erro ao salvar a equipe.");
    }
  }

  async function atualizar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!editando) return;
    if (!editando.nome.trim()) {
      setErro("Informe o nome da equipe.");
      return;
    }
    try {
      const resposta = await fetch(`/api/admin/equipes/${editando.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: editando.nome, cargo: editando.cargo, ativo: editando.ativo }),
      });
      const dados = (await resposta.json()) as (Equipe & { erro?: string });
      if (!resposta.ok || dados.erro) {
        throw new Error(dados.erro ?? "Falha ao atualizar a equipe.");
      }
      setEditando(null);
      setErro(null);
      await carregar();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Erro ao atualizar a equipe.");
    }
  }

  async function remover(id: number) {
    try {
      const resposta = await fetch(`/api/equipes/${id}`, {
        method: "DELETE",
      });
      if (!resposta.ok) {
        const dados = (await resposta.json()) as { erro?: string };
        throw new Error(dados.erro ?? "Falha ao remover a equipe.");
      }
      await carregar();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Erro ao remover a equipe.");
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Gestão</p>
          <h1 className="text-3xl font-black tracking-tight text-ink">Equipes</h1>
          <p className="mt-1 text-sm text-amber-900/60">
            Cadastre caixa, atendente/garçom e operadores de cozinha.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void carregar()}
          className="btn-secondary px-3 py-1.5 text-xs"
        >
          Atualizar
        </button>
      </header>

      {erro ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{erro}</p>
      ) : null}

      <section className="mt-4 grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <form onSubmit={(evento) => void criar(evento)} className="card space-y-3 p-5">
          <h2 className="text-sm font-bold text-ink">Nova equipe</h2>
          <div>
            <label htmlFor="equipe-nome" className="label">Nome</label>
            <input
              id="equipe-nome"
              className="input"
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              maxLength={80}
              placeholder="Ex.: Maria da Silva"
            />
          </div>
          <div>
            <label htmlFor="equipe-codigo" className="label">
              Código de operação
            </label>
            <input
              id="equipe-codigo"
              className="input"
              value={codigoOperacao}
              onChange={(evento) =>
                setCodigoOperacao(evento.target.value.replace(/\D/g, ""))
              }
              maxLength={6}
              placeholder="Ex.: 2233"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">Criar equipe</button>
            <button
              type="button"
              onClick={() => setCodigoOperacao(String(Math.floor(1000 + Math.random() * 9000)))}
              className="btn-secondary text-[11px] px-2 py-2"
            >
              Gerar
            </button>
          </div>
        </form>

        <div className="card p-5">
          <h2 className="text-sm font-bold text-ink">Equipes cadastradas</h2>
          {carregando && !equipes.length ? (
            <p className="mt-2 text-sm text-amber-900/60">Carregando equipas...</p>
          ) : !equipes.length ? (
            <p className="mt-2 text-xs text-amber-900/50">Nenhuma equipe cadastrada.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-left text-xs">
                <thead className="text-amber-900/50">
                  <tr>
                    <th className="py-2 font-semibold">Nome</th>
                    <th className="py-2 font-semibold">Cargo</th>
                    {isAdmin ? (
                      <th className="py-2 font-semibold">Código</th>
                    ) : null}
                    <th className="py-2 text-right font-semibold">Status</th>
                    <th className="py-2 text-right font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {equipes.map((equipe) => (
                    <tr key={equipe.id} className="border-t border-brand-50 align-middle">
                      <td className="py-2 font-semibold text-ink">{equipe.nome}</td>
                      <td className="py-2 text-amber-900/60">{etiquetaCargo(equipe.cargo)}</td>
                      {isAdmin ? (
                        <td className="py-2">
                          <span className="rounded-md bg-brand-50 px-2 py-1 font-mono text-[11px] font-bold text-brand-800">
                            {equipe.codigoOperacao ?? "—"}
                          </span>
                        </td>
                      ) : null}
                      <td className="py-2 text-right">
                        <span className={`badge ${equipe.ativo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                          {equipe.ativo ? "Ativa" : "Inativa"}
                        </span>
                      </td>
                      <td className="py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditando(equipe)}
                            className="rounded-lg border border-brand-200 bg-white px-2 py-1 text-[11px] font-semibold text-brand-700"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => void remover(equipe.id)}
                            className="rounded-lg border border-red-200 bg-white px-2 py-1 text-[11px] font-semibold text-red-600"
                          >
                            Remover
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {editando ? (
        <section className="mt-5 card p-5">
          <h2 className="text-sm font-bold text-ink">Editar equipe</h2>
          <form onSubmit={(evento) => void atualizar(evento)} className="mt-3 max-w-md space-y-3">
            <div>
              <label htmlFor="editar-nome" className="label">Nome</label>
              <input
                id="editar-nome"
                className="input"
                value={editando.nome}
                onChange={(evento) =>
                  setEditando({ ...editando, nome: evento.target.value })
                }
                maxLength={80}
              />
            </div>
            <div>
              <label htmlFor="editar-cargo" className="label">Cargo</label>
              <select
                id="editar-cargo"
                className="input"
                value={editando.cargo}
                onChange={(evento) =>
                  setEditando({ ...editando, cargo: evento.target.value as Cargo })
                }
              >
                <option value="caixa">Caixa</option>
                <option value="atendente">Atendente</option>
                <option value="garçon">Garçom</option>
                <option value="operador_cozinha">Operador de Cozinha</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input
                type="checkbox"
                checked={editando.ativo === 1}
                onChange={(evento) =>
                  setEditando({ ...editando, ativo: evento.target.checked ? 1 : 0 })
                }
                className="h-4 w-4 accent-brand-600"
              />
              Equipe ativa
            </label>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary px-4 py-2">Salvar</button>
              <button
                type="button"
                onClick={() => setEditando(null)}
                className="btn-secondary px-4 py-2"
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </main>
  );
}

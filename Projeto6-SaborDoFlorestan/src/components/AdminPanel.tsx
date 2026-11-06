"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { brl } from "@/lib/format";
import {
  CATEGORIAS,
  type Categoria,
  type Produto,
  type Resumo,
} from "@/lib/types";

type Formulario = {
  nome: string;
  categoria: Categoria;
  preco: string;
  estoque: string;
  emoji: string;
  descricao: string;
  ativo: boolean;
};

const FORM_VAZIO: Formulario = {
  nome: "",
  categoria: "Salgados",
  preco: "",
  estoque: "30",
  emoji: "🍽️",
  descricao: "",
  ativo: true,
};

function CardResumo({
  rotulo,
  valor,
  detalhe,
  cor = "text-ink",
}: {
  rotulo: string;
  valor: string;
  detalhe?: string;
  cor?: string;
}) {
  return (
    <div className="card p-4">
      <p className="text-[10px] font-bold uppercase tracking-wide text-amber-900/50">
        {rotulo}
      </p>
      <p className={`mt-1 text-xl font-black ${cor}`}>{valor}</p>
      {detalhe ? (
        <p className="mt-0.5 text-[11px] text-amber-900/50">{detalhe}</p>
      ) : null}
    </div>
  );
}

export default function AdminPanel() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [form, setForm] = useState<Formulario>(FORM_VAZIO);

  const carregar = useCallback(async () => {
    try {
      const [produtosResposta, resumoResposta] = await Promise.all([
        fetch("/api/produtos?todos=1", { cache: "no-store" }),
        fetch("/api/resumo", { cache: "no-store" }),
      ]);
      if (!produtosResposta.ok || !resumoResposta.ok) {
        throw new Error("Falha ao carregar a gestão.");
      }
      setProdutos((await produtosResposta.json()) as Produto[]);
      setResumo((await resumoResposta.json()) as Resumo);
      setErro(null);
    } catch (falha) {
      setErro(
        falha instanceof Error ? falha.message : "Erro ao carregar a gestão.",
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => void carregar(), 0);
    return () => window.clearTimeout(id);
  }, [carregar]);

  function novo() {
    setEditando(null);
    setForm(FORM_VAZIO);
  }

  function editar(produto: Produto) {
    setEditando(produto);
    setForm({
      nome: produto.nome,
      categoria: produto.categoria,
      preco: (produto.precoCentavos / 100).toFixed(2),
      estoque: String(produto.estoque),
      emoji: produto.emoji,
      descricao: produto.descricao ?? "",
      ativo: produto.ativo === 1,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const precoCentavos = Math.round(
      (Number(form.preco.replace(",", ".")) || 0) * 100,
    );

    if (!form.nome.trim()) {
      setErro("Informe o nome do produto.");
      return;
    }
    if (precoCentavos <= 0) {
      setErro("Informe um preço maior que zero.");
      return;
    }

    const corpo = {
      nome: form.nome,
      categoria: form.categoria,
      precoCentavos,
      estoque: Number(form.estoque) || 0,
      emoji: form.emoji || "🍽️",
      descricao: form.descricao,
      ativo: form.ativo ? 1 : 0,
    };

    setSalvando(true);
    setErro(null);

    try {
      const resposta = await fetch(
        editando ? `/api/produtos/${editando.id}` : "/api/produtos",
        {
          method: editando ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(corpo),
        },
      );
      const dados = (await resposta.json()) as Produto & { erro?: string };
      if (!resposta.ok || dados.erro) {
        throw new Error(dados.erro ?? "Falha ao salvar o produto.");
      }
      novo();
      await carregar();
    } catch (falha) {
      setErro(
        falha instanceof Error ? falha.message : "Erro ao salvar o produto.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function alterarAtivo(produto: Produto) {
    try {
      const resposta = await fetch(`/api/produtos/${produto.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: produto.ativo ? 0 : 1 }),
      });
      if (!resposta.ok) {
        const dados = (await resposta.json()) as { erro?: string };
        throw new Error(dados.erro ?? "Falha ao alterar o produto.");
      }
      await carregar();
    } catch (falha) {
      setErro(
        falha instanceof Error ? falha.message : "Erro ao alterar o produto.",
      );
    }
  }

  async function repor(produto: Produto) {
    try {
      const resposta = await fetch(`/api/produtos/${produto.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estoque: produto.estoque + 10 }),
      });
      if (!resposta.ok) {
        const dados = (await resposta.json()) as { erro?: string };
        throw new Error(dados.erro ?? "Falha ao repor o estoque.");
      }
      await carregar();
    } catch (falha) {
      setErro(
        falha instanceof Error ? falha.message : "Erro ao repor o estoque.",
      );
    }
  }

  async function zerarVendas() {
    if (
      !window.confirm(
        "Zerar todos os pedidos e voltar o estoque para 30 unidades? Os produtos cadastrados serão mantidos.",
      )
    ) {
      return;
    }
    try {
      const resposta = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmar: true }),
      });
      if (!resposta.ok) {
        const dados = (await resposta.json()) as { erro?: string };
        throw new Error(dados.erro ?? "Falha ao zerar as vendas.");
      }
      await carregar();
    } catch (falha) {
      setErro(
        falha instanceof Error ? falha.message : "Erro ao zerar as vendas.",
      );
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Gestão</p>
          <h1 className="text-3xl font-black tracking-tight text-ink">
            Vendas e cardápio
          </h1>
          <p className="mt-1 text-sm text-amber-900/60">
            Resumo do caixa, produtos, estoque e reposição.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void carregar()}
            className="btn-secondary px-3 py-1.5 text-xs"
          >
            Atualizar
          </button>
          <button
            type="button"
            onClick={() => void zerarVendas()}
            className="btn-danger px-3 py-1.5 text-xs"
          >
            Zerar vendas
          </button>
        </div>
      </header>

      {erro ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {erro}
        </p>
      ) : null}

      {carregando && !resumo ? (
        <div className="card mt-4 p-8 text-center text-sm text-amber-900/60">
          Carregando gestão...
        </div>
      ) : (
        <>
          <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <CardResumo
              rotulo="Total vendido"
              valor={brl(resumo?.totalCentavos ?? 0)}
              detalhe={`${resumo?.pedidos ?? 0} pedidos`}
              cor="text-brand-700"
            />
            <CardResumo
              rotulo="Ticket médio"
              valor={brl(resumo?.ticketMedioCentavos ?? 0)}
            />
            <CardResumo
              rotulo="Pix"
              valor={brl(resumo?.porForma.pix ?? 0)}
              cor="text-emerald-700"
            />
            <CardResumo
              rotulo="Cartão"
              valor={brl(resumo?.porForma.cartao ?? 0)}
              cor="text-blue-700"
            />
            <CardResumo
              rotulo="Dinheiro"
              valor={brl(resumo?.porForma.dinheiro ?? 0)}
              cor="text-amber-700"
            />
            <CardResumo
              rotulo="Produtos ativos"
              valor={String(produtos.filter((p) => p.ativo === 1).length)}
              detalhe={`${produtos.length} cadastrados`}
            />
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.4fr]">
            <form onSubmit={salvar} className="card space-y-3 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-ink">
                  {editando ? "Editar produto" : "Novo produto"}
                </h2>
                {editando ? (
                  <button
                    type="button"
                    onClick={novo}
                    className="text-xs font-semibold text-amber-900/50 hover:text-brand-700"
                  >
                    Cancelar edição
                  </button>
                ) : null}
              </div>

              <div>
                <label htmlFor="nome" className="label">
                  Nome
                </label>
                <input
                  id="nome"
                  className="input"
                  value={form.nome}
                  onChange={(evento) =>
                    setForm({ ...form, nome: evento.target.value })
                  }
                  maxLength={80}
                  placeholder="Ex.: Coxinha de frango"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="categoria" className="label">
                    Categoria
                  </label>
                  <select
                    id="categoria"
                    className="input"
                    value={form.categoria}
                    onChange={(evento) =>
                      setForm({
                        ...form,
                        categoria: evento.target.value as Categoria,
                      })
                    }
                  >
                    {CATEGORIAS.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="preco" className="label">
                    Preço (R$)
                  </label>
                  <input
                    id="preco"
                    className="input"
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.preco}
                    onChange={(evento) =>
                      setForm({ ...form, preco: evento.target.value })
                    }
                    placeholder="7.00"
                  />
                </div>
                <div>
                  <label htmlFor="estoque" className="label">
                    Estoque
                  </label>
                  <input
                    id="estoque"
                    className="input"
                    type="number"
                    min={0}
                    step={1}
                    value={form.estoque}
                    onChange={(evento) =>
                      setForm({ ...form, estoque: evento.target.value })
                    }
                  />
                </div>
                <div>
                  <label htmlFor="emoji" className="label">
                    Emoji
                  </label>
                  <input
                    id="emoji"
                    className="input"
                    value={form.emoji}
                    onChange={(evento) =>
                      setForm({ ...form, emoji: evento.target.value })
                    }
                    maxLength={8}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="descricao" className="label">
                  Descrição
                </label>
                <textarea
                  id="descricao"
                  className="input min-h-20"
                  value={form.descricao}
                  onChange={(evento) =>
                    setForm({ ...form, descricao: evento.target.value })
                  }
                  maxLength={160}
                  placeholder="Descrição curta do produto"
                />
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-ink">
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={(evento) =>
                    setForm({ ...form, ativo: evento.target.checked })
                  }
                  className="h-4 w-4 accent-brand-600"
                />
                Produto ativo no cardápio
              </label>

              <button type="submit" className="btn-primary w-full" disabled={salvando}>
                {salvando
                  ? "Salvando..."
                  : editando
                    ? "Salvar alterações"
                    : "Criar produto"}
              </button>
            </form>

            <div className="card p-5">
              <h2 className="text-sm font-bold text-ink">Produtos</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-left text-xs">
                  <thead className="text-amber-900/50">
                    <tr>
                      <th className="py-2 font-semibold">Produto</th>
                      <th className="py-2 font-semibold">Categoria</th>
                      <th className="py-2 text-right font-semibold">Preço</th>
                      <th className="py-2 text-right font-semibold">Estoque</th>
                      <th className="py-2 text-center font-semibold">Status</th>
                      <th className="py-2 text-right font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.map((produto) => (
                      <tr
                        key={produto.id}
                        className="border-t border-brand-50 align-middle"
                      >
                        <td className="py-2 font-semibold text-ink">
                          <span className="mr-1">{produto.emoji}</span>
                          {produto.nome}
                        </td>
                        <td className="py-2 text-amber-900/60">
                          {produto.categoria}
                        </td>
                        <td className="py-2 text-right font-semibold text-brand-700">
                          {brl(produto.precoCentavos)}
                        </td>
                        <td className="py-2 text-right text-amber-900/60">
                          {produto.estoque}
                        </td>
                        <td className="py-2 text-center">
                          <span
                            className={`badge ${
                              produto.ativo
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {produto.ativo ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="py-2">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => editar(produto)}
                              className="rounded-lg border border-brand-200 bg-white px-2 py-1 text-[11px] font-semibold text-brand-700"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => void repor(produto)}
                              className="rounded-lg border border-brand-200 bg-white px-2 py-1 text-[11px] font-semibold text-brand-700"
                            >
                              +10
                            </button>
                            <button
                              type="button"
                              onClick={() => void alterarAtivo(produto)}
                              className="rounded-lg border border-brand-200 bg-white px-2 py-1 text-[11px] font-semibold text-amber-900/60"
                            >
                              {produto.ativo ? "Desativar" : "Ativar"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="mt-5 card p-5">
            <h2 className="text-sm font-bold text-ink">
              Produtos mais vendidos
            </h2>
            {resumo?.topProdutos.length ? (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-xs">
                  <thead className="text-amber-900/50">
                    <tr>
                      <th className="py-2 font-semibold">Produto</th>
                      <th className="py-2 text-right font-semibold">
                        Quantidade
                      </th>
                      <th className="py-2 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumo.topProdutos.map((produto) => (
                      <tr
                        key={produto.nome}
                        className="border-t border-brand-50"
                      >
                        <td className="py-2 font-semibold text-ink">
                          {produto.nome}
                        </td>
                        <td className="py-2 text-right text-amber-900/60">
                          {produto.quantidade}
                        </td>
                        <td className="py-2 text-right font-semibold text-brand-700">
                          {brl(produto.totalCentavos)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-2 text-xs text-amber-900/50">
                Nenhuma venda registrada ainda.
              </p>
            )}
          </section>
        </>
      )}
    </main>
  );
}

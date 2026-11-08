"use client";

import { useMemo, useState, type FormEvent } from "react";
import { brl } from "@/lib/format";
import type { Produto } from "@/lib/types";
import { useSession } from "@/components/SessionProvider";

type ItemSelecionado = {
  produto: Produto;
  quantidade: number;
};

export default function NovoPedido({
  produtos,
  onFechar,
  onConcluido,
}: {
  produtos: Produto[];
  onFechar: () => void;
  onConcluido: () => void;
}) {
  const { sessao } = useSession();
  const [mesa, setMesa] = useState("");
  const [cliente, setCliente] = useState("");
  const [carrinho, setCarrinho] = useState<ItemSelecionado[]>([]);
  const [busca, setBusca] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pedidoCriado, setPedidoCriado] = useState<{ id: number; hora: string } | null>(null);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return produtos;
    return produtos.filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        (p.descricao ?? "").toLowerCase().includes(termo),
    );
  }, [produtos, busca]);

  function adicionar(produto: Produto) {
    setCarrinho((atual) => {
      const existente = atual.find((i) => i.produto.id === produto.id);
      if (existente) {
        return atual.map((i) =>
          i.produto.id === produto.id
            ? { ...i, quantidade: Math.min(i.quantidade + 1, produto.estoque) }
            : i,
        );
      }
      return [...atual, { produto, quantidade: 1 }];
    });
  }

  function remover(produto: Produto) {
    setCarrinho((atual) =>
      atual
        .map((i) =>
          i.produto.id === produto.id
            ? { ...i, quantidade: i.quantidade - 1 }
            : i,
        )
        .filter((i) => i.quantidade > 0),
    );
  }

  const totalItens = carrinho.reduce((s, i) => s + i.quantidade, 0);

  async function criar(evento: FormEvent) {
    evento.preventDefault();
    if (!carrinho.length) {
      setErro("Adicione pelo menos um produto.");
      return;
    }
    setEnviando(true);
    setErro(null);

    try {
      const resposta = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itens: carrinho.map((i) => ({
            produtoId: i.produto.id,
            quantidade: i.quantidade,
          })),
          formaPagamento: "pix",
          cliente: mesa
            ? `Mesa ${mesa}${cliente.trim() ? " · " + cliente.trim() : ""}`
            : cliente.trim() || null,
          equipeId: sessao.operadorId,
        }),
      });
      const dados = await resposta.json();
      if (!resposta.ok || dados.erro) {
        throw new Error(dados.erro ?? "Erro ao criar pedido.");
      }
      setPedidoCriado({
        id: dados.id,
        hora: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
      setTimeout(() => onConcluido(), 2000);
    } catch (falha) {
      setErro(
        falha instanceof Error ? falha.message : "Erro ao criar pedido.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/60 p-4 pt-12"
      role="dialog"
      aria-modal="true"
      aria-label="Novo pedido"
    >
      <form
        onSubmit={(e) => void criar(e)}
        className="card max-h-[90vh] w-full max-w-3xl overflow-y-auto p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-ink">Novo pedido</h2>
          {mesa ? <span className="badge bg-brand-50 text-brand-700">Mesa {mesa}</span> : null}
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex-1 min-w-[140px]">
            <label htmlFor="mesa" className="label">Mesa</label>
            <input
              id="mesa"
              className="input"
              value={mesa}
              onChange={(e) => setMesa(e.target.value)}
              placeholder="Ex.: 5"
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label htmlFor="cliente" className="label">Cliente</label>
            <input
              id="cliente"
              className="input"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Ex.: Ana"
              maxLength={60}
            />
          </div>
        </div>

        <div className="border-t border-brand-100 pt-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
              Produtos
            </h3>
            <span className="badge bg-brand-50 text-brand-700">{totalItens} itens</span>
          </div>

          <input
            className="input mb-3"
            placeholder="Buscar produto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          <div className="grid gap-2 sm:grid-cols-2 max-h-60 overflow-y-auto">
            {filtrados.length ? (
              filtrados.map((produto) => {
                const item = carrinho.find((i) => i.produto.id === produto.id);
                return (
                  <div
                    key={produto.id}
                    className="flex items-center gap-2 rounded-xl border border-brand-100 p-2"
                  >
                    <span className="text-xl">{produto.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-bold text-ink">{produto.nome}</p>
                      <p className="text-[10px] text-amber-900/60">{brl(produto.precoCentavos)}</p>
                    </div>
                    {item && item.quantidade > 0 ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => remover(produto)}
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-brand-200 bg-white text-xs font-bold text-red-600"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-xs font-bold">{item.quantidade}</span>
                        <button
                          type="button"
                          onClick={() => adicionar(produto)}
                          disabled={item.quantidade >= produto.estoque}
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-brand-200 bg-white text-xs font-bold text-brand-700 disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => adicionar(produto)}
                        disabled={produto.estoque <= 0}
                        className="rounded-lg border border-brand-200 bg-white px-2 py-1 text-[11px] font-semibold text-brand-700 disabled:opacity-40"
                      >
                        + Adicionar
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="col-span-2 py-4 text-center text-xs text-amber-900/50">
                Nenhum produto encontrado.
              </p>
            )}
          </div>
        </div>

        {erro ? (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{erro}</p>
        ) : null}

        {pedidoCriado ? (
          <div className="mt-3 rounded-xl bg-emerald-50 p-4 text-center">
            <p className="text-lg">✅</p>
            <p className="mt-1 text-sm font-bold text-emerald-800">
              Pedido {String(pedidoCriado.id).padStart(3, "0")} criado
            </p>
            <p className="mt-0.5 text-xs text-emerald-700">
              {pedidoCriado.hora} · {carrinho.reduce((s, i) => s + i.quantidade, 0)} itens
            </p>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-brand-100 pt-3">
          <button type="button" onClick={onFechar} className="btn-secondary" disabled={enviando}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={enviando || !carrinho.length}>
            {enviando ? "Criando..." : `Criar pedido (${totalItens})`}
          </button>
        </div>
      </form>
    </div>
  );
}

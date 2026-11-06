"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Checkout from "./Checkout";
import { brl, numeroPedido, rotuloPagamento } from "@/lib/format";
import { CATEGORIAS, type Pedido, type Produto } from "@/lib/types";

type ItemCarrinho = {
  produto: Produto;
  quantidade: number;
};

export default function Pdv({ produtos }: { produtos: Produto[] }) {
  const router = useRouter();
  const [carrinho, setCarrinho] = useState<Record<number, number>>({});
  const [categoria, setCategoria] = useState<string>("Todos");
  const [busca, setBusca] = useState("");
  const [checkoutAberto, setCheckoutAberto] = useState(false);
  const [pedidoConcluido, setPedidoConcluido] = useState<Pedido | null>(null);

  const itens = useMemo<ItemCarrinho[]>(() => {
    return Object.entries(carrinho)
      .map(([id, quantidade]) => {
        const produto = produtos.find((item) => item.id === Number(id));
        return produto ? { produto, quantidade } : null;
      })
      .filter((item): item is ItemCarrinho => item !== null);
  }, [carrinho, produtos]);

  const totalCentavos = itens.reduce(
    (total, item) => total + item.produto.precoCentavos * item.quantidade,
    0,
  );
  const totalItens = itens.reduce((total, item) => total + item.quantidade, 0);

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return produtos.filter((produto) => {
      const combinaCategoria =
        categoria === "Todos" || produto.categoria === categoria;
      const combinaBusca =
        !termo ||
        [produto.nome, produto.descricao ?? "", produto.categoria]
          .join(" ")
          .toLowerCase()
          .includes(termo);
      return combinaCategoria && combinaBusca;
    });
  }, [produtos, categoria, busca]);

  function adicionar(produto: Produto) {
    setCarrinho((atual) => {
      const quantidade = atual[produto.id] ?? 0;
      if (produto.estoque <= quantidade) return atual;
      return { ...atual, [produto.id]: quantidade + 1 };
    });
  }

  function diminuir(produto: Produto) {
    setCarrinho((atual) => {
      const quantidade = atual[produto.id] ?? 0;
      if (quantidade <= 1) {
        const novo = { ...atual };
        delete novo[produto.id];
        return novo;
      }
      return { ...atual, [produto.id]: quantidade - 1 };
    });
  }

  function remover(produto: Produto) {
    setCarrinho((atual) => {
      const novo = { ...atual };
      delete novo[produto.id];
      return novo;
    });
  }

  function limpar() {
    setCarrinho({});
  }

  function concluir(pedido: Pedido) {
    setPedidoConcluido(pedido);
    setCarrinho({});
    setCheckoutAberto(false);
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Caixa</p>
          <h1 className="text-3xl font-black tracking-tight text-ink">
            Sabor do Florestan
          </h1>
          <p className="mt-1 text-sm text-amber-900/60">
            Toque nos produtos, confira o carrinho e escolha o pagamento.
          </p>
        </div>
        <span className="badge bg-emerald-50 text-emerald-700">Caixa aberto</span>
      </header>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
        <section>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              className="input flex-1"
              placeholder="Buscar no cardápio..."
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              aria-label="Buscar no cardápio"
            />
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {["Todos", ...CATEGORIAS].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategoria(item)}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    categoria === item
                      ? "bg-brand-600 text-white"
                      : "border border-brand-200 bg-white text-brand-800 hover:bg-brand-50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {produtosFiltrados.length ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {produtosFiltrados.map((produto) => {
                const quantidade = carrinho[produto.id] ?? 0;
                const esgotado = produto.estoque <= 0;

                return (
                  <article
                    key={produto.id}
                    className={`card flex flex-col p-3 ${esgotado ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-2xl">
                        {produto.emoji}
                      </span>
                      <span className="badge bg-brand-50 text-brand-700">
                        {produto.categoria}
                      </span>
                    </div>
                    <h2 className="mt-2 text-sm font-bold text-ink">
                      {produto.nome}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-amber-900/60">
                      {produto.descricao}
                    </p>
                    <div className="mt-3 flex items-end justify-between gap-2">
                      <p className="text-lg font-black text-brand-700">
                        {brl(produto.precoCentavos)}
                      </p>
                      {produto.estoque > 0 && produto.estoque <= 5 ? (
                        <span className="text-[10px] font-semibold text-amber-600">
                          Últimas {produto.estoque}
                        </span>
                      ) : null}
                      {esgotado ? (
                        <span className="text-[10px] font-semibold text-red-600">
                          Esgotado
                        </span>
                      ) : null}
                    </div>

                    {quantidade > 0 ? (
                      <div className="mt-3 flex items-center justify-between rounded-xl bg-brand-50 p-1">
                        <button
                          type="button"
                          onClick={() => diminuir(produto)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-lg font-bold text-brand-700 shadow-sm"
                          aria-label={`Diminuir ${produto.nome}`}
                        >
                          −
                        </button>
                        <span className="text-sm font-black text-ink">
                          {quantidade}
                        </span>
                        <button
                          type="button"
                          onClick={() => adicionar(produto)}
                          disabled={quantidade >= produto.estoque}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-lg font-bold text-white shadow-sm disabled:opacity-40"
                          aria-label={`Aumentar ${produto.nome}`}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => adicionar(produto)}
                        disabled={esgotado}
                        className="btn-primary mt-3 w-full py-2 text-xs"
                      >
                        {esgotado ? "Esgotado" : "Adicionar"}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="card mt-4 p-8 text-center">
              <p className="text-sm font-semibold text-ink">
                Nenhum produto encontrado.
              </p>
              <p className="mt-1 text-xs text-amber-900/60">
                Tente outra busca ou categoria.
              </p>
            </div>
          )}
        </section>

        <aside className="card h-fit p-4 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink">Carrinho</h2>
            <span className="badge bg-brand-50 text-brand-700">
              {totalItens} {totalItens === 1 ? "item" : "itens"}
            </span>
          </div>

          {itens.length ? (
            <>
              <div className="mt-3 max-h-[45vh] space-y-2 overflow-y-auto pr-1">
                {itens.map(({ produto, quantidade }) => (
                  <div
                    key={produto.id}
                    className="rounded-xl border border-brand-100 bg-cream p-2"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xl">{produto.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-ink">
                          {produto.nome}
                        </p>
                        <p className="text-[10px] text-amber-900/60">
                          {brl(produto.precoCentavos)} cada
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => remover(produto)}
                        className="text-xs font-bold text-red-500"
                        aria-label={`Remover ${produto.nome}`}
                      >
                        ×
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => diminuir(produto)}
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-brand-200 bg-white text-sm font-bold text-brand-700"
                          aria-label={`Diminuir ${produto.nome}`}
                        >
                          −
                        </button>
                        <span className="text-xs font-bold text-ink">
                          {quantidade}
                        </span>
                        <button
                          type="button"
                          onClick={() => adicionar(produto)}
                          disabled={quantidade >= produto.estoque}
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-brand-200 bg-white text-sm font-bold text-brand-700 disabled:opacity-40"
                          aria-label={`Aumentar ${produto.nome}`}
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs font-bold text-brand-700">
                        {brl(produto.precoCentavos * quantidade)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 border-t border-brand-100 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-amber-900/60">Subtotal</span>
                  <span className="font-bold text-ink">{brl(totalCentavos)}</span>
                </div>
                <div className="mt-1 flex justify-between text-base font-black">
                  <span className="text-ink">Total</span>
                  <span className="text-brand-700">{brl(totalCentavos)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckoutAberto(true)}
                  className="btn-primary mt-3 w-full"
                >
                  Cobrar {brl(totalCentavos)}
                </button>
                <button
                  type="button"
                  onClick={limpar}
                  className="mt-2 w-full text-center text-xs font-semibold text-amber-900/50 hover:text-red-600"
                >
                  Limpar carrinho
                </button>
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="text-3xl">🛒</p>
              <p className="mt-2 text-sm font-semibold text-ink">
                Carrinho vazio
              </p>
              <p className="mt-1 text-xs text-amber-900/60">
                Toque nos produtos ao lado para começar.
              </p>
            </div>
          )}
        </aside>
      </div>

      {checkoutAberto ? (
        <Checkout
          itens={itens}
          totalCentavos={totalCentavos}
          onFechar={() => setCheckoutAberto(false)}
          onConcluido={concluir}
        />
      ) : null}

      {pedidoConcluido ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Venda concluída"
        >
          <div className="card w-full max-w-md p-6 text-center">
            <p className="text-4xl">✅</p>
            <h2 className="mt-2 text-xl font-black text-ink">Venda concluída</h2>
            <p className="mt-1 text-sm text-amber-900/60">
              Pedido{" "}
              <strong className="text-ink">
                {numeroPedido(pedidoConcluido.id)}
              </strong>
            </p>
            <div className="mt-4 rounded-xl bg-brand-50 p-4 text-left text-sm">
              <div className="flex justify-between">
                <span className="text-amber-900/60">Total</span>
                <span className="font-black text-ink">
                  {brl(pedidoConcluido.totalCentavos)}
                </span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-amber-900/60">Pagamento</span>
                <span className="font-semibold text-ink">
                  {rotuloPagamento(
                    pedidoConcluido.formaPagamento,
                    pedidoConcluido.detalhePagamento,
                  )}
                </span>
              </div>
              {pedidoConcluido.formaPagamento === "dinheiro" ? (
                <div className="mt-1 flex justify-between">
                  <span className="text-amber-900/60">Troco</span>
                  <span className="font-semibold text-emerald-700">
                    {brl(pedidoConcluido.trocoCentavos)}
                  </span>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setPedidoConcluido(null)}
              className="btn-primary mt-4 w-full"
            >
              Novo pedido
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

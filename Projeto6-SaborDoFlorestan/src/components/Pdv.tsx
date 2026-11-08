"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Checkout from "./Checkout";
import { brl, numeroPedido, horaCurta, rotuloPagamento } from "@/lib/format";
import type { Pedido, Produto } from "@/lib/types";

export default function Pdv() {
  const router = useRouter();
  const [prontos, setProntos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [cobranca, setCobranca] = useState<Pedido | null>(null);
  const [concluido, setConcluido] = useState<Pedido | null>(null);

  const carregar = useCallback(async () => {
    try {
      const res = await fetch("/api/pedidos", { cache: "no-store" });
      if (!res.ok) throw new Error("Falha ao carregar os pedidos.");
      const dados = (await res.json()) as Pedido[];
      setProntos(dados.filter((p) => p.status === "pronto"));
      setErro(null);
    } catch (falha) {
      setErro(
        falha instanceof Error ? falha.message : "Erro ao carregar pedidos.",
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    const inicial = window.setTimeout(() => void carregar(), 0);
    const intervalo = window.setInterval(() => void carregar(), 5000);
    return () => {
      window.clearTimeout(inicial);
      window.clearInterval(intervalo);
    };
  }, [carregar]);

  function itensDoPedido(pedido: Pedido) {
    return pedido.itens.map((item) => ({
      produto: {
        id: item.produtoId,
        nome: item.nome,
        descricao: null,
        categoria: "Salgados",
        precoCentavos: item.precoCentavos,
        estoque: 0,
        ativo: 1,
        emoji: item.emoji,
      } as Produto,
      quantidade: item.quantidade,
    }));
  }

  function concluir(pedido: Pedido) {
    setConcluido(pedido);
    setCobranca(null);
    router.refresh();
    void carregar();
  }

  async function entregarPedido(pedido: Pedido) {
    try {
      const res = await fetch(`/api/pedidos/${pedido.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finalizar: true }),
      });
      const dados = (await res.json()) as Pedido & { erro?: string };
      if (!res.ok || dados.erro) {
        throw new Error(dados.erro ?? "Falha ao entregar pedido.");
      }
      concluir(dados);
    } catch (falha) {
      setErro(
        falha instanceof Error ? falha.message : "Erro ao entregar pedido.",
      );
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 lg:pb-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Caixa</p>
          <h1 className="text-3xl font-black tracking-tight text-ink">
            Finalizar pedidos
          </h1>
          <p className="mt-1 text-sm text-amber-900/60">
            Cobre apenas pedidos que já estão prontos e libere a retirada.
          </p>
        </div>
        <span className="badge bg-emerald-50 text-emerald-700">Caixa</span>
      </header>

      <section className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-sm text-amber-900/80">
        <p className="font-bold text-amber-900">Como funciona</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
          <li>
            A compra vira um pedido na fila com número, mesa e nome do cliente.
          </li>
          <li>
            Bebidas já saem na hora; itens preparados aparecem em{" "}
            <strong>Prontos</strong> quando ficam disponíveis.
          </li>
          <li>
            Pedidos do autoatendimento já chegam pagos: apenas clique em{" "}
            <strong>Entregar</strong>.
          </li>
          <li>
            Pedidos feitos pelo atendente são pagos aqui: use{" "}
            <strong>Cobrar e liberar</strong>.
          </li>
        </ul>
      </section>

      {erro ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {erro}
        </p>
      ) : null}

      {carregando ? (
        <p className="mt-6 text-sm text-amber-900/60">Carregando pedidos...</p>
      ) : prontos.length ? (
        <section className="mt-5">
          <h2 className="text-sm font-black text-emerald-800">
            🔔 Pedidos prontos para pagamento ({prontos.length})
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {prontos.map((pedido) => (
              <div
                key={pedido.id}
                className="card border-emerald-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-ink">
                    {numeroPedido(pedido.id)}
                  </span>
                  <span className="text-xs text-amber-900/50">
                    {horaCurta(pedido.criadoEm)}
                  </span>
                </div>
                {pedido.cliente ? (
                  <p className="mt-1 text-xs font-semibold text-amber-900/60">
                    {pedido.cliente}
                  </p>
                ) : null}
                <ul className="mt-2 space-y-0.5">
                  {pedido.itens.map((item) => (
                    <li key={item.produtoId} className="text-xs text-ink">
                      {item.quantidade}× {item.emoji} {item.nome}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-center justify-between border-t border-brand-50 pt-2">
                  <span className="text-sm font-black text-brand-700">
                    {brl(pedido.totalCentavos)}
                  </span>
                  {pedido.pago ? (
                    <button
                      type="button"
                      onClick={() => void entregarPedido(pedido)}
                      className="btn-success px-3 py-1.5 text-xs"
                    >
                      Entregar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCobranca(pedido)}
                      className="btn-success px-3 py-1.5 text-xs"
                    >
                      Cobrar e liberar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="card mt-6 p-10 text-center">
          <p className="text-3xl">⏳</p>
          <p className="mt-2 text-sm font-semibold text-ink">
            Nenhum pedido pronto no momento
          </p>
          <p className="mt-1 text-xs text-amber-900/60">
            Assim que a cozinha marcar um pedido como pronto, ele aparece aqui.
          </p>
        </div>
      )}

      {cobranca ? (
        <Checkout
          itens={itensDoPedido(cobranca)}
          totalCentavos={cobranca.totalCentavos}
          pedidoExistente={cobranca}
          onFechar={() => setCobranca(null)}
          onConcluido={concluir}
        />
      ) : null}

      {concluido ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Pedido liberado"
        >
          <div className="card w-full max-w-md p-6 text-center">
            <p className="text-4xl">✅</p>
            <h2 className="mt-2 text-xl font-black text-ink">Pedido liberado</h2>
            <p className="mt-1 text-sm text-amber-900/60">
              Pedido{" "}
              <strong className="text-ink">
                {numeroPedido(concluido.id)}
              </strong>
            </p>
            <div className="mt-4 rounded-xl bg-brand-50 p-4 text-left text-sm">
              <div className="flex justify-between">
                <span className="text-amber-900/60">Total</span>
                <span className="font-black text-ink">
                  {brl(concluido.totalCentavos)}
                </span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-amber-900/60">Pagamento</span>
                <span className="font-semibold text-ink">
                  {rotuloPagamento(
                    concluido.formaPagamento,
                    concluido.detalhePagamento,
                  )}
                </span>
              </div>
              {concluido.formaPagamento === "dinheiro" ? (
                <div className="mt-1 flex justify-between">
                  <span className="text-amber-900/60">Troco</span>
                  <span className="font-semibold text-emerald-700">
                    {brl(concluido.trocoCentavos)}
                  </span>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setConcluido(null)}
              className="btn-primary mt-4 w-full"
            >
              Fechar
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

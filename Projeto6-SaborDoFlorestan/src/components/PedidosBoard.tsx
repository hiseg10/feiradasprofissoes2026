"use client";

import { useCallback, useEffect, useState } from "react";
import { brl, horaCurta, numeroPedido, rotuloPagamento } from "@/lib/format";
import type { Pedido, StatusPedido } from "@/lib/types";

const COLUNAS: {
  status: StatusPedido;
  titulo: string;
  borda: string;
  fundo: string;
}[] = [
  {
    status: "pago",
    titulo: "Novos",
    borda: "border-t-amber-400",
    fundo: "bg-amber-50/40",
  },
  {
    status: "preparando",
    titulo: "Preparando",
    borda: "border-t-orange-500",
    fundo: "bg-orange-50/40",
  },
  {
    status: "pronto",
    titulo: "Prontos",
    borda: "border-t-emerald-500",
    fundo: "bg-emerald-50/40",
  },
];

function proximoStatus(status: StatusPedido): StatusPedido | null {
  if (status === "pago") return "preparando";
  if (status === "preparando") return "pronto";
  if (status === "pronto") return "entregue";
  return null;
}

function rotuloAcao(status: StatusPedido): string {
  if (status === "pago") return "Iniciar preparo";
  if (status === "preparando") return "Marcar pronto";
  if (status === "pronto") return "Entregue";
  return "";
}

function CartaoPedido({
  pedido,
  onAvancar,
}: {
  pedido: Pedido;
  onAvancar: (pedido: Pedido, status: StatusPedido) => void;
}) {
  const proximo = proximoStatus(pedido.status);

  return (
    <article className="card p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-lg font-black text-ink">{numeroPedido(pedido.id)}</p>
        <span className="text-xs text-amber-900/50">
          {horaCurta(pedido.criadoEm)}
        </span>
      </div>
      {pedido.cliente ? (
        <p className="text-xs font-semibold text-amber-900/60">
          {pedido.cliente}
        </p>
      ) : null}

      <ul className="mt-2 space-y-0.5">
        {pedido.itens.map((item) => (
          <li
            key={`${pedido.id}-${item.produtoId}`}
            className="flex justify-between gap-2 text-xs"
          >
            <span className="text-ink">
              {item.quantidade}× {item.emoji} {item.nome}
            </span>
            <span className="shrink-0 text-amber-900/50">
              {brl(item.precoCentavos * item.quantidade)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-2 flex items-center justify-between border-t border-brand-50 pt-2 text-xs">
        <span className="font-semibold text-amber-900/60">
          {rotuloPagamento(pedido.formaPagamento, pedido.detalhePagamento)}
        </span>
        <span className="font-black text-brand-700">
          {brl(pedido.totalCentavos)}
        </span>
      </div>

      {proximo ? (
        <button
          type="button"
          onClick={() => onAvancar(pedido, proximo)}
          className={
            pedido.status === "pronto"
              ? "btn-success mt-3 w-full py-1.5 text-xs"
              : "btn-primary mt-3 w-full py-1.5 text-xs"
          }
        >
          {rotuloAcao(pedido.status)}
        </button>
      ) : null}
    </article>
  );
}

export default function PedidosBoard() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [ultima, setUltima] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      const resposta = await fetch("/api/pedidos", { cache: "no-store" });
      if (!resposta.ok) throw new Error("Falha ao carregar pedidos.");
      const dados = (await resposta.json()) as Pedido[];
      setPedidos(dados);
      setUltima(new Date().toISOString());
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
    const id = window.setInterval(() => void carregar(), 5000);
    return () => {
      window.clearTimeout(inicial);
      window.clearInterval(id);
    };
  }, [carregar]);

  async function avancar(pedido: Pedido, status: StatusPedido) {
    try {
      const resposta = await fetch(`/api/pedidos/${pedido.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!resposta.ok) {
        const dados = (await resposta.json()) as { erro?: string };
        throw new Error(dados.erro ?? "Falha ao atualizar o pedido.");
      }
      await carregar();
    } catch (falha) {
      setErro(
        falha instanceof Error ? falha.message : "Erro ao atualizar o pedido.",
      );
    }
  }

  const ativos = pedidos.filter(
    (pedido) => pedido.status !== "entregue" && pedido.status !== "cancelado",
  );
  const entregues = pedidos
    .filter((pedido) => pedido.status === "entregue")
    .slice(0, 12);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Cozinha e entrega</p>
          <h1 className="text-3xl font-black tracking-tight text-ink">
            Pedidos
          </h1>
          <p className="mt-1 text-sm text-amber-900/60">
            Acompanhe os pedidos pagos, prepare e marque a entrega.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge bg-brand-50 text-brand-700">
            {ativos.length} em aberto
          </span>
          <button
            type="button"
            onClick={() => void carregar()}
            className="btn-secondary px-3 py-1.5 text-xs"
          >
            Atualizar
          </button>
        </div>
      </header>

      {erro ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {erro}
        </p>
      ) : null}

      <p className="mt-2 text-xs text-amber-900/50">
        Atualiza a cada 5s
        {ultima
          ? ` · última atualização ${new Date(ultima).toLocaleTimeString("pt-BR")}`
          : ""}
      </p>

      {carregando && !pedidos.length ? (
        <div className="card mt-4 p-8 text-center text-sm text-amber-900/60">
          Carregando pedidos...
        </div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {COLUNAS.map((coluna) => {
            const lista = ativos.filter(
              (pedido) => pedido.status === coluna.status,
            );
            return (
              <section
                key={coluna.status}
                className={`rounded-2xl border border-brand-100 border-t-4 bg-white/60 p-3 ${coluna.borda} ${coluna.fundo}`}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black text-ink">
                    {coluna.titulo}
                  </h2>
                  <span className="badge bg-white text-brand-700">
                    {lista.length}
                  </span>
                </div>
                <div className="mt-3 space-y-3">
                  {lista.length ? (
                    lista.map((pedido) => (
                      <CartaoPedido
                        key={pedido.id}
                        pedido={pedido}
                        onAvancar={avancar}
                      />
                    ))
                  ) : (
                    <p className="rounded-xl border border-dashed border-brand-200 p-4 text-center text-xs text-amber-900/40">
                      Nenhum pedido.
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {entregues.length ? (
        <section className="mt-5">
          <details className="card p-4">
            <summary className="cursor-pointer text-sm font-bold text-ink">
              Entregues recentes ({entregues.length})
            </summary>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {entregues.map((pedido) => (
                <div
                  key={pedido.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-brand-50 bg-cream px-3 py-2 text-xs"
                >
                  <span className="font-bold text-ink">
                    {numeroPedido(pedido.id)}
                  </span>
                  <span className="text-amber-900/50">
                    {horaCurta(pedido.criadoEm)}
                  </span>
                  <span className="font-semibold text-brand-700">
                    {brl(pedido.totalCentavos)}
                  </span>
                </div>
              ))}
            </div>
          </details>
        </section>
      ) : null}
    </main>
  );
}

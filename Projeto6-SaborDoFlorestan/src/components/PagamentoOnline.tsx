"use client";

import { useEffect, useRef, useState } from "react";
import { brl } from "@/lib/format";
import type { Pedido } from "@/lib/types";

type ItemPayload = { produtoId: number; quantidade: number };

type MercadoPagoBrick = {
  create: (
    brick: string,
    container: string,
    settings: Record<string, unknown>,
  ) => Promise<unknown>;
};

type MercadoPagoInstance = {
  bricks: () => MercadoPagoBrick;
};

declare global {
  interface Window {
    MercadoPago?: new (
      publicKey: string,
      options?: Record<string, unknown>,
    ) => MercadoPagoInstance;
  }
}

let carregandoSdk: Promise<void> | null = null;

function carregarSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.MercadoPago) return Promise.resolve();
  if (carregandoSdk) return carregandoSdk;

  carregandoSdk = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Falha ao carregar o Mercado Pago."));
    document.body.appendChild(script);
  });

  return carregandoSdk;
}

export default function PagamentoOnline({
  totalCentavos,
  pedidoId,
  itens,
  cliente,
  onAprovado,
}: {
  totalCentavos: number;
  pedidoId?: number;
  itens: ItemPayload[];
  cliente?: string;
  onAprovado: (pedido: Pedido) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dadosRef = useRef({ totalCentavos, pedidoId, itens, cliente });
  const aprovadoRef = useRef(onAprovado);

  const [erro, setErro] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);
  const [pronto, setPronto] = useState(false);

  const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ?? "";

  useEffect(() => {
    dadosRef.current = { totalCentavos, pedidoId, itens, cliente };
  }, [totalCentavos, pedidoId, itens, cliente]);

  useEffect(() => {
    aprovadoRef.current = onAprovado;
  }, [onAprovado]);

  useEffect(() => {
    if (!publicKey) {
      return;
    }

    let cancelado = false;

    (async () => {
      try {
        await carregarSdk();
        if (cancelado || !window.MercadoPago || !containerRef.current) return;

        const mp = new window.MercadoPago(publicKey, { locale: "pt-BR" });
        const bricks = mp.bricks();

        await bricks.create("payment", "mp-payment-brick", {
          initialization: {
            amount: dadosRef.current.totalCentavos / 100,
            payer: {},
          },
          customization: {
            paymentMethods: {
              creditCard: "all",
              debitCard: "all",
              bankTransfer: "none",
              ticket: "none",
              atm: "none",
            },
          },
          callbacks: {
            onReady: () => {
              if (!cancelado) setPronto(true);
            },
            onError: () => {
              if (!cancelado) setErro("Erro no formulário de pagamento.");
            },
            onSubmit: async (formData: unknown) => {
              setProcessando(true);
              setErro(null);
              try {
                const atual = dadosRef.current;
                const resposta = await fetch("/api/mp/pagar", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    formData,
                    pedidoId: atual.pedidoId,
                    itens: atual.itens,
                    cliente: atual.cliente,
                  }),
                });
                const dados = (await resposta.json()) as Pedido & {
                  erro?: string;
                };
                if (!resposta.ok || dados.erro) {
                  throw new Error(dados.erro ?? "Pagamento não aprovado.");
                }
                aprovadoRef.current(dados);
              } catch (falha) {
                setErro(
                  falha instanceof Error
                    ? falha.message
                    : "Erro no pagamento.",
                );
                throw falha;
              } finally {
                setProcessando(false);
              }
            },
          },
        });
      } catch (falha) {
        if (!cancelado) {
          setErro(
            falha instanceof Error
              ? falha.message
              : "Erro ao carregar o pagamento.",
          );
        }
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [publicKey]);

  const erroExibido =
    erro ??
    (publicKey
      ? null
      : "Pagamento online indisponível: configure NEXT_PUBLIC_MP_PUBLIC_KEY.");

  return (
    <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
      <p className="text-sm font-semibold text-blue-900">
        Cartão online / Google Pay
      </p>
      <p className="mt-1 text-xs text-blue-900/60">
        Pague na página ({brl(totalCentavos)}). Se o Google Pay estiver
        disponível no Mercado Pago, ele aparece abaixo.
      </p>
      <div id="mp-payment-brick" ref={containerRef} className="mt-3" />
      {!pronto && !erroExibido ? (
        <p className="mt-2 text-xs text-blue-900/60">Carregando pagamento...</p>
      ) : null}
      {processando ? (
        <p className="mt-2 text-xs text-blue-900">Processando pagamento...</p>
      ) : null}
      {erroExibido ? (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
          {erroExibido}
        </p>
      ) : null}
    </div>
  );
}

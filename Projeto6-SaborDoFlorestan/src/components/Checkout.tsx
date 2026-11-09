"use client";

import { useEffect, useMemo, useState } from "react";
import PagamentoOnline from "./PagamentoOnline";
import { brl } from "@/lib/format";
import type { Pedido, Produto } from "@/lib/types";

type Item = {
  produto: Produto;
  quantidade: number;
};

export type MetodoCheckout = "pix" | "cartao_online" | "nfc" | "dinheiro";

type PixEstado = {
  carregando: boolean;
  qrDataUrl: string | null;
  payload: string | null;
  erro: string | null;
};

const OPCOES: { valor: MetodoCheckout; rotulo: string; cor: string }[] = [
  { valor: "pix", rotulo: "Pix", cor: "bg-emerald-600" },
  { valor: "cartao_online", rotulo: "Cartão online", cor: "bg-blue-600" },
  { valor: "nfc", rotulo: "NFC / maquininha", cor: "bg-indigo-600" },
  { valor: "dinheiro", rotulo: "Dinheiro", cor: "bg-amber-600" },
];

export default function Checkout({
  itens,
  totalCentavos,
  pedidoExistente,
  metodos = ["pix", "cartao_online", "nfc", "dinheiro"],
  onFechar,
  onConcluido,
}: {
  itens: Item[];
  totalCentavos: number;
  pedidoExistente?: Pedido;
  metodos?: MetodoCheckout[];
  onFechar: () => void;
  onConcluido: (pedido: Pedido) => void;
}) {
  const [mpPublicKey, setMpPublicKey] = useState("");
  const metodosDisponiveis = metodos.filter(
    (metodo) => metodo !== "cartao_online" || Boolean(mpPublicKey),
  );
  const inicial = metodosDisponiveis[0] ?? "pix";

  useEffect(() => {
    let ativo = true;
    fetch("/api/mp/config", { cache: "no-store" })
      .then((resposta) => resposta.json())
      .then((dados: { publicKey?: string }) => {
        if (ativo) setMpPublicKey(dados.publicKey ?? "");
      })
      .catch(() => {
        // sem Mercado Pago configurado
      });
    return () => {
      ativo = false;
    };
  }, []);

  const [metodo, setMetodo] = useState<MetodoCheckout>(inicial);
  const [detalheCartao, setDetalheCartao] = useState<"debito" | "credito">(
    "debito",
  );
  const [cliente, setCliente] = useState(pedidoExistente?.cliente ?? "");
  const [valorRecebido, setValorRecebido] = useState("");
  const [pix, setPix] = useState<PixEstado>({
    carregando: false,
    qrDataUrl: null,
    payload: null,
    erro: null,
  });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [confirmacao, setConfirmacao] = useState<{
    metodo: MetodoCheckout;
    pix: string | null;
    valor: boolean;
  }>({ metodo: "pix", pix: null, valor: false });

  const pagamentoConferido =
    confirmacao.metodo === metodo && confirmacao.pix === pix.qrDataUrl
      ? confirmacao.valor
      : false;

  const itensPayload = useMemo(
    () =>
      itens.map(({ produto, quantidade }) => ({
        produtoId: produto.id,
        quantidade,
      })),
    [itens],
  );

  const recebidoCentavos = Math.round(
    (Number(valorRecebido.replace(",", ".")) || 0) * 100,
  );
  const troco = Math.max(0, recebidoCentavos - totalCentavos);
  const falta = Math.max(0, totalCentavos - recebidoCentavos);

  useEffect(() => {
    if (metodo !== "pix") return;

    let ativo = true;
    const id = window.setTimeout(() => {
      setPix({ carregando: true, qrDataUrl: null, payload: null, erro: null });
    }, 0);

    fetch("/api/pix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itens: itensPayload }),
    })
      .then(async (resposta) => {
        const dados = (await resposta.json()) as {
          qrDataUrl?: string;
          payload?: string;
          erro?: string;
        };
        if (!resposta.ok || !dados.qrDataUrl || !dados.payload) {
          throw new Error(dados.erro ?? "Falha ao gerar o Pix.");
        }
        if (ativo) {
          setPix({
            carregando: false,
            qrDataUrl: dados.qrDataUrl,
            payload: dados.payload,
            erro: null,
          });
        }
      })
      .catch((falha) => {
        if (ativo) {
          setPix({
            carregando: false,
            qrDataUrl: null,
            payload: null,
            erro:
              falha instanceof Error ? falha.message : "Falha ao gerar o Pix.",
          });
        }
      });

    return () => {
      ativo = false;
      window.clearTimeout(id);
    };
  }, [metodo, itensPayload]);

  async function copiarPix() {
    if (!pix.payload) return;
    try {
      await navigator.clipboard.writeText(pix.payload);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      setErro("Não foi possível copiar o código Pix.");
    }
  }

  function detalheDoMetodo(): string {
    if (metodo === "pix") return "pix";
    if (metodo === "dinheiro") return "dinheiro";
    if (metodo === "nfc") return `nfc_${detalheCartao}`;
    return "online";
  }

  const podeConfirmar =
    metodo === "pix"
      ? Boolean(pix.qrDataUrl) &&
        !pix.carregando &&
        !enviando &&
        pagamentoConferido
      : metodo === "nfc"
        ? !enviando && pagamentoConferido
        : metodo === "dinheiro"
          ? recebidoCentavos >= totalCentavos && !enviando
          : false;

  async function confirmar() {
    if (metodo === "cartao_online" || !podeConfirmar) return;

    setEnviando(true);
    setErro(null);

    try {
      const detalhe = detalheDoMetodo();
      const resposta = pedidoExistente
        ? await fetch(`/api/pedidos/${pedidoExistente.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              finalizar: true,
              formaPagamento: metodo === "dinheiro" ? "dinheiro" : metodo === "pix" ? "pix" : "cartao",
              detalhePagamento: detalhe,
              valorRecebidoCentavos:
                metodo === "dinheiro" ? recebidoCentavos : totalCentavos,
            }),
          })
        : await fetch("/api/pedidos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              itens: itensPayload,
              formaPagamento: metodo === "dinheiro" ? "dinheiro" : metodo === "pix" ? "pix" : "cartao",
              detalhePagamento: detalhe,
              valorRecebidoCentavos:
                metodo === "dinheiro" ? recebidoCentavos : totalCentavos,
              cliente,
              pago: true,
            }),
          });
      const dados = (await resposta.json()) as Pedido & { erro?: string };

      if (!resposta.ok || dados.erro) {
        throw new Error(dados.erro ?? "Não foi possível registrar a venda.");
      }

      onConcluido(dados);
    } catch (falha) {
      setErro(
        falha instanceof Error
          ? falha.message
          : "Erro ao registrar a venda.",
      );
    } finally {
      setEnviando(false);
    }
  }

  const rotuloConfirmar =
    metodo === "pix"
      ? "Confirmar Pix recebido"
      : metodo === "nfc"
        ? "Confirmar NFC"
        : "Finalizar venda";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Fechar venda"
    >
      <div className="card max-h-[92vh] w-full max-w-lg overflow-y-auto p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">
              {pedidoExistente
                ? `Cobrar pedido ${pedidoExistente.numero}`
                : "Fechar venda"}
            </p>
            <h2 className="text-xl font-black text-ink">{brl(totalCentavos)}</h2>
            <p className="text-xs text-amber-900/60">
              {itens.reduce((total, item) => total + item.quantidade, 0)} itens
            </p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="text-2xl leading-none text-amber-900/50 hover:text-ink"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {pedidoExistente ? (
          pedidoExistente.cliente ? (
            <div className="mt-4 rounded-xl bg-brand-50 px-3 py-2 text-xs text-amber-900/70">
              Cliente: <strong className="text-ink">{pedidoExistente.cliente}</strong>
            </div>
          ) : null
        ) : (
          <div className="mt-4">
            <label htmlFor="cliente" className="label">
              Nome do cliente (opcional)
            </label>
            <input
              id="cliente"
              className="input"
              value={cliente}
              onChange={(evento) => setCliente(evento.target.value)}
              maxLength={60}
              placeholder="Ex.: Ana"
            />
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {OPCOES.filter((opcao) => metodosDisponiveis.includes(opcao.valor)).map(
            (item) => (
              <button
                key={item.valor}
                type="button"
                onClick={() => setMetodo(item.valor)}
                className={`rounded-xl border px-2 py-3 text-xs font-bold transition ${
                  metodo === item.valor
                    ? "border-brand-600 bg-brand-50 text-brand-800"
                    : "border-brand-100 bg-white text-amber-900/60 hover:bg-brand-50"
                }`}
              >
                <span
                  className={`mx-auto mb-1 block h-2 w-2 rounded-full ${item.cor}`}
                />
                {item.rotulo}
              </button>
            ),
          )}
        </div>

        {metodo === "pix" ? (
          <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
            {pix.carregando ? (
              <p className="text-sm text-emerald-800">Gerando QR code Pix...</p>
            ) : pix.erro ? (
              <div className="text-sm text-amber-800">
                <p className="font-semibold">Pix indisponível</p>
                <p className="mt-1 text-xs">{pix.erro}</p>
                <p className="mt-2 text-xs">
                  Use cartão online ou dinheiro, ou configure PIX_KEY.
                </p>
              </div>
            ) : pix.qrDataUrl ? (
              <div className="text-center">
                <div
                  role="img"
                  aria-label="QR code Pix"
                  className="mx-auto h-52 w-52 rounded-xl bg-white bg-contain bg-center bg-no-repeat p-2"
                  style={{ backgroundImage: `url("${pix.qrDataUrl}")` }}
                />
                <p className="mt-2 text-xs text-emerald-900/70">
                  Aponte o app do banco para o QR e confirme o recebimento.
                </p>
                <button
                  type="button"
                  onClick={() => void copiarPix()}
                  className="btn-secondary mt-2 px-3 py-1.5 text-xs"
                >
                  {copiado ? "Código copiado!" : "Copiar código Pix"}
                </button>
                <label className="mt-3 flex items-start justify-center gap-2 text-xs text-emerald-900/80">
                  <input
                    type="checkbox"
                    checked={pagamentoConferido}
                    onChange={(evento) =>
                      setConfirmacao({
                        metodo,
                        pix: pix.qrDataUrl,
                        valor: evento.target.checked,
                      })
                    }
                    className="mt-0.5"
                  />
                  <span>Confirmo que o Pix foi recebido na conta da cantina.</span>
                </label>
              </div>
            ) : null}
          </div>
        ) : null}

        {metodo === "cartao_online" ? (
          <PagamentoOnline
            totalCentavos={totalCentavos}
            pedidoId={pedidoExistente?.id}
            itens={itensPayload}
            cliente={cliente}
            publicKey={mpPublicKey}
            onAprovado={onConcluido}
          />
        ) : null}

        {metodo === "nfc" ? (
          <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
            <p className="text-sm font-semibold text-indigo-900">
              Receba por aproximação
            </p>
            <p className="mt-1 text-xs text-indigo-900/60">
              Use o app do Mercado Pago (Point Tap) no celular do caixa. O cliente
              encosta o celular/cartão e você confirma abaixo.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(["debito", "credito"] as const).map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setDetalheCartao(tipo)}
                  className={`rounded-xl border px-3 py-2 text-xs font-bold ${
                    detalheCartao === tipo
                      ? "border-indigo-600 bg-white text-indigo-800"
                      : "border-indigo-200 bg-white/60 text-indigo-900/60"
                  }`}
                >
                  {tipo === "debito" ? "Débito" : "Crédito"}
                </button>
              ))}
            </div>
            <label className="mt-3 flex items-start gap-2 text-xs text-indigo-900/80">
              <input
                type="checkbox"
                checked={pagamentoConferido}
                onChange={(evento) =>
                  setConfirmacao({
                    metodo,
                    pix: pix.qrDataUrl,
                    valor: evento.target.checked,
                  })
                }
                className="mt-0.5"
              />
              <span>Confirmo que o pagamento por aproximação foi aprovado.</span>
            </label>
          </div>
        ) : null}

        {metodo === "dinheiro" ? (
          <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
            <label htmlFor="recebido" className="label">
              Valor recebido (R$)
            </label>
            <input
              id="recebido"
              className="input text-lg font-bold"
              type="number"
              min={0}
              step={0.01}
              value={valorRecebido}
              onChange={(evento) => setValorRecebido(evento.target.value)}
              placeholder={(totalCentavos / 100).toFixed(2)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setValorRecebido((totalCentavos / 100).toFixed(2))
                }
                className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-800"
              >
                Valor exato
              </button>
              {[20, 50, 100].map((valor) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => setValorRecebido(valor.toFixed(2))}
                  className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-800"
                >
                  R$ {valor}
                </button>
              ))}
            </div>
            <div className="mt-3 rounded-xl bg-white p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-amber-900/60">Troco</span>
                <span
                  className={`font-black ${
                    falta > 0 ? "text-red-600" : "text-emerald-700"
                  }`}
                >
                  {falta > 0 ? `Faltam ${brl(falta)}` : brl(troco)}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {erro ? (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {erro}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onFechar}
            className="btn-secondary"
            disabled={enviando}
          >
            Cancelar
          </button>
          {metodo !== "cartao_online" ? (
            <button
              type="button"
              onClick={() => void confirmar()}
              className="btn-primary"
              disabled={!podeConfirmar}
            >
              {enviando ? "Registrando..." : rotuloConfirmar}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

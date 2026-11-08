"use client";

import { useEffect, useMemo, useState } from "react";
import { brl } from "@/lib/format";
import type { FormaPagamento, Pedido, Produto } from "@/lib/types";

type Item = {
  produto: Produto;
  quantidade: number;
};

type PixEstado = {
  carregando: boolean;
  qrDataUrl: string | null;
  payload: string | null;
  erro: string | null;
};

const FORMAS: { valor: FormaPagamento; rotulo: string; cor: string }[] = [
  { valor: "pix", rotulo: "Pix", cor: "bg-emerald-600" },
  { valor: "cartao", rotulo: "Cartão", cor: "bg-blue-600" },
  { valor: "dinheiro", rotulo: "Dinheiro", cor: "bg-amber-600" },
];

export default function Checkout({
  itens,
  totalCentavos,
  pedidoExistente,
  onFechar,
  onConcluido,
}: {
  itens: Item[];
  totalCentavos: number;
  pedidoExistente?: Pedido;
  onFechar: () => void;
  onConcluido: (pedido: Pedido) => void;
}) {
  const [forma, setForma] = useState<FormaPagamento>("pix");
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
    forma: FormaPagamento;
    pix: string | null;
    valor: boolean;
  }>({ forma: "pix", pix: null, valor: false });

  const pagamentoConferido =
    confirmacao.forma === forma && confirmacao.pix === pix.qrDataUrl
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
    if (forma !== "pix") return;

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
              falha instanceof Error
                ? falha.message
                : "Falha ao gerar o Pix.",
          });
        }
      });

    return () => {
      ativo = false;
      window.clearTimeout(id);
    };
  }, [forma, itensPayload]);

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

  const podeConfirmar =
    forma === "pix"
      ? Boolean(pix.qrDataUrl) &&
        !pix.carregando &&
        !enviando &&
        pagamentoConferido
      : forma === "cartao"
        ? !enviando && pagamentoConferido
        : recebidoCentavos >= totalCentavos && !enviando;

  async function confirmar() {
    if (!podeConfirmar) return;

    setEnviando(true);
    setErro(null);

    try {
      const resposta = pedidoExistente
        ? await fetch(`/api/pedidos/${pedidoExistente.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              finalizar: true,
              formaPagamento: forma,
              detalhePagamento: forma === "cartao" ? detalheCartao : forma,
              valorRecebidoCentavos:
                forma === "dinheiro" ? recebidoCentavos : totalCentavos,
            }),
          })
        : await fetch("/api/pedidos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              itens: itensPayload,
              formaPagamento: forma,
              detalhePagamento: forma === "cartao" ? detalheCartao : forma,
              valorRecebidoCentavos:
                forma === "dinheiro" ? recebidoCentavos : totalCentavos,
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
    forma === "pix"
      ? "Confirmar Pix recebido"
      : forma === "cartao"
        ? "Confirmar cartão"
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

        <div className="mt-4 grid grid-cols-3 gap-2">
          {FORMAS.map((item) => (
            <button
              key={item.valor}
              type="button"
              onClick={() => setForma(item.valor)}
              className={`rounded-xl border px-2 py-3 text-sm font-bold transition ${
                forma === item.valor
                  ? "border-brand-600 bg-brand-50 text-brand-800"
                  : "border-brand-100 bg-white text-amber-900/60 hover:bg-brand-50"
              }`}
            >
              <span
                className={`mx-auto mb-1 block h-2 w-2 rounded-full ${item.cor}`}
              />
              {item.rotulo}
            </button>
          ))}
        </div>

        {forma === "pix" ? (
          <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
            {pix.carregando ? (
              <p className="text-sm text-emerald-800">Gerando QR code Pix...</p>
            ) : pix.erro ? (
              <div className="text-sm text-amber-800">
                <p className="font-semibold">Pix indisponível</p>
                <p className="mt-1 text-xs">{pix.erro}</p>
                <p className="mt-2 text-xs">
                  Use cartão ou dinheiro, ou configure PIX_KEY no .env.local.
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
                        forma,
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
        ) : forma === "cartao" ? (
          <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
            <p className="text-sm font-semibold text-blue-900">
              Passe o cartão na maquininha
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(["debito", "credito"] as const).map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setDetalheCartao(tipo)}
                  className={`rounded-xl border px-3 py-2 text-xs font-bold ${
                    detalheCartao === tipo
                      ? "border-blue-600 bg-white text-blue-800"
                      : "border-blue-200 bg-white/60 text-blue-900/60"
                  }`}
                >
                  {tipo === "debito" ? "Débito" : "Crédito"}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-blue-900/60">
              O app não processa cartão. Passe na maquininha, aguarde a
              aprovação e confirme abaixo.
            </p>
            <label className="mt-3 flex items-start gap-2 text-xs text-blue-900/80">
              <input
                type="checkbox"
                checked={pagamentoConferido}
                onChange={(evento) =>
                  setConfirmacao({
                    forma,
                    pix: pix.qrDataUrl,
                    valor: evento.target.checked,
                  })
                }
                className="mt-0.5"
              />
              <span>Confirmo que a maquininha aprovou o pagamento.</span>
            </label>
          </div>
        ) : (
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
        )}

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
          <button
            type="button"
            onClick={() => void confirmar()}
            className="btn-primary"
            disabled={!podeConfirmar}
          >
            {enviando ? "Registrando..." : rotuloConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}

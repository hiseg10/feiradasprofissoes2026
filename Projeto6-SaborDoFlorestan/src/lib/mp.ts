import { randomUUID } from "node:crypto";

const MP_API = "https://api.mercadopago.com";

export type MpFormData = {
  token?: string;
  payment_method_id?: string;
  installments?: number;
  issuer_id?: string | number;
  payer?: {
    email?: string;
    identification?: { type?: string; number?: string };
  };
};

export function mpConfigurado(): boolean {
  return Boolean(process.env.MP_ACCESS_TOKEN?.trim());
}

export async function criarPagamentoMP(opcoes: {
  formData: MpFormData;
  valorCentavos: number;
  descricao: string;
}): Promise<{ aprovado: boolean; status: string; detalhe: string }> {
  const token = process.env.MP_ACCESS_TOKEN?.trim();
  if (!token) {
    throw new Error("Mercado Pago não configurado (MP_ACCESS_TOKEN).");
  }

  const { formData, valorCentavos, descricao } = opcoes;
  if (!formData?.token || !formData?.payment_method_id) {
    throw new Error("Dados do cartão incompletos.");
  }

  const corpo = {
    transaction_amount: Number((valorCentavos / 100).toFixed(2)),
    token: formData.token,
    description: descricao,
    installments: Number(formData.installments) || 1,
    payment_method_id: formData.payment_method_id,
    issuer_id: formData.issuer_id ? String(formData.issuer_id) : undefined,
    payer: {
      email: formData.payer?.email || "comprador@sabordoflorestan.com",
      identification: formData.payer?.identification,
    },
  };

  const resposta = await fetch(`${MP_API}/v1/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": randomUUID(),
    },
    body: JSON.stringify(corpo),
  });

  const dados = (await resposta.json()) as {
    status?: string;
    status_detail?: string;
    message?: string;
  };

  if (!resposta.ok) {
    throw new Error(dados.message ?? "Falha ao processar o pagamento.");
  }

  const status = dados.status ?? "unknown";
  return {
    aprovado: status === "approved",
    status,
    detalhe: dados.status_detail ?? status,
  };
}

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

export function tokenAtivo(): string | undefined {
  return (
    process.env.MP_ACCESS_TOKEN_TEST?.trim() ||
    process.env.MP_ACCESS_TOKEN?.trim() ||
    undefined
  );
}

export function publicKeyAtiva(): string {
  return (
    process.env.NEXT_PUBLIC_MP_PUBLIC_KEY_TEST?.trim() ||
    process.env.NEXT_PUBLIC_MP_PUBLIC_KEY?.trim() ||
    ""
  );
}

export function mpConfigurado(): boolean {
  return Boolean(tokenAtivo());
}

export function infoMp() {
  const token = tokenAtivo();
  const publicKey = publicKeyAtiva();
  return {
    vercelEnv: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? null,
    temAccessToken: Boolean(token),
    accessTokenPrefixo: token ? token.slice(0, 8) : null,
    accessTokenTamanho: token?.length ?? 0,
    temPublicKey: Boolean(publicKey),
    publicKeyPrefixo: publicKey ? publicKey.slice(0, 8) : null,
    publicKeyTamanho: publicKey?.length ?? 0,
  };
}

export async function criarPagamentoMP(opcoes: {
  formData: MpFormData;
  valorCentavos: number;
  descricao: string;
}): Promise<{ aprovado: boolean; status: string; detalhe: string }> {
  const token = tokenAtivo();
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
    console.error("Mercado Pago /v1/payments", resposta.status, dados);
    throw new Error(
      `Mercado Pago ${resposta.status}: ${dados.message ?? "falha ao cobrar"}`,
    );
  }

  const status = dados.status ?? "unknown";
  return {
    aprovado: status === "approved",
    status,
    detalhe: dados.status_detail ?? status,
  };
}

export function brl(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function numeroPedido(id: number): string {
  return `#${String(id).padStart(3, "0")}`;
}

export function horaCurta(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "--:--";
  }
}

export function dataHora(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "--";
  }
}

export function rotuloPagamento(
  forma: string,
  detalhe: string | null,
): string {
  if (forma === "pix") return "Pix";
  if (forma === "cartao") {
    if (detalhe === "credito") return "Cartão · crédito";
    if (detalhe === "debito") return "Cartão · débito";
    return "Cartão";
  }
  return "Dinheiro";
}

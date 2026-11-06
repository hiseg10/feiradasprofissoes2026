export function brl(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function dataCurta(iso: string): string {
  try {
    return new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function numero(valor: number): string {
  return valor.toLocaleString("pt-BR");
}

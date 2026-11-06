const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatarMoeda(centavos: number): string {
  return brl.format((centavos || 0) / 100);
}

export function parseCentavos(valor: unknown): number {
  if (typeof valor === "number" && Number.isFinite(valor)) {
    return Math.round(valor * 100);
  }
  if (typeof valor !== "string") return 0;
  let texto = valor.trim().replace(/[^\d.,-]/g, "");
  if (!texto) return 0;
  if (texto.includes(",")) {
    texto = texto.replace(/\./g, "").replace(",", ".");
  }
  const numero = Number.parseFloat(texto);
  return Number.isFinite(numero) ? Math.round(numero * 100) : 0;
}

export function centavosParaInput(centavos: number): string {
  return (centavos / 100).toFixed(2).replace(".", ",");
}

export function formatarData(iso: string | null | undefined): string {
  if (!iso) return "";
  const data = iso.slice(0, 10);
  const partes = data.split("-");
  if (partes.length !== 3) return iso;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

export function formatarDataHora(iso: string | null | undefined): string {
  if (!iso) return "";
  const data = new Date(iso.includes("T") ? iso : iso.replace(" ", "T") + "Z");
  if (Number.isNaN(data.getTime())) return iso;
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function hojeISO(): string {
  const agora = new Date();
  const fuso = new Date(agora.getTime() - agora.getTimezoneOffset() * 60000);
  return fuso.toISOString().slice(0, 10);
}

export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

export function linkWhatsApp(numero: string | null | undefined): string | null {
  if (!numero) return null;
  const digitos = apenasDigitos(numero);
  if (digitos.length < 10) return null;
  return `https://wa.me/55${digitos.slice(-11)}`;
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export type PixParams = {
  chave: string;
  nome: string;
  cidade: string;
  valorCentavos: number;
  referencia: string;
};

function tlv(id: string, valor: string): string {
  return `${id}${String(valor.length).padStart(2, "0")}${valor}`;
}

function limparTexto(valor: string, limite: number, padrao: string): string {
  const limpo = valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

  return (limpo || padrao).slice(0, limite);
}

function crc16(payload: string): string {
  let crc = 0xffff;

  for (let indice = 0; indice < payload.length; indice += 1) {
    crc ^= payload.charCodeAt(indice) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc =
        crc & 0x8000
          ? ((crc << 1) ^ 0x1021) & 0xffff
          : (crc << 1) & 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function gerarPixPayload({
  chave,
  nome,
  cidade,
  valorCentavos,
  referencia,
}: PixParams): string {
  const chaveLimpa = chave.trim();
  if (!chaveLimpa) {
    throw new Error("Chave Pix não configurada.");
  }
  if (!Number.isInteger(valorCentavos) || valorCentavos <= 0) {
    throw new Error("Valor do Pix inválido.");
  }

  const nomeLimpo = limparTexto(nome, 25, "SABOR DO FLORESTAN");
  const cidadeLimpa = limparTexto(cidade, 15, "TERESINA");
  const referenciaLimpa =
    referencia.replace(/[^A-Za-z0-9]/g, "").slice(0, 25).toUpperCase() ||
    "PEDIDO";
  const valor = (valorCentavos / 100).toFixed(2);

  const merchant = tlv("00", "br.gov.bcb.pix") + tlv("01", chaveLimpa);
  const adicional = tlv("05", referenciaLimpa);

  const payloadSemCrc = [
    tlv("00", "01"),
    tlv("26", merchant),
    tlv("52", "0000"),
    tlv("53", "986"),
    tlv("54", valor),
    tlv("58", "BR"),
    tlv("59", nomeLimpo),
    tlv("60", cidadeLimpa),
    tlv("62", adicional),
    "6304",
  ].join("");

  return `${payloadSemCrc}${crc16(payloadSemCrc)}`;
}

export function referenciaPix(): string {
  return `SABOR${Date.now()
    .toString(36)
    .toUpperCase()
    .slice(-8)}`;
}

import type { Metadata } from "next";
import DivulgarKit from "@/components/DivulgarKit";
import { PONTOS } from "@/lib/conteudo";

export const metadata: Metadata = {
  title: "Divulgar meu ponto · Florestan Conecta",
  description:
    "Kit de divulgação para parceiros do bairro Deus Quer: legendas, cartaz com QR code e links para redes sociais e sites especializados.",
};

export default async function DivulgarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const parametros = await searchParams;
  const ponto = parametros.ponto;
  const pontoInicial = Array.isArray(ponto) ? ponto[0] : ponto;

  return <DivulgarKit pontos={PONTOS} pontoInicial={pontoInicial} />;
}

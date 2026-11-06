import { NextResponse } from "next/server";
import { consultarIA } from "@/lib/ia";
import { contextoParaIA, getCotacoes, getIndicadores } from "@/lib/mercado";
import type { MensagemIA } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 45;

type Corpo = {
  historico?: unknown;
};

function mensagensValidas(valor: unknown): MensagemIA[] {
  if (!Array.isArray(valor)) return [];

  return valor
    .flatMap((item): MensagemIA[] => {
      if (!item || typeof item !== "object") return [];
      const registro = item as { papel?: unknown; texto?: unknown };
      if (
        (registro.papel !== "user" && registro.papel !== "assistant") ||
        typeof registro.texto !== "string"
      ) {
        return [];
      }
      const texto = registro.texto.trim().slice(0, 4000);
      if (!texto) return [];
      return [{ papel: registro.papel, texto }];
    })
    .slice(-10);
}

export async function POST(request: Request) {
  let corpo: Corpo | null = null;
  try {
    corpo = (await request.json()) as Corpo;
  } catch {
    return NextResponse.json({ erro: "Corpo da requisição inválido." }, { status: 400 });
  }

  const historico = mensagensValidas(corpo?.historico);
  const ultima = historico[historico.length - 1];
  if (!ultima || ultima.papel !== "user") {
    return NextResponse.json(
      { erro: "Envie ao menos uma pergunta do usuário." },
      { status: 400 },
    );
  }

  const [mercado, macro] = await Promise.all([getCotacoes(), getIndicadores()]);
  const contexto = contextoParaIA(mercado.cotacoes, macro.indicadores, mercado.fonte);
  const resposta = await consultarIA(historico, contexto);

  return NextResponse.json(resposta, {
    headers: { "Cache-Control": "no-store" },
  });
}

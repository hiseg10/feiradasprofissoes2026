import { NextResponse } from "next/server";
import { atualizarStatus, finalizarPedido } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const numero = Number(id);

  if (!Number.isInteger(numero) || numero <= 0) {
    return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
  }

  try {
    const dados = (await request.json()) as {
      status?: unknown;
      equipeId?: unknown;
      finalizar?: unknown;
      formaPagamento?: unknown;
      detalhePagamento?: unknown;
      valorRecebidoCentavos?: unknown;
    };
    const pedido = dados.finalizar
      ? await finalizarPedido(numero, dados)
      : await atualizarStatus(numero, dados.status, dados.equipeId);
    return NextResponse.json(pedido);
  } catch (erro) {
    return NextResponse.json(
      {
        erro:
          erro instanceof Error ? erro.message : "Erro ao atualizar pedido.",
      },
      { status: 400 },
    );
  }
}

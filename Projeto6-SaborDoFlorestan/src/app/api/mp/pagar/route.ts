import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { criarPagamentoMP, mpConfigurado, type MpFormData } from "@/lib/mp";
import {
  buscarPedido,
  criarPedido,
  finalizarPedido,
  montarItens,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

type Corpo = {
  formData?: MpFormData;
  pedidoId?: unknown;
  itens?: unknown;
  cliente?: unknown;
};

export async function POST(request: Request) {
  try {
    if (!mpConfigurado()) {
      return NextResponse.json(
        { erro: "Mercado Pago não configurado (MP_ACCESS_TOKEN)." },
        { status: 400 },
      );
    }

    const corpo = (await request.json()) as Corpo | null;
    const formData = corpo?.formData ?? {};

    if (corpo?.pedidoId) {
      const id = Number(corpo.pedidoId);
      const pedido = await buscarPedido(id);
      if (!pedido) {
        return NextResponse.json(
          { erro: "Pedido não encontrado." },
          { status: 404 },
        );
      }
      if (pedido.pago) {
        return NextResponse.json(
          { erro: "Este pedido já está pago." },
          { status: 400 },
        );
      }
      if (pedido.status !== "pronto") {
        return NextResponse.json(
          { erro: "O pedido ainda não está pronto para pagamento." },
          { status: 400 },
        );
      }

      const resultado = await criarPagamentoMP({
        formData,
        valorCentavos: pedido.totalCentavos,
        descricao: `Pedido ${pedido.numero} · Sabor do Florestan`,
      });

      if (!resultado.aprovado) {
        return NextResponse.json(
          { erro: `Pagamento não aprovado (${resultado.detalhe}).` },
          { status: 402 },
        );
      }

      const atualizado = await finalizarPedido(id, {
        formaPagamento: "cartao",
        detalhePagamento: "online",
        valorRecebidoCentavos: pedido.totalCentavos,
      });
      return NextResponse.json(atualizado);
    }

    const client = await db();
    const { totalCentavos } = await montarItens(corpo?.itens, client);

    const resultado = await criarPagamentoMP({
      formData,
      valorCentavos: totalCentavos,
      descricao: "Pedido · Sabor do Florestan",
    });

    if (!resultado.aprovado) {
      return NextResponse.json(
        { erro: `Pagamento não aprovado (${resultado.detalhe}).` },
        { status: 402 },
      );
    }

    const pedido = await criarPedido({
      itens: corpo?.itens,
      formaPagamento: "cartao",
      detalhePagamento: "online",
      valorRecebidoCentavos: totalCentavos,
      pago: true,
      cliente: corpo?.cliente ?? null,
    });

    return NextResponse.json(pedido, { status: 201 });
  } catch (erro) {
    return NextResponse.json(
      { erro: erro instanceof Error ? erro.message : "Erro no pagamento." },
      { status: 400 },
    );
  }
}

import { NextResponse } from "next/server";
import { criarPedido, listarPedidos } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pedidos = await listarPedidos();
    return NextResponse.json(pedidos, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (erro) {
    return NextResponse.json(
      { erro: erro instanceof Error ? erro.message : "Erro ao listar pedidos." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const dados = await request.json();
    const pedido = await criarPedido(dados);
    return NextResponse.json(pedido, { status: 201 });
  } catch (erro) {
    return NextResponse.json(
      { erro: erro instanceof Error ? erro.message : "Erro ao criar pedido." },
      { status: 400 },
    );
  }
}

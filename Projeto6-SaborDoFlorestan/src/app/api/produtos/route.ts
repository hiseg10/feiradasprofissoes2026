import { NextResponse } from "next/server";
import { criarProduto, listarProdutos } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const todos = url.searchParams.get("todos") === "1";

  try {
    const produtos = await listarProdutos(todos);
    return NextResponse.json(produtos, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (erro) {
    return NextResponse.json(
      { erro: erro instanceof Error ? erro.message : "Erro ao listar produtos." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const dados = await request.json();
    const produto = await criarProduto(dados);
    return NextResponse.json(produto, { status: 201 });
  } catch (erro) {
    return NextResponse.json(
      { erro: erro instanceof Error ? erro.message : "Erro ao criar produto." },
      { status: 400 },
    );
  }
}

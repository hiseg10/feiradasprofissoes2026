import { NextResponse } from "next/server";
import { atualizarProduto } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const numero = Number(id);

  if (!Number.isInteger(numero) || numero <= 0) {
    return NextResponse.json({ erro: "Produto inválido." }, { status: 400 });
  }

  try {
    const dados = await request.json();
    const produto = await atualizarProduto(numero, dados);
    return NextResponse.json(produto);
  } catch (erro) {
    return NextResponse.json(
      {
        erro:
          erro instanceof Error ? erro.message : "Erro ao atualizar produto.",
      },
      { status: 400 },
    );
  }
}

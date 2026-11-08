import { NextResponse } from "next/server";
import {
  atualizarEquipe,
  removerEquipe,
  buscarEquipe,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const numero = Number(id);

  if (!Number.isInteger(numero) || numero <= 0) {
    return NextResponse.json({ erro: "Equipe inválida." }, { status: 400 });
  }

  try {
    const dados = (await request.json()) as Record<string, unknown>;
    const equipe = await buscarEquipe(numero);
    if (!equipe) {
      return NextResponse.json({ erro: "Equipe não encontrada." }, { status: 404 });
    }
    const equipeAtualizada = await atualizarEquipe(numero, dados);
    return NextResponse.json(equipeAtualizada);
  } catch (erro) {
    return NextResponse.json(
      {
        erro:
          erro instanceof Error ? erro.message : "Erro ao atualizar equipe.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const numero = Number(id);

  if (!Number.isInteger(numero) || numero <= 0) {
    return NextResponse.json({ erro: "Equipe inválida." }, { status: 400 });
  }

  try {
    const existente = await buscarEquipe(numero);
    if (!existente) {
      return NextResponse.json({ erro: "Equipe não encontrada." }, { status: 404 });
    }
    await removerEquipe(numero);
    return NextResponse.json({ ok: true });
  } catch (erro) {
    return NextResponse.json(
      {
        erro:
          erro instanceof Error ? erro.message : "Erro ao remover equipe.",
      },
      { status: 400 },
    );
  }
}

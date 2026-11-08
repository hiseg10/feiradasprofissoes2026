import { NextResponse } from "next/server";
import { criarEquipe, listarEquipes } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const equipes = await listarEquipes();
    return NextResponse.json(equipes, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (erro) {
    return NextResponse.json(
      { erro: erro instanceof Error ? erro.message : "Erro ao listar equipes." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const dados = await request.json();
    const equipe = await criarEquipe(dados);
    return NextResponse.json(equipe, { status: 201 });
  } catch (erro) {
    return NextResponse.json(
      {
        erro: erro instanceof Error ? erro.message : "Erro ao criar equipe.",
        status: 400,
      },
      { status: 400 },
    );
  }
}

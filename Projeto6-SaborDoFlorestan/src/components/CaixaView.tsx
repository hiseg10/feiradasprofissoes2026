"use client";

import Autoatendimento from "./Autoatendimento";
import Pdv from "./Pdv";
import { useSession } from "./SessionProvider";

export default function CaixaView() {
  const { sessao, carregado } = useSession();

  if (!carregado) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10">
        <p className="text-sm text-amber-900/60">Carregando...</p>
      </main>
    );
  }

  if (sessao.modo === "cliente") {
    return (
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 lg:pb-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Caixa</p>
            <h1 className="text-3xl font-black tracking-tight text-ink">
              Autoatendimento
            </h1>
            <p className="mt-1 text-sm text-amber-900/60">
              Monte seu pedido e pague aqui mesmo.
            </p>
          </div>
          <span className="badge bg-brand-50 text-brand-700">Cliente</span>
        </header>

        <Autoatendimento />
      </main>
    );
  }

  if (sessao.modo === "caixa") {
    return <Pdv />;
  }

  const rotuloCargo =
    sessao.operadorCargo === "operador_cozinha"
      ? "Operador de Cozinha"
      : sessao.operadorCargo === "atendente"
        ? "Atendente"
        : sessao.operadorCargo === "garçon"
          ? "Garçom"
          : (sessao.operadorCargo ?? "funcionário");

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="card p-8 text-center">
        <p className="text-4xl">🔒</p>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-ink">
          Caixa restrito
        </h1>
        <p className="mt-2 text-sm text-amber-900/60">
          O perfil <strong className="text-ink">{rotuloCargo}</strong> não pode
          cobrar nem liberar pedidos.
        </p>
        <p className="mt-1 text-xs text-amber-900/50">
          Use um código de operação com cargo <strong>Caixa</strong> para
          acessar esta área.
        </p>
      </div>
    </main>
  );
}

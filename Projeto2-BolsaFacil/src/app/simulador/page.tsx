import type { Metadata } from "next";
import SimuladorJuros from "@/components/SimuladorJuros";

export const metadata: Metadata = {
  title: "Simulador de juros compostos · Bolsa Fácil",
  description: "Veja como aportes mensais e juros compostos crescem ao longo do tempo.",
};

export default function SimuladorPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="max-w-3xl">
        <p className="eyebrow">Simulador</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          O tempo é o ingrediente secreto
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Ajuste valor inicial, aporte mensal, taxa e prazo. A simulação usa juros compostos e serve
          para comparar cenários — não é uma promessa de rentabilidade.
        </p>
      </header>

      <div className="mt-7">
        <SimuladorJuros />
      </div>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-sm font-bold text-slate-900">Comece cedo</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Quanto mais tempo o dinheiro fica investido, maior o efeito dos juros sobre juros.
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm font-bold text-slate-900">Cuidado com taxas</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Taxa de administração e impostos reduzem o resultado final. Sempre compare o líquido.
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm font-bold text-slate-900">Risco existe</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Rentabilidade passada não garante retorno futuro. Diversifique e conheça seu perfil.
          </p>
        </div>
      </section>
    </main>
  );
}

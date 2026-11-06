import type { Metadata } from "next";
import Link from "next/link";
import { INVESTIMENTOS } from "@/lib/conteudo";

export const metadata: Metadata = {
  title: "Comparar investimentos · Bolsa Fácil",
  description: "Compare risco, liquidez, retorno e perfil ideal de cada investimento.",
};

const CORES_RISCO: Record<string, string> = {
  Baixo: "bg-brand-50 text-brand-700",
  Médio: "bg-amber-50 text-amber-700",
  Alto: "bg-red-50 text-red-600",
};

export default function CompararPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="max-w-3xl">
        <p className="eyebrow">Comparador</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Qual investimento combina com cada objetivo?
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Não existe o &ldquo;melhor investimento&rdquo; universal. Existe o investimento adequado ao seu
          objetivo, ao seu prazo e à sua tolerância a risco. Use a tabela como ponto de partida.
        </p>
      </header>

      <div className="mt-7 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Investimento</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Risco</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Liquidez</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Retorno</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Mínimo</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Ideal para</th>
            </tr>
          </thead>
          <tbody>
            {INVESTIMENTOS.map((item) => (
              <tr key={item.nome} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="px-4 py-3 font-bold text-slate-900">{item.nome}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${CORES_RISCO[item.risco]}`}>{item.risco}</span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">{item.liquidez}</td>
                <td className="px-4 py-3 text-xs text-slate-600">{item.retorno}</td>
                <td className="px-4 py-3 text-xs text-slate-600">{item.minimo}</td>
                <td className="px-4 py-3 text-xs leading-relaxed text-slate-600">{item.ideal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-sm font-bold text-brand-800">Reserva de emergência</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Priorize liquidez diária e baixo risco. O objetivo é estar disponível, não render muito.
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm font-bold text-brand-800">Médio prazo</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Combine renda fixa com uma parcela em ativos diversificados, sempre respeitando seu perfil.
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm font-bold text-brand-800">Longo prazo</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Tempo é o maior aliado dos juros compostos. Oscilações de curto prazo pesam menos.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/simulador" className="btn-primary">
          Simular juros compostos
        </Link>
        <Link href="/curador" className="btn-secondary">
          Tirar dúvidas com o curador
        </Link>
      </div>
    </main>
  );
}

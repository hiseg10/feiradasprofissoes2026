"use client";

import { useMemo, useState } from "react";
import { brl, numero } from "@/lib/format";

const PRESETS = [
  { rotulo: "Selic", taxa: 12.25 },
  { rotulo: "CDI", taxa: 12.15 },
  { rotulo: "Poupança", taxa: 6.17 },
  { rotulo: "Cenário otimista", taxa: 15 },
];

export default function SimuladorJuros() {
  const [inicial, setInicial] = useState(1000);
  const [aporte, setAporte] = useState(200);
  const [taxaAnual, setTaxaAnual] = useState(12.25);
  const [anos, setAnos] = useState(10);

  const resultado = useMemo(() => {
    const taxaSegura = Math.max(0, taxaAnual);
    const meses = Math.max(0, Math.round(anos * 12));
    const taxaMensal = Math.pow(1 + taxaSegura / 100, 1 / 12) - 1;
    let saldo = Math.max(0, inicial);
    for (let mes = 0; mes < meses; mes += 1) {
      saldo = saldo * (1 + taxaMensal) + Math.max(0, aporte);
    }
    const investido = Math.max(0, inicial) + Math.max(0, aporte) * meses;
    const juros = saldo - investido;
    const pctInvestido = saldo > 0 ? Math.min(100, Math.max(0, (investido / saldo) * 100)) : 100;
    return { saldo, investido, juros, meses, pctInvestido };
  }, [inicial, aporte, taxaAnual, anos]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="card p-6">
        <h2 className="text-lg font-bold text-slate-900">Monte seu cenário</h2>
        <p className="mt-1 text-sm text-slate-500">
          Simulação educativa com juros compostos. Não considera impostos, taxas ou inflação.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="inicial" className="label">
              Valor inicial (R$)
            </label>
            <input
              id="inicial"
              className="input"
              type="number"
              min={0}
              step={100}
              value={inicial}
              onChange={(evento) => setInicial(Number(evento.target.value) || 0)}
            />
          </div>
          <div>
            <label htmlFor="aporte" className="label">
              Aporte por mês (R$)
            </label>
            <input
              id="aporte"
              className="input"
              type="number"
              min={0}
              step={50}
              value={aporte}
              onChange={(evento) => setAporte(Number(evento.target.value) || 0)}
            />
          </div>
          <div>
            <label htmlFor="taxa" className="label">
              Taxa ao ano (%)
            </label>
            <input
              id="taxa"
              className="input"
              type="number"
              min={0}
              step={0.25}
              value={taxaAnual}
              onChange={(evento) => setTaxaAnual(Number(evento.target.value) || 0)}
            />
          </div>
          <div>
            <label htmlFor="anos" className="label">
              Período (anos)
            </label>
            <input
              id="anos"
              className="input"
              type="number"
              min={0}
              max={50}
              step={1}
              value={anos}
              onChange={(evento) => setAnos(Number(evento.target.value) || 0)}
            />
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Taxas de referência
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.rotulo}
                type="button"
                onClick={() => setTaxaAnual(preset.taxa)}
                className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand-400 hover:text-brand-700"
              >
                {preset.rotulo} · {numero(preset.taxa)}%
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="bg-gradient-to-br from-brand-800 via-brand-700 to-emerald-900 p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-200">
            Resultado estimado
          </p>
          <p className="mt-2 text-4xl font-black tracking-tight">{brl(resultado.saldo)}</p>
          <p className="mt-1 text-sm text-brand-100">
            em {resultado.meses} {resultado.meses === 1 ? "mês" : "meses"}
          </p>
        </div>

        <div className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Você investiu
              </p>
              <p className="mt-1 text-lg font-bold text-slate-800">{brl(resultado.investido)}</p>
            </div>
            <div className="rounded-xl bg-brand-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                Juros ganhos
              </p>
              <p className="mt-1 text-lg font-bold text-brand-800">{brl(resultado.juros)}</p>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Aportes</span>
              <span>Rendimento</span>
            </div>
            <div className="flex h-4 overflow-hidden rounded-full bg-slate-100">
              <div
                className="bg-slate-400"
                style={{ width: `${resultado.pctInvestido}%` }}
                title="Valor investido"
              />
              <div className="flex-1 bg-brand-500" title="Rendimento" />
            </div>
          </div>

          <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
            Simulação didática. Rentabilidade passada ou projetada não garante resultado futuro.
            Impostos e taxas podem reduzir o valor final.
          </p>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import PainelEstufa from "@/components/PainelEstufa";
import { obterEstado } from "@/lib/estufa";

export const dynamic = "force-dynamic";

export default function Home() {
  const estado = obterEstado();

  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-brand-950 to-emerald-950 text-white">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-terra-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-14 sm:pt-20">
          <div className="flex flex-wrap gap-2">
            <span className="badge bg-brand-500/15 text-brand-200 ring-1 ring-inset ring-brand-400/30">
              Feira das Profissões · Florestan 2026
            </span>
            <span className="badge bg-white/10 text-slate-200 ring-1 ring-inset ring-white/15">
              IoT + Robótica no Agro
            </span>
          </div>
          <div className="mt-6 grid items-end gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <h1 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
                A horta que avisa
                <span className="block text-brand-300">quando precisa de água.</span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300">
                O AgroSmart usa sensores de temperatura, umidade e luz para cuidar de uma horta
                inteligente. O painel mostra tudo em tempo real, aciona a irrigação e usa IA para
                ajudar a identificar problemas nas plantas.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/simulador" className="btn-primary">
                  Simular sensores
                </Link>
                <Link href="/diagnostico" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
                  Diagnosticar uma folha
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { titulo: "Sensores", valor: "4", nota: "temp, ar, solo e luz" },
                { titulo: "Irrigação", valor: "Auto", nota: "com histerese" },
                { titulo: "Diagnóstico", valor: "IA", nota: "visão computacional" },
              ].map((item) => (
                <div key={item.titulo} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {item.titulo}
                  </p>
                  <p className="mt-1 text-xl font-black text-white">{item.valor}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">{item.nota}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <PainelEstufa inicial={estado} />
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:grid-cols-3">
          <div className="card p-5">
            <p className="text-2xl">🌱</p>
            <h2 className="mt-2 text-sm font-bold text-slate-900">Sustentabilidade</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Irrigar só quando necessário economiza água e reduz o desperdício.
            </p>
          </div>
          <div className="card p-5">
            <p className="text-2xl">📡</p>
            <h2 className="mt-2 text-sm font-bold text-slate-900">IoT no campo</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              O ESP32 ou o Arduino envia leituras para a mesma API que o painel usa. Sem hardware,
              o modo simulação mantém a demonstração viva.
            </p>
          </div>
          <div className="card p-5">
            <p className="text-2xl">🤖</p>
            <h2 className="mt-2 text-sm font-bold text-slate-900">IA educativa</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              A análise de imagem propõe hipóteses e próximos passos, sem substituir a assistência
              técnica.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

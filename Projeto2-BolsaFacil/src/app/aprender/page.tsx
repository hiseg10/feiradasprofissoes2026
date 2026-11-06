import type { Metadata } from "next";
import Link from "next/link";
import { GLOSSARIO, TRILHAS } from "@/lib/conteudo";

export const metadata: Metadata = {
  title: "Aprender · Bolsa Fácil",
  description: "Trilhas e glossário de educação financeira do Bolsa Fácil.",
};

export default function AprenderPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="max-w-3xl">
        <p className="eyebrow">Trilhas educativas</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Do zero ao primeiro investimento
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Quatro trilhas curtas, com exemplos do dia a dia. Leia no seu ritmo, volte aos termos que
          não lembrar e teste no quiz no final.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/comparar" className="btn-secondary">
            Comparar investimentos
          </Link>
          <Link href="/quiz" className="btn-primary">
            Testar meus conhecimentos
          </Link>
        </div>
      </header>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {TRILHAS.map((trilha) => (
          <section key={trilha.id} className="card p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-xl">
                {trilha.emoji}
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{trilha.titulo}</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{trilha.descricao}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {trilha.modulos.map((modulo) => (
                <details
                  key={modulo.titulo}
                  className="group rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 open:bg-white"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-slate-800">
                    {modulo.titulo}
                    <span className="text-slate-400 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">{modulo.resumo}</p>
                  <ul className="mt-2 space-y-1.5">
                    {modulo.topicos.map((topico) => (
                      <li key={topico} className="flex gap-2 text-xs leading-relaxed text-slate-600">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-500" />
                        {topico}
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-12">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Glossário</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
              Economês traduzido
            </h2>
          </div>
          <p className="hidden text-xs text-slate-500 sm:block">{GLOSSARIO.length} termos</p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GLOSSARIO.map((item) => (
            <div key={item.termo} className="card p-4">
              <p className="text-sm font-bold text-brand-800">{item.termo}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.definicao}</p>
            </div>
          ))}
        </div>
      </section>

      <aside className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-900">
        <p className="font-bold">Lembrete</p>
        <p className="mt-1">
          Conteúdo educativo. Antes de investir, confira seu perfil, seus objetivos e procure uma
          instituição autorizada pela CVM ou pelo Banco Central.
        </p>
      </aside>
    </main>
  );
}

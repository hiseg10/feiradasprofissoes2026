import Link from "next/link";
import GraficoLinha from "@/components/GraficoLinha";
import TickerTape from "@/components/TickerTape";
import { brl, percentual } from "@/lib/format";
import { getCotacoes, getIndicadores } from "@/lib/mercado";

export const dynamic = "force-dynamic";

const ATALHOS = [
  {
    href: "/aprender",
    emoji: "📚",
    titulo: "Trilhas educativas",
    texto: "Renda fixa, ações, FIIs e cuidados essenciais explicados sem economês.",
  },
  {
    href: "/comparar",
    emoji: "⚖️",
    titulo: "Comparador",
    texto: "Risco, liquidez, retorno e para quem cada investimento faz sentido.",
  },
  {
    href: "/simulador",
    emoji: "🧮",
    titulo: "Simulador",
    texto: "Veja o efeito dos juros compostos com aportes mensais.",
  },
  {
    href: "/curador",
    emoji: "🤖",
    titulo: "Curador com IA",
    texto: "Pergunte em português e receba explicações com dados do mercado.",
  },
];

const PASSOS = [
  {
    numero: "01",
    titulo: "Entenda o conceito",
    texto: "Comece pelas trilhas e pelo glossário. Cada termo tem uma explicação curta e prática.",
  },
  {
    numero: "02",
    titulo: "Compare alternativas",
    texto: "Use o comparador para ver risco, liquidez e para quem cada investimento foi feito.",
  },
  {
    numero: "03",
    titulo: "Pergunte e simule",
    texto: "Converse com o curador de IA e teste cenários no simulador de juros compostos.",
  },
];

export default async function Home() {
  const [mercado, macro] = await Promise.all([getCotacoes(), getIndicadores()]);
  const watchlist = mercado.cotacoes.slice(0, 6);
  const dadosReais = mercado.fonte === "brapi";

  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-brand-950 to-slate-900 text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-14 sm:pt-20">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge bg-brand-500/15 text-brand-200 ring-1 ring-inset ring-brand-400/30">
              Feira das Profissões · Florestan 2026
            </span>
            <span className="badge bg-white/10 text-slate-200 ring-1 ring-inset ring-white/15">
              {dadosReais ? "Dados reais via brapi.dev" : "Modo demonstração"}
            </span>
          </div>

          <div className="mt-6 grid items-end gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <h1 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
                Entenda o mercado.
                <span className="block text-brand-300">Sem economês.</span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300">
                O Bolsa Fácil foi feito para o cidadão comum: explica investimentos, mostra cotações
                reais e responde dúvidas com um curador de inteligência artificial. Tudo com foco em
                educação, não em recomendação.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/aprender" className="btn-primary">
                  Começar pelas trilhas
                </Link>
                <Link href="/curador" className="btn-ghost-dark">
                  Conversar com o curador
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {macro.indicadores.map((indicador) => (
                <div
                  key={indicador.nome}
                  className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {indicador.nome}
                  </p>
                  <p className="mt-1 text-xl font-black text-white">
                    {indicador.valor.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    <span className="ml-0.5 text-xs font-semibold text-brand-300">
                      {indicador.unidade.startsWith("%") ? "%" : ""}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-500">{indicador.unidade}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <TickerTape inicial={mercado.cotacoes} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Painel do dia</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
              Alguns ativos para observar
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Fonte: {dadosReais ? "brapi.dev" : "dados de demonstração"} · atualização automática a
            cada 60s
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {watchlist.map((cotacao) => {
            const alta = cotacao.variacaoPercentual >= 0;
            return (
              <article key={cotacao.simbolo} className="card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-black text-slate-900">{cotacao.simbolo}</p>
                    <p className="text-xs text-slate-500">{cotacao.nome}</p>
                  </div>
                  <span
                    className={`badge ${
                      alta ? "bg-brand-50 text-brand-700" : "bg-red-50 text-red-600"
                    }`}
                  >
                    {percentual(cotacao.variacaoPercentual)}
                  </span>
                </div>
                <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                  {brl(cotacao.preco)}
                </p>
                <GraficoLinha valores={cotacao.historico} positivo={alta} />
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <p className="eyebrow">Comece por aqui</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
            Quatro caminhos para aprender
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ATALHOS.map((atalho) => (
              <Link
                key={atalho.href}
                href={atalho.href}
                className="card group p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
              >
                <span className="text-2xl">{atalho.emoji}</span>
                <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-brand-800">
                  {atalho.titulo}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{atalho.texto}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="eyebrow">Como funciona</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
              Do conceito à decisão consciente
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              O projeto conecta conteúdo educacional, dados públicos de mercado e inteligência
              artificial. A ideia é simples: transformar informação em compreensão.
            </p>
            <Link href="/comparar" className="btn-secondary mt-5">
              Ver comparador de investimentos
            </Link>
          </div>
          <div className="space-y-3">
            {PASSOS.map((passo) => (
              <div key={passo.numero} className="card flex gap-4 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-sm font-black text-brand-700">
                  {passo.numero}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{passo.titulo}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{passo.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-brand-700 via-brand-800 to-emerald-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
            Teste o que você aprendeu
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-brand-100">
            São 8 perguntas rápidas sobre o mercado. Depois, desafie alguém do estande a explicar
            cada resposta.
          </p>
          <Link
            href="/quiz"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-brand-800 transition hover:bg-brand-50"
          >
            Jogar o quiz
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-xs leading-relaxed text-slate-400">
          Fontes de dados: brapi.dev (cotações) e Banco Central do Brasil (Selic, CDI e IPCA). Sem
          token configurado, o painel usa dados de demonstração. O Bolsa Fácil é um projeto escolar
          e não substitui a orientação de um profissional certificado.
        </p>
      </section>
    </main>
  );
}

import Link from "next/link";
import { precoFinal, type Jogo } from "@/lib/catalogo";
import { brl } from "@/lib/format";

export default function Hero({ jogo }: { jogo: Jogo }) {
  const final = precoFinal(jogo);

  return (
    <section
      className="relative overflow-hidden border-b border-white/10"
      style={{
        background: `radial-gradient(circle at 20% 20%, ${jogo.cores[0]}44, transparent 45%), linear-gradient(120deg, #0b1220 0%, #16202d 55%, ${jogo.cores[1]} 100%)`,
      }}
    >
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 lg:grid-cols-[1.3fr_1fr] lg:py-16">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="badge bg-steam-400/15 text-steam-300 ring-1 ring-inset ring-steam-400/30">
              Em destaque
            </span>
            <span className="badge bg-white/10 text-slate-300">{jogo.generos.join(" · ")}</span>
            {jogo.desconto > 0 ? (
              <span className="badge bg-lime-400/15 text-lime-300">-{jogo.desconto}%</span>
            ) : null}
          </div>

          <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl">
            {jogo.titulo}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            {jogo.descricao}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <span className="font-semibold text-amber-300">★ {jogo.nota.toFixed(1)}</span>
            <span>{jogo.tempoMedioHoras}h de história</span>
            <span>{jogo.desenvolvedora}</span>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href={`/jogo/${jogo.slug}`} className="btn-primary">
              Ver na loja
            </Link>
            <Link href="/descobrir" className="btn-secondary">
              Descobrir meu jogo
            </Link>
            <div>
              {jogo.desconto > 0 ? (
                <span className="text-xs text-slate-500 line-through">{brl(jogo.precoCentavos)}</span>
              ) : null}
              <p className="text-xl font-black text-lime-300">{final === 0 ? "Grátis" : brl(final)}</p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div
            className="aspect-[4/5] overflow-hidden rounded-3xl border border-white/15 shadow-2xl"
            style={{ background: `linear-gradient(160deg, ${jogo.cores[0]}, ${jogo.cores[1]})` }}
          >
            <div className="flex h-full flex-col justify-between p-6">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-white/70">
                <span>Story Games</span>
                <span>2026</span>
              </div>
              <span className="text-center text-7xl drop-shadow-lg">{jogo.emoji}</span>
              <div>
                <p className="text-2xl font-black leading-tight text-white">{jogo.titulo}</p>
                <p className="mt-1 text-xs text-white/70">{jogo.descricaoCurta}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

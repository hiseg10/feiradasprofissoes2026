import Link from "next/link";
import { precoFinal, type Jogo } from "@/lib/catalogo";
import { brl, numero } from "@/lib/format";

export default function GameCard({ jogo }: { jogo: Jogo }) {
  const final = precoFinal(jogo);

  return (
    <Link
      href={`/jogo/${jogo.slug}`}
      className="card group overflow-hidden transition hover:-translate-y-1 hover:border-steam-400/50 hover:shadow-lg hover:shadow-black/30"
    >
      <div
        className="relative flex aspect-[16/9] items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${jogo.cores[0]}, ${jogo.cores[1]})` }}
      >
        <span className="text-5xl drop-shadow">{jogo.emoji}</span>
        {jogo.desconto > 0 ? (
          <span className="badge absolute left-2 top-2 bg-lime-300 text-steam-950">-{jogo.desconto}%</span>
        ) : null}
        {jogo.destaque ? (
          <span className="badge absolute right-2 top-2 bg-black/60 text-steam-100">Destaque</span>
        ) : null}
      </div>

      <div className="p-3 sm:p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-steam-400">
          {jogo.generos.join(" · ")}
        </p>
        <h3 className="mt-1 line-clamp-1 text-sm font-bold text-white group-hover:text-steam-300">
          {jogo.titulo}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
          {jogo.descricaoCurta}
        </p>
        <div className="mt-3 flex items-end justify-between gap-2">
          <span className="text-xs font-semibold text-amber-300">
            ★ {jogo.nota.toFixed(1)}{" "}
            <span className="font-normal text-slate-500">({numero(jogo.totalAvaliacoes)})</span>
          </span>
          <div className="text-right">
            {jogo.desconto > 0 ? (
              <p className="text-[10px] text-slate-500 line-through">{brl(jogo.precoCentavos)}</p>
            ) : null}
            <p className="text-sm font-bold text-lime-300">{final === 0 ? "Grátis" : brl(final)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

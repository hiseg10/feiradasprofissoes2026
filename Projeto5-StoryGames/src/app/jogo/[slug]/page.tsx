import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GameActions from "@/components/GameActions";
import GameCard from "@/components/GameCard";
import PriceTag from "@/components/PriceTag";
import ReviewList from "@/components/ReviewList";
import ScreenshotGallery from "@/components/ScreenshotGallery";
import {
  buscarJogo,
  JOGOS,
  jogosSemelhantes,
  obterRequisitos,
} from "@/lib/catalogo";
import { dataCurta, numero } from "@/lib/format";

export function generateStaticParams() {
  return JOGOS.map((jogo) => ({ slug: jogo.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const jogo = buscarJogo(slug);
  return {
    title: jogo ? `${jogo.titulo} · Story Games` : "Jogo não encontrado",
    description: jogo?.descricaoCurta,
  };
}

export default async function JogoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const jogo = buscarJogo(slug);

  if (!jogo) notFound();

  const requisitos = obterRequisitos(jogo);
  const semelhantes = jogosSemelhantes(jogo);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <nav className="text-xs text-slate-500">
        <Link href="/loja" className="hover:text-steam-300">
          Loja
        </Link>{" "}
        / <span className="text-slate-300">{jogo.titulo}</span>
      </nav>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div
            className="relative overflow-hidden rounded-2xl border border-white/10"
            style={{
              background: `linear-gradient(120deg, ${jogo.cores[1]}, ${jogo.cores[0]})`,
            }}
          >
            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-black/20 text-4xl">
                  {jogo.emoji}
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                    {jogo.generos.join(" · ")}
                  </p>
                  <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
                    {jogo.titulo}
                  </h1>
                  <p className="mt-1 text-sm text-white/80">{jogo.descricaoCurta}</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-white/70">{jogo.desenvolvedora}</p>
                <p className="text-xs text-white/70">{dataCurta(jogo.lancamento)}</p>
              </div>
            </div>
          </div>

          <ScreenshotGallery jogo={jogo} />

          <section className="card p-5">
            <h2 className="text-lg font-bold text-white">Sobre este jogo</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{jogo.descricao}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-3">
              {jogo.destaques.map((destaque) => (
                <li
                  key={destaque}
                  className="rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-xs text-slate-300"
                >
                  {destaque}
                </li>
              ))}
            </ul>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="card p-5">
              <h2 className="text-sm font-bold text-white">Requisitos mínimos</h2>
              <ul className="mt-2 space-y-1 text-xs text-slate-400">
                {requisitos.minimo.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="card p-5">
              <h2 className="text-sm font-bold text-white">Recomendados</h2>
              <ul className="mt-2 space-y-1 text-xs text-slate-400">
                {requisitos.recomendado.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-white">Avaliações</h2>
              <span className="text-xs text-slate-400">
                ★ {jogo.nota.toFixed(1)} · {numero(jogo.totalAvaliacoes)} avaliações
              </span>
            </div>
            <div className="mt-3">
              <ReviewList avaliacoes={jogo.avaliacoes} />
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-4">
            <PriceTag jogo={jogo} grande />
            <p className="mt-2 text-[11px] text-slate-500">
              Compra simulada. Nenhum pagamento real é processado.
            </p>
            <div className="mt-4">
              <GameActions jogo={jogo} />
            </div>
          </div>

          <div className="card p-4 text-xs text-slate-400">
            <p className="font-bold text-white">Detalhes</p>
            <dl className="mt-2 space-y-1.5">
              <div className="flex justify-between gap-2">
                <dt>Desenvolvedora</dt>
                <dd className="text-slate-300">{jogo.desenvolvedora}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Publicadora</dt>
                <dd className="text-slate-300">{jogo.publicadora}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Lançamento</dt>
                <dd className="text-slate-300">{dataCurta(jogo.lancamento)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Duração</dt>
                <dd className="text-slate-300">~{jogo.tempoMedioHoras}h</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Conquistas</dt>
                <dd className="text-slate-300">{jogo.conquistas}</dd>
              </div>
            </dl>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {jogo.tags.map((tag) => (
                <span key={tag} className="badge bg-white/5 text-slate-300">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {semelhantes.length ? (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-white">Mais como este</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {semelhantes.map((item) => (
              <GameCard key={item.slug} jogo={item} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

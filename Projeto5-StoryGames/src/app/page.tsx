import Link from "next/link";
import GameCard from "@/components/GameCard";
import Hero from "@/components/Hero";
import SectionRow from "@/components/SectionRow";
import { JOGOS, generosUnicos } from "@/lib/catalogo";

export default function Home() {
  const destaque = JOGOS.find((jogo) => jogo.slug === "neon-e-memoria") ?? JOGOS[0];
  const ofertas = [...JOGOS]
    .filter((jogo) => jogo.desconto > 0)
    .sort((a, b) => b.desconto - a.desconto)
    .slice(0, 4);
  const maisVendidos = JOGOS.filter((jogo) => jogo.maisVendido).slice(0, 4);
  const curtas = [...JOGOS]
    .filter((jogo) => jogo.tempoMedioHoras <= 5)
    .slice(0, 4);
  const novidades = [...JOGOS]
    .sort((a, b) => b.lancamento.localeCompare(a.lancamento))
    .slice(0, 4);
  const generos = generosUnicos();

  return (
    <main>
      <Hero jogo={destaque} />

      <SectionRow
        titulo="Ofertas da semana"
        subtitulo="Descontos simulados para a feira."
        acao={
          <Link href="/loja" className="btn-secondary">
            Ver loja
          </Link>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ofertas.map((jogo) => (
            <GameCard key={jogo.slug} jogo={jogo} />
          ))}
        </div>
      </SectionRow>

      <SectionRow
        titulo="Mais vendidos"
        subtitulo="O que a comunidade fictícia está jogando."
        acao={
          <Link href="/loja" className="btn-secondary">
            Explorar
          </Link>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {maisVendidos.map((jogo) => (
            <GameCard key={jogo.slug} jogo={jogo} />
          ))}
        </div>
      </SectionRow>

      <SectionRow
        titulo="Para jogar em uma noite"
        subtitulo="Histórias curtas para começar e terminar no mesmo dia."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {curtas.map((jogo) => (
            <GameCard key={jogo.slug} jogo={jogo} />
          ))}
        </div>
      </SectionRow>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="card overflow-hidden border-steam-400/20 bg-gradient-to-r from-steam-800 to-steam-700 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow">Recomendação com IA</p>
              <h2 className="mt-1 text-2xl font-black text-white">Não sabe o que jogar?</h2>
              <p className="mt-2 max-w-xl text-sm text-slate-300">
                Diga seu gênero, tempo e clima. O curador escolhe três jogos do catálogo e
                explica por quê.
              </p>
            </div>
            <Link href="/descobrir" className="btn-primary shrink-0">
              Descobrir meu jogo
            </Link>
          </div>
        </div>
      </section>

      <SectionRow titulo="Novidades" subtitulo="Lançamentos recentes do catálogo.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {novidades.map((jogo) => (
            <GameCard key={jogo.slug} jogo={jogo} />
          ))}
        </div>
      </SectionRow>

      <SectionRow titulo="Explore por gênero" subtitulo="Encontre histórias do seu jeito.">
        <div className="flex flex-wrap gap-2">
          {generos.map((genero) => (
            <Link
              key={genero}
              href={`/loja?genero=${encodeURIComponent(genero)}`}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-steam-400/50 hover:text-steam-300"
            >
              {genero}
            </Link>
          ))}
        </div>
      </SectionRow>
    </main>
  );
}

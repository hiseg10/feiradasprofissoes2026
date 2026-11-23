import Link from "next/link";
import Explorar from "@/components/Explorar";
import {
  BAIRRO,
  CIDADE,
  MAPS_BAIRRO,
  MAPS_EMBED,
  PONTOS,
  categoriasComPontos,
} from "@/lib/conteudo";

export default function Home() {
  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-teal-950 to-cyan-950 text-white">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-14 sm:pt-20">
          <div className="flex flex-wrap gap-2">
            <span className="badge bg-teal-500/15 text-teal-200 ring-1 ring-inset ring-teal-400/30">
              Feira das Profissões · Florestan 2026
            </span>
            <span className="badge bg-white/10 text-slate-200 ring-1 ring-inset ring-white/15">
              {BAIRRO} · {CIDADE}
            </span>
          </div>
          <div className="mt-6 grid items-end gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <h1 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
                Descubra o que o
                <span className="block text-teal-300">Deus Quer tem de melhor.</span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300">
                Um guia digital feito pelos alunos para valorizar quem faz o bairro acontecer em
                Teresina – PI: lanchonetes, bares, escolas, saúde, praças e espaços de lazer. Peça
                um roteiro ao guia de IA e explore no seu ritmo.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/guia" className="btn-primary">
                  Montar meu roteiro com IA
                </Link>
                <a
                  href="#explorar"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Explorar os pontos
                </a>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { titulo: "Pontos", valor: String(PONTOS.length), nota: "no bairro Deus Quer" },
                { titulo: "Categorias", valor: String(categoriasComPontos().length), nota: "para todos os gostos" },
                { titulo: "Guia", valor: "IA", nota: "roteiros sob medida" },
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

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 py-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="eyebrow">Onde fica</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
              Um guia do bairro {BAIRRO}, em {CIDADE}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              O recorte do projeto é a região do Bom Princípio, com ruas como a Avenida Luiz Vieira,
              a Avenida Professor Camilo Filho e a Rua Cecy Nepomuceno Pires. Todos os pontos ficam
              no bairro ou em seu entorno imediato.
            </p>
            <a
              href={MAPS_BAIRRO}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-4"
            >
              Abrir o bairro no Google Maps
            </a>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <iframe
              title={`Mapa do bairro ${BAIRRO}, ${CIDADE}`}
              src={MAPS_EMBED}
              className="h-72 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <section id="explorar" className="mx-auto max-w-6xl px-4 py-10">
        <div className="max-w-2xl">
          <p className="eyebrow">Explorar</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
            O {BAIRRO} na palma da mão
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Filtre por categoria ou busque pelo que você procura. Cada ponto tem endereço, horário,
            dica e um QR code para compartilhar.
          </p>
        </div>
        <div className="mt-6">
          <Explorar pontos={PONTOS} />
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:grid-cols-3">
          <div className="card p-5">
            <p className="text-2xl">🧭</p>
            <h2 className="mt-2 text-sm font-bold text-slate-900">Roteiros com IA</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              O guia monta sugestões de 2 a 4 horas usando apenas pontos do bairro Deus Quer.
            </p>
          </div>
          <div className="card p-5">
            <p className="text-2xl">🤝</p>
            <h2 className="mt-2 text-sm font-bold text-slate-900">Comércio local</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Valoriza lanchonetes, bares, escolas e serviços que fazem o Deus Quer acontecer.
            </p>
          </div>
          <div className="card p-5">
            <p className="text-2xl">📱</p>
            <h2 className="mt-2 text-sm font-bold text-slate-900">QR codes</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Cada ponto tem um QR code para o estande e para os parceiros divulgarem.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
            Deixe o guia montar seu passeio pelo {BAIRRO}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-teal-100">
            Diga quanto tempo você tem e o que gosta. O guia sugere um roteiro curto, a pé, com
            paradas para comer e descansar em {CIDADE}.
          </p>
          <Link
            href="/guia"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-teal-800 transition hover:bg-teal-50"
          >
            Abrir o guia de IA
          </Link>
        </div>
      </section>
    </main>
  );
}

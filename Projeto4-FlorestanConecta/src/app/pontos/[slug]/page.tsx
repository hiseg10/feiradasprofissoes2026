import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCodePonto from "@/components/QRCodePonto";
import { buscarPonto, CORES_CATEGORIA, PONTOS } from "@/lib/conteudo";

export function generateStaticParams() {
  return PONTOS.map((ponto) => ({ slug: ponto.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ponto = buscarPonto(slug);
  return {
    title: ponto ? `${ponto.nome} · Florestan Conecta` : "Ponto não encontrado",
    description: ponto?.descricao,
  };
}

export default async function PontoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ponto = buscarPonto(slug);

  if (!ponto) notFound();

  const cores = CORES_CATEGORIA[ponto.categoria];
  const consultaMapa = encodeURIComponent(`${ponto.nome} ${ponto.endereco}`);
  const linkMapa = `https://www.google.com/maps/search/?api=1&query=${consultaMapa}`;
  const outros = PONTOS.filter((item) => item.slug !== ponto.slug).slice(0, 3);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/" className="text-xs font-semibold text-teal-700 hover:underline">
        ← Voltar para o guia
      </Link>

      <header className={`mt-4 overflow-hidden rounded-3xl bg-gradient-to-br ${cores.gradiente} p-6 text-white`}>
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur">
            {ponto.emoji}
          </span>
          <div>
            <span className="badge bg-white/20 text-white">{ponto.categoria}</span>
            <h1 className="mt-2 text-3xl font-black tracking-tight">{ponto.nome}</h1>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/90">{ponto.descricao}</p>
      </header>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="text-sm font-bold text-slate-900">Informações</h2>
            <dl className="mt-3 space-y-2.5 text-sm">
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-slate-500">Endereço</dt>
                <dd className="font-medium text-slate-800">{ponto.endereco}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-slate-500">Horário</dt>
                <dd className="font-medium text-slate-800">{ponto.horario}</dd>
              </div>
              {ponto.telefone ? (
                <div className="flex gap-3">
                  <dt className="w-20 shrink-0 text-slate-500">Telefone</dt>
                  <dd className="font-medium text-slate-800">{ponto.telefone}</dd>
                </div>
              ) : null}
            </dl>
            <a
              href={linkMapa}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-4"
            >
              Abrir no mapa
            </a>
          </div>

          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
            <h2 className="text-sm font-bold text-teal-900">Dica do guia</h2>
            <p className="mt-1 text-sm leading-relaxed text-teal-900/80">{ponto.dica}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {ponto.tags.map((tag) => (
              <span key={tag} className="badge bg-slate-100 text-slate-600">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <QRCodePonto nome={ponto.nome} />
          <div className="card p-5">
            <h2 className="text-sm font-bold text-slate-900">Outros pontos</h2>
            <div className="mt-3 space-y-2">
              {outros.map((item) => (
                <Link
                  key={item.slug}
                  href={`/pontos/${item.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 transition hover:border-teal-300 hover:bg-teal-50"
                >
                  <span className="text-lg">{item.emoji}</span>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{item.nome}</p>
                    <p className="text-[11px] text-slate-500">{item.categoria}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

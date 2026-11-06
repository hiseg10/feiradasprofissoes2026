import type { Avaliacao } from "@/lib/catalogo";

function Estrelas({ nota }: { nota: number }) {
  const cheias = Math.round(nota);
  return (
    <span className="text-xs font-bold text-amber-300">
      {"★".repeat(cheias)}
      <span className="text-slate-600">{"★".repeat(5 - cheias)}</span>
    </span>
  );
}

export default function ReviewList({ avaliacoes }: { avaliacoes: Avaliacao[] }) {
  return (
    <div className="space-y-3">
      {avaliacoes.map((avaliacao) => (
        <article key={`${avaliacao.autor}-${avaliacao.data}`} className="card p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-steam-600 text-xs font-bold text-white">
                {avaliacao.autor[0]}
              </span>
              <div>
                <p className="text-sm font-bold text-white">{avaliacao.autor}</p>
                <p className="text-[11px] text-slate-500">
                  {avaliacao.horas}h jogadas · {avaliacao.data}
                </p>
              </div>
            </div>
            <Estrelas nota={avaliacao.nota} />
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{avaliacao.texto}</p>
        </article>
      ))}
    </div>
  );
}

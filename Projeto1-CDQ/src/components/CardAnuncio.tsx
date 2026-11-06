import Link from "next/link";
import {
  CORES_CATEGORIA,
  rotuloCategoria,
  rotuloCondicao,
} from "@/lib/constantes";
import { estaImpulsionado, fotosDe, type AnuncioComAutor } from "@/lib/data";
import { formatarMoeda } from "@/lib/format";

export function FotoAnuncio({
  anuncio,
  className = "",
  prioridade = false,
}: {
  anuncio: Pick<AnuncioComAutor, "fotos" | "categoria" | "titulo">;
  className?: string;
  prioridade?: boolean;
}) {
  const fotos = fotosDe(anuncio);
  if (fotos.length > 0) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={fotos[0]}
        alt={anuncio.titulo}
        loading={prioridade ? "eager" : "lazy"}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  const cor = CORES_CATEGORIA[anuncio.categoria] ?? CORES_CATEGORIA.outros;
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br ${cor} p-4 text-center text-white ${className}`}
    >
      <span className="text-[11px] font-bold uppercase tracking-widest opacity-90">
        {rotuloCategoria(anuncio.categoria)}
      </span>
      <span className="mt-1 text-[10px] font-medium uppercase tracking-widest opacity-60">sem foto</span>
    </div>
  );
}

export function CardAnuncio({ anuncio }: { anuncio: AnuncioComAutor }) {
  const destaque = estaImpulsionado(anuncio);

  return (
    <Link
      href={`/anuncio/${anuncio.id}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <FotoAnuncio anuncio={anuncio} className="transition duration-300 group-hover:scale-105" />
        {destaque ? (
          <span className="absolute left-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950 shadow">
            Destaque
          </span>
        ) : null}
      </div>
      <div className="space-y-0.5 p-3">
        <p className="text-base font-bold text-slate-800">
          {anuncio.preco_centavos === 0 ? "Grátis" : formatarMoeda(anuncio.preco_centavos)}
        </p>
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-slate-700">{anuncio.titulo}</h3>
        <p className="text-[11px] text-slate-400">
          {rotuloCategoria(anuncio.categoria)} · {rotuloCondicao(anuncio.condicao)}
        </p>
        <p className="text-[11px] text-slate-400">{anuncio.bairro || "Deus Quer"}</p>
      </div>
    </Link>
  );
}

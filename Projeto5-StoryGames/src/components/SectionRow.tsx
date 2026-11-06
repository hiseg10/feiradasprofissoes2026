import type { ReactNode } from "react";

export default function SectionRow({
  titulo,
  subtitulo,
  acao,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  acao?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">{titulo}</h2>
          {subtitulo ? <p className="mt-1 text-sm text-slate-400">{subtitulo}</p> : null}
        </div>
        {acao}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

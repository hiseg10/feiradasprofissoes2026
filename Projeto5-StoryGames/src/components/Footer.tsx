import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-white/10 bg-steam-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-black tracking-tight text-white">STORY GAMES</p>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-500">
              Loja fictícia criada para a Feira das Profissões Florestan 2026. Não somos afiliados à
              Steam. O catálogo é original e nenhum pagamento real é processado.
            </p>
          </div>
          <nav className="flex flex-wrap gap-4 text-xs text-slate-400">
            <Link href="/loja" className="hover:text-steam-300">Loja</Link>
            <Link href="/descobrir" className="hover:text-steam-300">Descobrir</Link>
            <Link href="/biblioteca" className="hover:text-steam-300">Biblioteca</Link>
            <Link href="/lista-desejos" className="hover:text-steam-300">Desejos</Link>
            <Link href="/perfil" className="hover:text-steam-300">Perfil</Link>
          </nav>
        </div>
        <p className="mt-6 text-[11px] text-slate-600">
          2º ano de Desenvolvimento de Sistemas + 1º ano de Marketing Digital · 2026
        </p>
      </div>
    </footer>
  );
}

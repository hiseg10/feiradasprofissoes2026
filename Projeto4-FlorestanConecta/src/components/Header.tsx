import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Florestan Conecta, página inicial">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-base font-black text-white">
            F
          </span>
          <span className="hidden text-sm font-black tracking-tight text-slate-900 sm:block">
            Florestan Conecta
          </span>
        </Link>
        <nav aria-label="Navegação principal" className="ml-auto flex items-center gap-1">
          <Link
            href="/"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-teal-50 hover:text-teal-700"
          >
            Explorar
          </Link>
          <Link
            href="/guia"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-teal-50 hover:text-teal-700"
          >
            Guia IA
          </Link>
        </nav>
      </div>
    </header>
  );
}

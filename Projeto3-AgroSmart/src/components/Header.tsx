import Link from "next/link";

const LINKS = [
  { href: "/", rotulo: "Painel" },
  { href: "/irrigacao", rotulo: "Irrigação" },
  { href: "/diagnostico", rotulo: "Diagnóstico IA" },
  { href: "/simulador", rotulo: "Simulador" },
  { href: "/sobre", rotulo: "Sobre" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="AgroSmart, página inicial">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-base font-black text-white">
            A
          </span>
          <span className="hidden text-sm font-black tracking-tight text-slate-900 sm:block">
            AgroSmart
          </span>
        </Link>
        <nav aria-label="Navegação principal" className="ml-auto flex items-center gap-1 overflow-x-auto">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
            >
              {link.rotulo}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

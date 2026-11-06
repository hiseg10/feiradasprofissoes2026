import Link from "next/link";

const LINKS = [
  { href: "/", rotulo: "Caixa" },
  { href: "/pedidos", rotulo: "Pedidos" },
  { href: "/admin", rotulo: "Gestão" },
  { href: "/cardapio", rotulo: "Cardápio" },
];

export default function Header() {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-brand-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Sabor do Florestan, caixa">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-sm font-black text-white">
            SF
          </span>
          <span className="hidden sm:block">
            <span className="block text-sm font-black tracking-tight text-ink">
              Sabor do Florestan
            </span>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-brand-700">
              cantina · feira 2026
            </span>
          </span>
        </Link>
        <nav aria-label="Navegação principal" className="ml-auto flex items-center gap-1 overflow-x-auto">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold text-amber-900/70 transition hover:bg-brand-50 hover:text-brand-800"
            >
              {link.rotulo}
            </Link>
          ))}
        </nav>
        <span className="hidden badge bg-brand-50 text-brand-700 lg:inline-flex">
          Pix · Cartão · Dinheiro
        </span>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { useLoja } from "./LojaProvider";

const LINKS = [
  { href: "/loja", rotulo: "Loja" },
  { href: "/descobrir", rotulo: "Descobrir" },
  { href: "/biblioteca", rotulo: "Biblioteca" },
  { href: "/lista-desejos", rotulo: "Desejos" },
  { href: "/perfil", rotulo: "Perfil" },
];

function IconeCarrinho() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="20" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconeCoracao() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6C19 16.5 12 21 12 21z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Header() {
  const { carrinho, desejos, pronto } = useLoja();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-steam-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Story Games, página inicial">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-steam-400 text-sm font-black text-steam-950">
            SG
          </span>
          <span className="hidden sm:block">
            <span className="block text-sm font-black tracking-tight text-white">STORY GAMES</span>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-steam-400">loja simulada</span>
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="ml-auto hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-steam-300"
            >
              {link.rotulo}
            </Link>
          ))}
        </nav>

        <form action="/loja" method="get" className="relative hidden w-56 md:block lg:ml-2">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">⌕</span>
          <input
            name="busca"
            className="input py-1.5 pl-8 text-xs"
            placeholder="Buscar na loja..."
            aria-label="Buscar na loja"
          />
        </form>

        <Link
          href="/lista-desejos"
          className="relative rounded-lg p-2 text-slate-300 transition hover:bg-white/5 hover:text-steam-300"
          aria-label="Lista de desejos"
        >
          <IconeCoracao />
          {pronto && desejos.length > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-steam-400 px-1 text-[10px] font-bold text-steam-950">
              {desejos.length}
            </span>
          ) : null}
        </Link>

        <Link
          href="/carrinho"
          className="relative rounded-lg p-2 text-slate-300 transition hover:bg-white/5 hover:text-steam-300"
          aria-label="Carrinho"
        >
          <IconeCarrinho />
          {pronto && carrinho.length > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-lime-400 px-1 text-[10px] font-bold text-steam-950">
              {carrinho.length}
            </span>
          ) : null}
        </Link>
      </div>

      <nav aria-label="Navegação mobile" className="flex gap-1 overflow-x-auto border-t border-white/5 px-3 py-2 lg:hidden">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-steam-300"
          >
            {link.rotulo}
          </Link>
        ))}
      </nav>
    </header>
  );
}

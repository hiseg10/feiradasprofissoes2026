import Link from "next/link";
import type { Usuario } from "@/lib/auth";
import { iniciais } from "@/lib/format";
import { NavPrincipal } from "./NavPrincipal";

export function Header({ usuario }: { usuario: Usuario }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-[11px] font-black text-white">
            CDQ
          </span>
          <span className="hidden sm:block">
            <span className="block text-sm font-bold leading-none text-slate-800">Classificados</span>
            <span className="block text-[11px] font-medium text-slate-400">Deus Quer</span>
          </span>
        </Link>

        <NavPrincipal admin={usuario.role === "admin"} />

        <div className="ml-auto flex items-center gap-2">
          <Link href="/anuncios/novo" className="btn-primary shrink-0 px-3 py-1.5 text-xs">
            + Anunciar
          </Link>
          <div className="hidden items-center gap-2 sm:flex">
            {usuario.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={usuario.avatar_url} alt={usuario.nome} className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                {iniciais(usuario.nome)}
              </span>
            )}
            <span className="max-w-[120px] truncate text-xs font-medium text-slate-600">{usuario.nome}</span>
          </div>
          <a href="/api/auth/logout" className="text-xs font-semibold text-slate-400 hover:text-slate-600">
            Sair
          </a>
        </div>
      </div>
    </header>
  );
}

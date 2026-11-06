"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavPrincipal({ admin }: { admin: boolean }) {
  const pathname = usePathname();

  const links = [
    { href: "/", rotulo: "Início" },
    { href: "/meus-anuncios", rotulo: "Meus anúncios" },
    ...(admin ? [{ href: "/admin", rotulo: "Admin" }] : []),
  ];

  return (
    <nav className="flex items-center gap-1 overflow-x-auto text-sm">
      {links.map((link) => {
        const ativo = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 rounded-lg px-2.5 py-1.5 font-medium transition ${
              ativo ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {link.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}

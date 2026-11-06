import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { exigirAprovado } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const usuario = await exigirAprovado();

  return (
    <div className="min-h-screen">
      <Header usuario={usuario} />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <footer className="mx-auto max-w-6xl px-4 pb-8 pt-4 text-center text-xs text-slate-400">
        Classificados do Deus Quer · feito pela comunidade
      </footer>
    </div>
  );
}

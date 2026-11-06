import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bolsa Fácil · Mercado financeiro para todos",
  description:
    "Projeto educativo da Feira das Profissões Florestan 2026: entenda renda fixa, ações, FIIs e converse com um curador de IA.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              <span className="font-semibold text-slate-700">Bolsa Fácil</span> · Feira das Profissões
              Florestan 2026 · 2º ano de Desenvolvimento de Sistemas
            </p>
            <p className="max-w-xl sm:text-right">
              Conteúdo educativo. Não é recomendação de investimento. Dados podem estar em modo
              demonstração.
            </p>
          </div>
          <div className="mx-auto max-w-6xl px-4 pb-6 text-xs text-slate-400">
            <Link href="/termos" className="hover:text-brand-700">
              Termos e privacidade
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}

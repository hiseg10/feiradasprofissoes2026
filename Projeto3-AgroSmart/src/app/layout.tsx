import type { Metadata } from "next";
import type { ReactNode } from "react";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgroSmart · Horta inteligente",
  description:
    "Projeto de robótica e IoT na indústria do agro: painel de sensores, irrigação automática e diagnóstico de plantas com IA.",
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
              <span className="font-semibold text-slate-700">AgroSmart</span> · Feira das Profissões
              Florestan 2026 · 2º ano de Desenvolvimento de Sistemas
            </p>
            <p className="max-w-xl sm:text-right">
              Projeto educativo. A análise por imagem não substitui a avaliação de um engenheiro
              agrônomo.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

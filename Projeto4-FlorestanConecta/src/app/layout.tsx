import type { Metadata } from "next";
import type { ReactNode } from "react";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Florestan Conecta · Deus Quer, Teresina – PI",
  description:
    "Guia digital do bairro Deus Quer, em Teresina – PI: comércio, serviços, cultura e lazer, com roteiros sugeridos por IA. Projeto da Feira das Profissões Florestan 2026.",
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
              <span className="font-semibold text-slate-700">Florestan Conecta</span> · Deus Quer,
              Teresina – PI · Feira das Profissões Florestan 2026
            </p>
            <p className="max-w-xl sm:text-right">
              Dados geográficos do OpenStreetMap (© colaboradores OSM). Horários e contatos devem
              ser confirmados com cada local.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Florestan Conecta · Turismo e comércio local",
  description:
    "Guia digital de turismo, comércio e cultura do bairro, com roteiros sugeridos por IA. Projeto da Feira das Profissões Florestan 2026.",
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
              <span className="font-semibold text-slate-700">Florestan Conecta</span> · Feira das
              Profissões Florestan 2026 · DS + Marketing Digital
            </p>
            <p className="max-w-xl sm:text-right">
              Os pontos cadastrados são dados de demonstração. Substitua pelos parceiros reais com
              autorização antes da feira.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

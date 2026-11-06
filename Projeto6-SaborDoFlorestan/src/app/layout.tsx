import type { Metadata } from "next";
import type { ReactNode } from "react";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sabor do Florestan · Cantina da feira",
  description:
    "PDV da cantina do 2º ano A: cardápio, carrinho, Pix, cartão, dinheiro, pedidos e gestão de vendas.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <footer className="no-print border-t border-brand-100 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-amber-900/60 sm:flex-row sm:items-center sm:justify-between">
            <p>
              <span className="font-semibold text-ink">Sabor do Florestan</span> · 2º ano A ·
              Feira das Profissões Florestan 2026
            </p>
            <p className="max-w-xl sm:text-right">
              Pix, cartão e dinheiro. O cartão é registrado após a maquininha; o Pix usa a chave
              configurada no <code className="rounded bg-brand-50 px-1">.env.local</code>.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

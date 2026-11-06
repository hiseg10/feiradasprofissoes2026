import type { Metadata } from "next";
import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { LojaProvider } from "@/components/LojaProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Story Games · Loja de jogos narrativos",
  description:
    "Loja fictícia de jogos narrativos inspirada na Steam. Catálogo, carrinho, biblioteca, lista de desejos e recomendações com IA. Projeto da Feira das Profissões Florestan 2026.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col">
        <LojaProvider>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </LojaProvider>
      </body>
    </html>
  );
}

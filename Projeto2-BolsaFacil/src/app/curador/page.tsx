import type { Metadata } from "next";
import ChatCurador from "@/components/ChatCurador";

export const metadata: Metadata = {
  title: "Curador com IA · Bolsa Fácil",
  description: "Converse com o curador educativo e entenda o mercado em linguagem simples.",
};

export default function CuradorPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="max-w-3xl">
        <p className="eyebrow">Curador com IA</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Pergunte como você perguntaria a um amigo
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          O curador recebe as cotações e os indicadores do painel e transforma isso em explicações
          simples. Ele não recomenda compra ou venda: ajuda você a entender.
        </p>
      </header>

      <div className="mt-7">
        <ChatCurador />
      </div>
    </main>
  );
}

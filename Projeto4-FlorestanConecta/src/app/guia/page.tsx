import type { Metadata } from "next";
import ChatGuia from "@/components/ChatGuia";

export const metadata: Metadata = {
  title: "Guia IA · Florestan Conecta",
  description: "Peça um roteiro e receba sugestões de lugares do bairro.",
};

export default function GuiaPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="max-w-3xl">
        <p className="eyebrow">Guia com IA</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Seu passeio começa com uma pergunta
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          O guia usa apenas os pontos cadastrados no projeto. Ele não inventa lugares e sempre
          lembra de confirmar horários. Experimente pedir um roteiro de 2 horas.
        </p>
      </header>

      <div className="mt-7">
        <ChatGuia />
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import Quiz from "@/components/Quiz";

export const metadata: Metadata = {
  title: "Quiz · Bolsa Fácil",
  description: "Teste seus conhecimentos sobre mercado financeiro.",
};

export default function QuizPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Quiz</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Quanto você já sabe sobre investimentos?
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Oito perguntas rápidas. A cada resposta você recebe uma explicação curta. No estande,
          vale desafiar um colega!
        </p>
      </header>

      <div className="mt-8">
        <Quiz />
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import RecommendationForm from "@/components/RecommendationForm";

export const metadata: Metadata = {
  title: "Descobrir · Story Games",
  description: "Recomendação de jogos narrativos com IA e filtros de perfil.",
};

export default function DescobrirPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="max-w-3xl">
        <p className="eyebrow">Descobrir</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Qual história combina com você?
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Conte o gênero, o tempo que você tem e o clima que procura. O curador usa o catálogo da
          loja para sugerir três jogos — com fallback local se a IA não estiver disponível.
        </p>
      </header>
      <div className="mt-6">
        <RecommendationForm />
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import DiagnosticoPlanta from "@/components/DiagnosticoPlanta";

export const metadata: Metadata = {
  title: "Diagnóstico IA · AgroSmart",
  description: "Envie uma foto da folha e receba um diagnóstico educativo com hipóteses e cuidados.",
};

export default function DiagnosticoPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="max-w-3xl">
        <p className="eyebrow">Diagnóstico com IA</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Sua planta pedindo ajuda?
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Envie uma foto da folha e a IA sugere possíveis pragas, doenças ou deficiências, com nível
          de confiança e próximos passos. O resultado é educativo e não substitui um agrônomo.
        </p>
      </header>

      <div className="mt-7">
        <DiagnosticoPlanta />
      </div>
    </main>
  );
}

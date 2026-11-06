import type { Metadata } from "next";
import ConfigIrrigacao from "@/components/ConfigIrrigacao";
import { obterEstado } from "@/lib/estufa";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Irrigação · AgroSmart",
  description: "Configure os limites de umidade e temperatura da horta inteligente.",
};

export default function IrrigacaoPage() {
  const estado = obterEstado();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="max-w-3xl">
        <p className="eyebrow">Irrigação</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          A água na medida certa
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Ajuste os limites que o sistema usa para decidir quando irrigar. A histerese evita que a
          bomba fique ligando e desligando a cada leitura.
        </p>
      </header>

      <div className="mt-7">
        <ConfigIrrigacao inicial={estado} />
      </div>
    </main>
  );
}

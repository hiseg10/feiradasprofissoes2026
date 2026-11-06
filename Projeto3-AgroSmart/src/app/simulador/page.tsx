import type { Metadata } from "next";
import SimuladorSensores from "@/components/SimuladorSensores";

export const metadata: Metadata = {
  title: "Simulador de sensores · AgroSmart",
  description: "Envie leituras de sensores manualmente para demonstrar a horta sem hardware.",
};

export default function SimuladorPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="max-w-3xl">
        <p className="eyebrow">Simulador</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Demonstre a horta sem o hardware
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Mova os controles e envie uma leitura. O painel reage na hora, aciona a bomba conforme os
          limites e mantém o histórico. É o mesmo endpoint que o ESP32 ou o Arduino usariam.
        </p>
      </header>

      <div className="mt-7">
        <SimuladorSensores />
      </div>
    </main>
  );
}

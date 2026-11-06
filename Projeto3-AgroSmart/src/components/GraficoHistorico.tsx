import type { Leitura } from "@/lib/types";

function pontos(valores: number[], minimo: number, maximo: number): string {
  if (valores.length < 2) return "0,38 100,38";
  const faixa = maximo - minimo || 1;
  return valores
    .map((valor, indice) => {
      const x = (indice / (valores.length - 1)) * 100;
      const y = 38 - ((valor - minimo) / faixa) * 34;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export default function GraficoHistorico({ leituras }: { leituras: Leitura[] }) {
  const ultimas = leituras.slice(-24);
  const temperatura = ultimas.map((leitura) => leitura.temperatura);
  const solo = ultimas.map((leitura) => leitura.umidadeSolo);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-terra-500" />
          Temperatura
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-brand-500" />
          Umidade do solo
        </span>
      </div>
      <svg
        viewBox="0 0 100 40"
        className="mt-3 h-40 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Gráfico das últimas 24 leituras de temperatura e umidade do solo"
      >
        <line x1="0" y1="38" x2="100" y2="38" stroke="#e2e8f0" strokeWidth="0.4" />
        <line x1="0" y1="21" x2="100" y2="21" stroke="#f1f5f9" strokeWidth="0.4" />
        <line x1="0" y1="4" x2="100" y2="4" stroke="#f1f5f9" strokeWidth="0.4" />
        <polyline
          points={pontos(temperatura, 10, 45)}
          fill="none"
          stroke="#d97706"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <polyline
          points={pontos(solo, 0, 100)}
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <p className="mt-1 text-[11px] text-slate-400">
        Eixo do tempo: últimas {ultimas.length} leituras · temperatura em °C · solo em %
      </p>
    </div>
  );
}

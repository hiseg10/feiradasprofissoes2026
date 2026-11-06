export default function GraficoLinha({
  valores,
  positivo = true,
}: {
  valores: number[];
  positivo?: boolean;
}) {
  const dados = valores.length >= 2 ? valores : [0, 0];
  const minimo = Math.min(...dados);
  const maximo = Math.max(...dados);
  const faixa = maximo - minimo || 1;
  const pontos = dados
    .map((valor, indice) => {
      const x = (indice / (dados.length - 1)) * 100;
      const y = 38 - ((valor - minimo) / faixa) * 34;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  const cor = positivo ? "#059669" : "#dc2626";

  return (
    <svg
      viewBox="0 0 100 40"
      className="h-10 w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polygon points={`0,40 ${pontos} 100,40`} fill={cor} opacity="0.08" />
      <polyline
        points={pontos}
        fill="none"
        stroke={cor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

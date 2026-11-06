import { precoFinal, type Jogo } from "@/lib/catalogo";
import { brl } from "@/lib/format";

export default function PriceTag({ jogo, grande = false }: { jogo: Jogo; grande?: boolean }) {
  const final = precoFinal(jogo);

  return (
    <div className={grande ? "text-right" : ""}>
      {jogo.desconto > 0 ? (
        <div className="flex items-center justify-end gap-2">
          <span className="badge bg-lime-300 text-steam-950">-{jogo.desconto}%</span>
          <span className="text-sm text-slate-500 line-through">{brl(jogo.precoCentavos)}</span>
        </div>
      ) : null}
      <p className={`font-black text-lime-300 ${grande ? "text-3xl" : "text-lg"}`}>
        {final === 0 ? "Grátis" : brl(final)}
      </p>
    </div>
  );
}

import type { Jogo } from "@/lib/catalogo";

const CENAS = [
  { emoji: "🌅", legenda: "Cena de abertura" },
  { emoji: "🌙", legenda: "Exploração noturna" },
  { emoji: "💬", legenda: "Diálogo com escolhas" },
];

export default function ScreenshotGallery({ jogo }: { jogo: Jogo }) {
  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-3">
        {CENAS.map((cena, indice) => (
          <div
            key={cena.legenda}
            className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-white/10"
            style={{
              background: `linear-gradient(${135 + indice * 35}deg, ${jogo.cores[0]}, ${jogo.cores[1]})`,
            }}
          >
            <span className="text-4xl opacity-80">{cena.emoji}</span>
            <span className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 py-1 text-[10px] text-white/80">
              {cena.legenda}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-1 text-[10px] text-slate-500">Capturas ilustrativas da simulação.</p>
    </div>
  );
}

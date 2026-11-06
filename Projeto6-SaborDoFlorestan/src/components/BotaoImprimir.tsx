"use client";

export default function BotaoImprimir() {
  return (
    <button type="button" onClick={() => window.print()} className="btn-secondary">
      Imprimir cardápio
    </button>
  );
}

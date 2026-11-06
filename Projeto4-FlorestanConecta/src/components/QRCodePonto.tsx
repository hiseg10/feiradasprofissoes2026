"use client";

import { useEffect, useRef } from "react";

export default function QRCodePonto({ nome }: { nome: string }) {
  const alvo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!alvo.current) return;
    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
      window.location.href,
    )}`;
    alvo.current.style.backgroundImage = `url("${qr}")`;
  }, []);

  return (
    <div className="card p-4 text-center">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        QR code deste ponto
      </p>
      <div
        ref={alvo}
        role="img"
        aria-label={`QR code da página de ${nome}`}
        className="mx-auto mt-3 h-[180px] w-[180px] rounded-xl bg-white bg-contain bg-center bg-no-repeat"
      />
      <p className="mt-2 text-[11px] text-slate-400">
        Aponte a câmera para abrir esta página
      </p>
      <p className="mt-1 text-[10px] text-slate-300">
        QR gerado pelo serviço api.qrserver.com
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useSession } from "@/components/SessionProvider";
import type { ModoOperacao } from "@/lib/types";

const MODOS: { valor: ModoOperacao; rotulo: string }[] = [
  { valor: "cliente", rotulo: "Cliente" },
  { valor: "caixa", rotulo: "Caixa" },
  { valor: "atendente", rotulo: "Atendente" },
  { valor: "operador", rotulo: "Operador" },
];

export default function ModoSelector() {
  const { sessao, definirModo, autenticarOperador, logout } = useSession();
  const [aberto, setAberto] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function autenticar() {
    setCarregando(true);
    setErro(null);
    const resultado = await autenticarOperador(codigo);
    if (resultado.ok) {
      setCodigo("");
      setAberto(false);
    } else {
      setErro(resultado.erro ?? "Código inválido.");
    }
    setCarregando(false);
  }

  function modoAtualLabel(): string {
    const item = MODOS.find((m) => m.valor === sessao.modo);
    return item ? item.rotulo : "Cliente";
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="badge bg-brand-50 text-brand-700 cursor-pointer"
      >
        {sessao.modo !== "cliente" && sessao.operadorNome ? sessao.operadorNome : modoAtualLabel()}
        {sessao.modo === "cliente" ? "" : " (funcionário)"}
      </button>

      {aberto && (
        <div className="absolute right-0 mt-2 w-72 rounded-lg border border-brand-200 bg-white p-3 shadow-xl z-50">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-900/50 mb-2">
            Modo de operação
          </p>

          <div className="flex flex-col gap-1.5 mb-2">
            {MODOS.map((modo) => (
              <button
                key={modo.valor}
                type="button"
                onClick={() => {
                  if (modo.valor === "cliente") {
                    logout();
                    setAberto(false);
                    return;
                  }
                  if (sessao.modo === "cliente") {
                    // Pedir código antes de ativar o modo funcionário
                    setAberto(true);
                    return;
                  }
                  definirModo(modo.valor);
                  setAberto(false);
                }}
                className={`text-left rounded px-2 py-1 text-xs ${
                  sessao.modo === modo.valor
                    ? "bg-brand-50 font-semibold text-brand-700"
                    : "text-amber-900/70 hover:bg-brand-50"
                }`}
              >
                {modo.rotulo}
              </button>
            ))}
          </div>

          {sessao.modo === "cliente" ? (
            <div className="border-t border-brand-100 pt-3 mt-2">
              <p className="text-[10px] text-amber-900/60 mb-1">
                Insira seu código de operação
              </p>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                  placeholder="Ex.: 2233"
                  className="input flex-1"
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={autenticar}
                  disabled={carregando}
                  className="btn-primary px-3 py-1.5 text-xs"
                >
                  {carregando ? "..." : "Entrar"}
                </button>
              </div>
              {erro && <p className="mt-1 text-[10px] text-red-600">{erro}</p>}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                logout();
                setAberto(false);
              }}
              className="text-[10px] text-red-600 hover:underline"
            >
              Sair (voltar para cliente)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
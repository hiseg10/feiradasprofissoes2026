"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Equipe, ModoOperacao, Sessao } from "@/lib/types";

type SessionContextType = {
  sessao: Sessao;
  carregado: boolean;
  definirModo: (modo: ModoOperacao) => void;
  autenticarOperador: (codigo: string) => Promise<{ ok: boolean; erro?: string }>;
  logout: () => void;
};

const SessionContext = createContext<SessionContextType | null>(null);

const SESSAO_KEY = "sabor-sessao";

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao>({
    modo: "cliente",
    operadorId: null,
    operadorNome: null,
    operadorCargo: null,
  });
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    let cancelado = false;
    const id = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(SESSAO_KEY);
        if (raw && !cancelado) {
          setSessao(JSON.parse(raw) as Sessao);
        }
      } catch {
        // Ignorar erro de parse
      } finally {
        if (!cancelado) setCarregado(true);
      }
    }, 0);
    return () => {
      cancelado = true;
      window.clearTimeout(id);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SESSAO_KEY, JSON.stringify(sessao));
    } catch {
      // Ignorar erro de armazenamento
    }
  }, [sessao]);

  const definirModo = useCallback((modo: ModoOperacao) => {
    setSessao((prev) => {
      if (modo === "cliente") {
        return {
          modo,
          operadorId: null,
          operadorNome: null,
          operadorCargo: null,
        };
      }
      // Se já tem um operador autenticado, manter
      if (prev.operadorId && prev.operadorCargo) {
        return { ...prev, modo };
      }
      // Caso contrário, pedir código
      return prev;
    });
  }, []);

  const autenticarOperador = useCallback(
    async (codigo: string): Promise<{ ok: boolean; erro?: string }> => {
      try {
        const resposta = await fetch("/api/admin/equipes", { cache: "no-store" });
        const equipes = (await resposta.json()) as Equipe[];
        const eq = equipes.find(
          (e) => e.codigoOperacao === codigo.trim() && e.ativo === 1,
        );
        if (!eq) {
          return { ok: false, erro: "Código inválido ou equipe inativa." };
        }
        setSessao({
          modo:
            eq.cargo === "caixa"
              ? "caixa"
              : eq.cargo === "atendente"
                ? "atendente"
                : "operador",
          operadorId: eq.id,
          operadorNome: eq.nome,
          operadorCargo: eq.cargo,
        });
        return { ok: true };
      } catch {
        return { ok: false, erro: "Falha ao autenticar." };
      }
    },
    [],
  );

  const logout = useCallback(() => {
    setSessao({
      modo: "cliente",
      operadorId: null,
      operadorNome: null,
      operadorCargo: null,
    });
  }, []);

  const valor = useMemo(
    () => ({ sessao, carregado, definirModo, autenticarOperador, logout }),
    [sessao, carregado, definirModo, autenticarOperador, logout],
  );

  return (
    <SessionContext.Provider value={valor}>{children}</SessionContext.Provider>
  );
}

export default SessionProvider;

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession deve ser usado dentro de SessionProvider");
  }
  return ctx;
}
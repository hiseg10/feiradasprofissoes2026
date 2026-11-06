"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { buscarJogo, type Jogo } from "@/lib/catalogo";

const CHAVE = "storygames:v1";

type Estado = {
  carrinho: string[];
  desejos: string[];
  biblioteca: string[];
  instalados: string[];
  nome: string;
};

const ESTADO_INICIAL: Estado = {
  carrinho: [],
  desejos: [],
  biblioteca: [],
  instalados: [],
  nome: "Jogador 2026",
};

type ContextoLoja = Estado & {
  pronto: boolean;
  itensCarrinho: Jogo[];
  subtotal: number;
  desconto: number;
  total: number;
  adicionarAoCarrinho: (slug: string) => void;
  removerDoCarrinho: (slug: string) => void;
  limparCarrinho: () => void;
  finalizarCompra: () => Jogo[];
  alternarDesejo: (slug: string) => void;
  instalar: (slug: string) => void;
  definirNome: (nome: string) => void;
  reiniciar: () => void;
  possui: (slug: string) => boolean;
  noCarrinho: (slug: string) => boolean;
  noDesejo: (slug: string) => boolean;
};

const LojaContext = createContext<ContextoLoja | null>(null);

function listaDeStrings(valor: unknown): string[] {
  if (!Array.isArray(valor)) return [];
  return valor.filter((item): item is string => typeof item === "string");
}

export function LojaProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>(ESTADO_INICIAL);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const salvo = window.localStorage.getItem(CHAVE);
        if (salvo) {
          const dados = JSON.parse(salvo) as Partial<Estado>;
          setEstado({
            carrinho: listaDeStrings(dados.carrinho),
            desejos: listaDeStrings(dados.desejos),
            biblioteca: listaDeStrings(dados.biblioteca),
            instalados: listaDeStrings(dados.instalados),
            nome:
              typeof dados.nome === "string" && dados.nome.trim()
                ? dados.nome
                : ESTADO_INICIAL.nome,
          });
        }
      } catch {
        // dados corrompidos ou localStorage bloqueado
      } finally {
        setPronto(true);
      }
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!pronto) return;
    try {
      window.localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch {
      // localStorage pode estar bloqueado
    }
  }, [estado, pronto]);

  const itensCarrinho = useMemo(
    () =>
      estado.carrinho
        .map((slug) => buscarJogo(slug))
        .filter((jogo): jogo is Jogo => Boolean(jogo)),
    [estado.carrinho],
  );

  const subtotal = useMemo(
    () => itensCarrinho.reduce((total, jogo) => total + jogo.precoCentavos, 0),
    [itensCarrinho],
  );

  const desconto = useMemo(
    () =>
      itensCarrinho.reduce(
        (total, jogo) =>
          total + Math.round((jogo.precoCentavos * jogo.desconto) / 100),
        0,
      ),
    [itensCarrinho],
  );

  const total = subtotal - desconto;

  function adicionarAoCarrinho(slug: string) {
    setEstado((atual) => {
      if (atual.biblioteca.includes(slug) || atual.carrinho.includes(slug)) {
        return atual;
      }
      return { ...atual, carrinho: [...atual.carrinho, slug] };
    });
  }

  function removerDoCarrinho(slug: string) {
    setEstado((atual) => ({
      ...atual,
      carrinho: atual.carrinho.filter((item) => item !== slug),
    }));
  }

  function limparCarrinho() {
    setEstado((atual) => ({ ...atual, carrinho: [] }));
  }

  function finalizarCompra(): Jogo[] {
    const comprados = estado.carrinho
      .map((slug) => buscarJogo(slug))
      .filter((jogo): jogo is Jogo => Boolean(jogo));

    if (!comprados.length) return [];

    setEstado((atual) => ({
      ...atual,
      biblioteca: Array.from(new Set([...atual.biblioteca, ...atual.carrinho])),
      carrinho: [],
      desejos: atual.desejos.filter((slug) => !atual.carrinho.includes(slug)),
    }));

    return comprados;
  }

  function alternarDesejo(slug: string) {
    setEstado((atual) => ({
      ...atual,
      desejos: atual.desejos.includes(slug)
        ? atual.desejos.filter((item) => item !== slug)
        : [...atual.desejos, slug],
    }));
  }

  function instalar(slug: string) {
    setEstado((atual) => ({
      ...atual,
      instalados: atual.instalados.includes(slug)
        ? atual.instalados.filter((item) => item !== slug)
        : [...atual.instalados, slug],
    }));
  }

  function definirNome(nome: string) {
    setEstado((atual) => ({
      ...atual,
      nome: nome.trim() || ESTADO_INICIAL.nome,
    }));
  }

  function reiniciar() {
    setEstado(ESTADO_INICIAL);
    try {
      window.localStorage.removeItem(CHAVE);
    } catch {
      // ignora
    }
  }

  const valor: ContextoLoja = {
    ...estado,
    pronto,
    itensCarrinho,
    subtotal,
    desconto,
    total,
    adicionarAoCarrinho,
    removerDoCarrinho,
    limparCarrinho,
    finalizarCompra,
    alternarDesejo,
    instalar,
    definirNome,
    reiniciar,
    possui: (slug) => estado.biblioteca.includes(slug),
    noCarrinho: (slug) => estado.carrinho.includes(slug),
    noDesejo: (slug) => estado.desejos.includes(slug),
  };

  return <LojaContext.Provider value={valor}>{children}</LojaContext.Provider>;
}

export function useLoja(): ContextoLoja {
  const contexto = useContext(LojaContext);
  if (!contexto) {
    throw new Error("useLoja precisa estar dentro de LojaProvider");
  }
  return contexto;
}

import type { EstadoEstufa, Leitura, Limites, ModoIrrigacao } from "./types";

export const LIMITES_PADRAO: Limites = {
  umidadeSoloMin: 35,
  umidadeSoloMax: 70,
  temperaturaMax: 34,
};

type Armazenamento = {
  estado: EstadoEstufa;
};

const globalAgro = globalThis as typeof globalThis & {
  __agrosmart?: Armazenamento;
};

function limitar(valor: number, minimo: number, maximo: number): number {
  return Math.min(maximo, Math.max(minimo, valor));
}

function arredondar(valor: number, casas: number): number {
  const fator = 10 ** casas;
  return Math.round(valor * fator) / fator;
}

function criarLeiturasIniciais(): Leitura[] {
  const agora = Date.now();
  return Array.from({ length: 24 }, (_, indice) => {
    const horasAtras = 23 - indice;
    const temperatura = 22 + Math.sin(indice / 3.2) * 6 + 1.2;
    const umidadeSolo = 54 - Math.sin(indice / 4) * 13 - (indice > 16 ? 8 : 0);
    const umidadeAr = 66 - Math.sin(indice / 5) * 11;
    const luz = Math.max(0, Math.sin((indice / 23) * Math.PI) * 920);
    return {
      id: indice + 1,
      temperatura: arredondar(temperatura, 1),
      umidadeAr: arredondar(umidadeAr, 0),
      umidadeSolo: arredondar(Math.max(18, umidadeSolo), 0),
      luz: arredondar(luz, 0),
      bombaLigada: false,
      criadaEm: new Date(agora - horasAtras * 60 * 60 * 1000).toISOString(),
    };
  });
}

function criarEstado(): EstadoEstufa {
  const leituras = criarLeiturasIniciais();
  const ultima = leituras[leituras.length - 1];
  return {
    leituras,
    bombaLigada: false,
    modo: "auto",
    limites: { ...LIMITES_PADRAO },
    atualizadoEm: ultima.criadaEm,
    fonte: "simulacao",
  };
}

function armazenamento(): Armazenamento {
  if (!globalAgro.__agrosmart) {
    globalAgro.__agrosmart = { estado: criarEstado() };
  }
  return globalAgro.__agrosmart;
}

export function obterEstado(): EstadoEstufa {
  return armazenamento().estado;
}

function decidirBomba(
  umidadeSolo: number,
  modo: ModoIrrigacao,
  ligadaAtual: boolean,
  limites: Limites,
): boolean {
  if (modo === "manual") return ligadaAtual;
  if (umidadeSolo < limites.umidadeSoloMin) return true;
  if (umidadeSolo > limites.umidadeSoloMin + 8) return false;
  return ligadaAtual;
}

export type DadosLeitura = {
  temperatura: number;
  umidadeAr: number;
  umidadeSolo: number;
  luz: number;
  bombaLigada?: boolean;
  fonte?: "simulacao" | "esp32" | "arduino";
};

export function registrarLeitura(dados: DadosLeitura): EstadoEstufa {
  const estado = armazenamento().estado;
  const ultima = estado.leituras[estado.leituras.length - 1];
  const proximoId = (ultima?.id ?? 0) + 1;

  const bomba =
    typeof dados.bombaLigada === "boolean"
      ? dados.bombaLigada
      : decidirBomba(dados.umidadeSolo, estado.modo, estado.bombaLigada, estado.limites);

  const leitura: Leitura = {
    id: proximoId,
    temperatura: arredondar(limitar(dados.temperatura, -10, 60), 1),
    umidadeAr: arredondar(limitar(dados.umidadeAr, 0, 100), 0),
    umidadeSolo: arredondar(limitar(dados.umidadeSolo, 0, 100), 0),
    luz: arredondar(limitar(dados.luz, 0, 100000), 0),
    bombaLigada: bomba,
    criadaEm: new Date().toISOString(),
  };

  estado.leituras = [...estado.leituras, leitura].slice(-120);
  estado.bombaLigada = bomba;
  estado.atualizadoEm = leitura.criadaEm;
  estado.fonte = dados.fonte ?? "simulacao";

  return estado;
}

export function alterarBomba(acao: "ligar" | "desligar" | "auto"): EstadoEstufa {
  const estado = armazenamento().estado;

  if (acao === "auto") {
    estado.modo = "auto";
    const ultima = estado.leituras[estado.leituras.length - 1];
    if (ultima) {
      estado.bombaLigada = decidirBomba(
        ultima.umidadeSolo,
        "auto",
        estado.bombaLigada,
        estado.limites,
      );
    }
  } else {
    estado.modo = "manual";
    estado.bombaLigada = acao === "ligar";
  }

  estado.atualizadoEm = new Date().toISOString();
  return estado;
}

export function atualizarLimites(parcial: Partial<Limites>): EstadoEstufa {
  const estado = armazenamento().estado;

  const minimo = limitar(
    parcial.umidadeSoloMin ?? estado.limites.umidadeSoloMin,
    0,
    90,
  );
  const maximo = limitar(
    parcial.umidadeSoloMax ?? estado.limites.umidadeSoloMax,
    minimo + 5,
    100,
  );
  const temperaturaMaxima = limitar(
    parcial.temperaturaMax ?? estado.limites.temperaturaMax,
    10,
    55,
  );

  estado.limites = {
    umidadeSoloMin: Math.round(minimo),
    umidadeSoloMax: Math.round(maximo),
    temperaturaMax: Math.round(temperaturaMaxima),
  };

  if (estado.modo === "auto") {
    const ultima = estado.leituras[estado.leituras.length - 1];
    if (ultima) {
      estado.bombaLigada = decidirBomba(
        ultima.umidadeSolo,
        "auto",
        estado.bombaLigada,
        estado.limites,
      );
    }
  }

  estado.atualizadoEm = new Date().toISOString();
  return estado;
}

export function simularLeitura(): EstadoEstufa {
  const estado = armazenamento().estado;
  const ultima = estado.leituras[estado.leituras.length - 1];

  const temperaturaBase = ultima?.temperatura ?? 26;
  const soloBase = ultima?.umidadeSolo ?? 45;
  const arBase = ultima?.umidadeAr ?? 62;
  const luzBase = ultima?.luz ?? 500;

  const variacaoSolo = estado.bombaLigada ? 2.6 : -1.4;

  return registrarLeitura({
    temperatura: temperaturaBase + (Math.random() - 0.5) * 2.2,
    umidadeAr: limitar(arBase + (Math.random() - 0.5) * 6, 20, 95),
    umidadeSolo: limitar(soloBase + variacaoSolo + (Math.random() - 0.5) * 2, 8, 98),
    luz: limitar(luzBase + (Math.random() - 0.5) * 180, 0, 1200),
    fonte: "simulacao",
  });
}

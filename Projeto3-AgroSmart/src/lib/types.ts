export type Leitura = {
  id: number;
  temperatura: number;
  umidadeAr: number;
  umidadeSolo: number;
  luz: number;
  bombaLigada: boolean;
  criadaEm: string;
};

export type Limites = {
  umidadeSoloMin: number;
  umidadeSoloMax: number;
  temperaturaMax: number;
};

export type ModoIrrigacao = "auto" | "manual";

export type FonteEstufa = "simulacao" | "esp32" | "arduino";

export type EstadoEstufa = {
  leituras: Leitura[];
  bombaLigada: boolean;
  modo: ModoIrrigacao;
  limites: Limites;
  atualizadoEm: string;
  fonte: FonteEstufa;
};

export type RespostaIA = {
  resposta: string;
  provedor: string;
  modelo: string;
  usadoFallback: boolean;
};

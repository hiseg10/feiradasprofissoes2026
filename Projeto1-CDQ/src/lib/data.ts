import { db } from "./db";
import type { StatusAnuncio } from "./constantes";

export type Anuncio = {
  id: number;
  usuario_id: number;
  titulo: string;
  descricao: string;
  preco_centavos: number;
  categoria: string;
  condicao: string;
  bairro: string | null;
  whatsapp: string | null;
  fotos: string;
  status: StatusAnuncio;
  motivo_rejeicao: string | null;
  impulsionado_ate: string | null;
  criado_em: string;
  atualizado_em: string;
};

export type AnuncioComAutor = Anuncio & {
  autor_nome: string;
  autor_avatar: string | null;
  autor_criado_em: string;
  autor_email: string;
};

export type Impulsionamento = {
  id: number;
  anuncio_id: number;
  usuario_id: number;
  dias: number;
  valor_centavos: number;
  status: "pendente" | "pago" | "cancelado";
  criado_em: string;
  pago_em: string | null;
  anuncio_titulo: string;
  usuario_nome: string;
  usuario_email: string;
};

export type UsuarioAdmin = {
  id: number;
  email: string;
  nome: string;
  avatar_url: string | null;
  role: "admin" | "usuario";
  status: "pendente" | "aprovado" | "bloqueado";
  criado_em: string;
  aprovado_em: string | null;
  total_anuncios: number;
};

const AUTOR = `u.nome AS autor_nome, u.avatar_url AS autor_avatar,
  u.criado_em AS autor_criado_em, u.email AS autor_email`;

export async function listarAnuncios(q = "", categoria = ""): Promise<AnuncioComAutor[]> {
  const client = await db();
  const termo = `%${q.trim()}%`;
  const resultado = await client.execute({
    sql: `SELECT a.*, ${AUTOR}
            FROM anuncios a
            JOIN usuarios u ON u.id = a.usuario_id
           WHERE a.status = 'aprovado'
             AND (? = '' OR a.categoria = ?)
             AND (? = '%%' OR a.titulo LIKE ? OR a.descricao LIKE ?)
           ORDER BY CASE WHEN a.impulsionado_ate IS NOT NULL AND a.impulsionado_ate > datetime('now') THEN 0 ELSE 1 END,
                    a.criado_em DESC
           LIMIT 60`,
    args: [categoria, categoria, termo, termo, termo],
  });
  return resultado.rows as unknown as AnuncioComAutor[];
}

export async function obterAnuncio(id: number): Promise<AnuncioComAutor | null> {
  const client = await db();
  const resultado = await client.execute({
    sql: `SELECT a.*, ${AUTOR}
            FROM anuncios a
            JOIN usuarios u ON u.id = a.usuario_id
           WHERE a.id = ?`,
    args: [id],
  });
  return (resultado.rows[0] as unknown as AnuncioComAutor) ?? null;
}

export async function listarMeusAnuncios(usuarioId: number): Promise<AnuncioComAutor[]> {
  const client = await db();
  const resultado = await client.execute({
    sql: `SELECT a.*, ${AUTOR}
            FROM anuncios a
            JOIN usuarios u ON u.id = a.usuario_id
           WHERE a.usuario_id = ?
           ORDER BY a.criado_em DESC`,
    args: [usuarioId],
  });
  return resultado.rows as unknown as AnuncioComAutor[];
}

export async function listarAnunciosAdmin(status = ""): Promise<AnuncioComAutor[]> {
  const client = await db();
  const resultado = await client.execute({
    sql: `SELECT a.*, ${AUTOR}
            FROM anuncios a
            JOIN usuarios u ON u.id = a.usuario_id
           WHERE (? = '' OR a.status = ?)
           ORDER BY CASE a.status WHEN 'pendente' THEN 0 ELSE 1 END, a.criado_em DESC
           LIMIT 200`,
    args: [status, status],
  });
  return resultado.rows as unknown as AnuncioComAutor[];
}

export async function listarUsuarios(): Promise<UsuarioAdmin[]> {
  const client = await db();
  const resultado = await client.execute(
    `SELECT u.id, u.email, u.nome, u.avatar_url, u.role, u.status, u.criado_em, u.aprovado_em,
            (SELECT COUNT(*) FROM anuncios a WHERE a.usuario_id = u.id) AS total_anuncios
       FROM usuarios u
      ORDER BY CASE u.status WHEN 'pendente' THEN 0 WHEN 'aprovado' THEN 1 ELSE 2 END,
               u.criado_em DESC`,
  );
  return resultado.rows as unknown as UsuarioAdmin[];
}

export async function listarImpulsionamentosPendentes(): Promise<Impulsionamento[]> {
  const client = await db();
  const resultado = await client.execute(
    `SELECT i.*, a.titulo AS anuncio_titulo, u.nome AS usuario_nome, u.email AS usuario_email
       FROM impulsionamentos i
       JOIN anuncios a ON a.id = i.anuncio_id
       JOIN usuarios u ON u.id = i.usuario_id
      WHERE i.status = 'pendente'
      ORDER BY i.criado_em ASC`,
  );
  return resultado.rows as unknown as Impulsionamento[];
}

export async function resumoAdmin(): Promise<{
  usuariosPendentes: number;
  anunciosPendentes: number;
  impulsionamentosPendentes: number;
  usuariosTotal: number;
  anunciosTotal: number;
}> {
  const client = await db();
  const resultado = await client.execute(`SELECT
    (SELECT COUNT(*) FROM usuarios WHERE status = 'pendente') AS usuariosPendentes,
    (SELECT COUNT(*) FROM anuncios WHERE status = 'pendente') AS anunciosPendentes,
    (SELECT COUNT(*) FROM impulsionamentos WHERE status = 'pendente') AS impulsionamentosPendentes,
    (SELECT COUNT(*) FROM usuarios) AS usuariosTotal,
    (SELECT COUNT(*) FROM anuncios) AS anunciosTotal`);
  const linha = resultado.rows[0] as unknown as Record<string, number>;
  return {
    usuariosPendentes: Number(linha.usuariosPendentes),
    anunciosPendentes: Number(linha.anunciosPendentes),
    impulsionamentosPendentes: Number(linha.impulsionamentosPendentes),
    usuariosTotal: Number(linha.usuariosTotal),
    anunciosTotal: Number(linha.anunciosTotal),
  };
}

export async function getConfigInt(chave: string, padrao: number): Promise<number> {
  const client = await db();
  const resultado = await client.execute({ sql: "SELECT valor FROM config WHERE chave = ?", args: [chave] });
  const valor = resultado.rows[0] ? Number(resultado.rows[0].valor) : NaN;
  return Number.isFinite(valor) ? valor : padrao;
}

export async function getPrecoDiaCentavos(): Promise<number> {
  return getConfigInt("impulsionamento_preco_dia", 500);
}

export function fotosDe(anuncio: Pick<Anuncio, "fotos">): string[] {
  try {
    const lista = JSON.parse(anuncio.fotos);
    return Array.isArray(lista) ? lista.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function estaImpulsionado(anuncio: Pick<Anuncio, "impulsionado_ate">): boolean {
  if (!anuncio.impulsionado_ate) return false;
  const data = new Date(anuncio.impulsionado_ate.replace(" ", "T") + "Z");
  return data.getTime() > Date.now();
}

export async function resumoAnuncioAdmin(anuncioId: number) {
  const client = await db();
  const resultado = await client.execute({
    sql: "SELECT status FROM anuncios WHERE id = ?",
    args: [anuncioId],
  });
  return resultado.rows[0] as unknown as { status: StatusAnuncio } | undefined;
}

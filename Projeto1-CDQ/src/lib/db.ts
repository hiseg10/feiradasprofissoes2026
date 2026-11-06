import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createClient, type Client } from "@libsql/client";

const url = process.env.DATABASE_URL ?? "file:./data/cdq.db";
const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;

type Global = typeof globalThis & {
  __cdqClient?: Client;
  __cdqReady?: Promise<void>;
};

const g = globalThis as Global;

export function getClient(): Client {
  if (!g.__cdqClient) {
    if (process.env.VERCEL && url.startsWith("file:")) {
      throw new Error(
        "Configure DATABASE_URL do Turso (libsql://...) na Vercel. O banco em arquivo não persiste na nuvem.",
      );
    }
    if (url.startsWith("file:")) {
      mkdirSync(dirname(url.slice("file:".length)), { recursive: true });
    }
    g.__cdqClient = createClient({ url, authToken });
  }
  return g.__cdqClient;
}

const DDL = [
  `CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    google_id TEXT UNIQUE,
    email TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'usuario',
    status TEXT NOT NULL DEFAULT 'pendente',
    criado_em TEXT NOT NULL DEFAULT (datetime('now')),
    aprovado_em TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS anuncios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    preco_centavos INTEGER NOT NULL DEFAULT 0,
    categoria TEXT NOT NULL DEFAULT 'outros',
    condicao TEXT NOT NULL DEFAULT 'usado',
    bairro TEXT,
    whatsapp TEXT,
    fotos TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'pendente',
    motivo_rejeicao TEXT,
    impulsionado_ate TEXT,
    criado_em TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_anuncios_status ON anuncios(status)`,
  `CREATE INDEX IF NOT EXISTS idx_anuncios_usuario ON anuncios(usuario_id)`,
  `CREATE TABLE IF NOT EXISTS impulsionamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    anuncio_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    dias INTEGER NOT NULL,
    valor_centavos INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente',
    criado_em TEXT NOT NULL DEFAULT (datetime('now')),
    pago_em TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS config (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL
  )`,
];

async function definirConfigSeAusente(chave: string, valor: string): Promise<void> {
  await getClient().execute({
    sql: "INSERT OR IGNORE INTO config (chave, valor) VALUES (?, ?)",
    args: [chave, valor],
  });
}

async function preparar(): Promise<void> {
  const client = getClient();
  for (const sql of DDL) {
    await client.execute(sql);
  }

  await definirConfigSeAusente("impulsionamento_preco_dia", "500");

  const adminEmail =
    process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)[0] ??
    "admin@cdq.local";

  if (process.env.DEV_LOGIN === "1") {
    await client.execute({
      sql: `INSERT INTO usuarios (google_id, email, nome, role, status, aprovado_em)
            VALUES (?, ?, ?, 'admin', 'aprovado', datetime('now'))
            ON CONFLICT(email) DO UPDATE SET role = 'admin', status = 'aprovado'`,
      args: [`dev:${adminEmail}`, adminEmail, "Equipe CDQ"],
    });
  }

  if (process.env.SEED_DEMO === "1") {
    const { rows } = await client.execute("SELECT COUNT(*) AS total FROM anuncios");
    if (Number(rows[0].total) === 0) {
      await client.execute({
        sql: `INSERT INTO usuarios (email, nome, role, status, aprovado_em)
              VALUES ('ana@cdq.local', 'Ana Souza', 'usuario', 'aprovado', datetime('now'))`,
      });
      await client.execute({
        sql: `INSERT INTO usuarios (email, nome, role, status, aprovado_em)
              VALUES ('carlos@cdq.local', 'Carlos Lima', 'usuario', 'aprovado', datetime('now'))`,
      });

      const ana = (await client.execute("SELECT id FROM usuarios WHERE email = 'ana@cdq.local'")).rows[0].id;
      const carlos = (await client.execute("SELECT id FROM usuarios WHERE email = 'carlos@cdq.local'")).rows[0].id;

      const demo = [
        {
          usuario_id: ana,
          titulo: "Bicicleta aro 26 em bom estado",
          descricao: "Bicicleta revisada, freios novos e pneus em bom estado. Ideal para ir ao trabalho e à escola.",
          preco: 45000,
          categoria: "esportes",
          condicao: "usado",
          whatsapp: "86999990001",
          status: "aprovado",
          destaque: true,
        },
        {
          usuario_id: carlos,
          titulo: "iPhone 11 64GB",
          descricao: "Aparelho com 64GB, bateria em 84%. Acompanha capinha e carregador. Sem detalhes na tela.",
          preco: 180000,
          categoria: "celulares",
          condicao: "usado",
          whatsapp: "86999990002",
          status: "aprovado",
          destaque: false,
        },
        {
          usuario_id: ana,
          titulo: "Geladeira Frost Free 340L",
          descricao: "Geladeira funcionando perfeitamente, duas portas, ótimo estado de conservação.",
          preco: 120000,
          categoria: "eletrodomesticos",
          condicao: "usado",
          whatsapp: "86999990001",
          status: "aprovado",
          destaque: false,
        },
        {
          usuario_id: ana,
          titulo: "Aulas de reforço escolar",
          descricao: "Reforço de matemática e português para fundamental e médio. Aulas em casa ou online.",
          preco: 8000,
          categoria: "servicos",
          condicao: "nao_aplicavel",
          whatsapp: "86999990001",
          status: "aprovado",
          destaque: false,
        },
        {
          usuario_id: carlos,
          titulo: "Mesa de escritório com gavetas",
          descricao: "Mesa usada, boa estrutura, com três gavetas. Retirada no bairro.",
          preco: 25000,
          categoria: "moveis",
          condicao: "usado",
          whatsapp: "86999990002",
          status: "pendente",
          destaque: false,
        },
      ];

      for (const item of demo) {
        if (item.destaque) {
          await client.execute({
            sql: `INSERT INTO anuncios (usuario_id, titulo, descricao, preco_centavos, categoria, condicao, bairro, whatsapp, status, impulsionado_ate)
                  VALUES (?, ?, ?, ?, ?, ?, 'Deus Quer', ?, ?, datetime('now', '+7 days'))`,
            args: [item.usuario_id, item.titulo, item.descricao, item.preco, item.categoria, item.condicao, item.whatsapp, item.status],
          });
        } else {
          await client.execute({
            sql: `INSERT INTO anuncios (usuario_id, titulo, descricao, preco_centavos, categoria, condicao, bairro, whatsapp, status)
                  VALUES (?, ?, ?, ?, ?, ?, 'Deus Quer', ?, ?)`,
            args: [item.usuario_id, item.titulo, item.descricao, item.preco, item.categoria, item.condicao, item.whatsapp, item.status],
          });
        }
      }
    }
  }
}

export async function db(): Promise<Client> {
  if (!g.__cdqReady) {
    g.__cdqReady = preparar().catch((erro) => {
      g.__cdqReady = undefined;
      throw erro;
    });
  }
  await g.__cdqReady;
  return getClient();
}


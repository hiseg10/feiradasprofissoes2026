import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createClient, type Client } from "@libsql/client";
import { PRODUTOS_SEED } from "./seed";

const url = process.env.DATABASE_URL ?? "file:./data/sabor.db";
const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;

type Global = typeof globalThis & {
  __saborClient?: Client;
  __saborReady?: Promise<void>;
};

const g = globalThis as Global;

export function getClient(): Client {
  if (!g.__saborClient) {
    if (process.env.VERCEL && url.startsWith("file:")) {
      throw new Error(
        "Configure DATABASE_URL do Turso (libsql://...) na Vercel. O banco em arquivo não persiste na nuvem.",
      );
    }
    if (url.startsWith("file:")) {
      mkdirSync(dirname(url.slice("file:".length)), { recursive: true });
    }
    g.__saborClient = createClient({ url, authToken });
  }
  return g.__saborClient;
}

const DDL = [
  `CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    categoria TEXT NOT NULL,
    preco_centavos INTEGER NOT NULL,
    estoque INTEGER NOT NULL DEFAULT 0,
    ativo INTEGER NOT NULL DEFAULT 1,
    emoji TEXT NOT NULL DEFAULT '🍽️'
  )`,
  `CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente TEXT,
    total_centavos INTEGER NOT NULL,
    forma_pagamento TEXT NOT NULL,
    detalhe_pagamento TEXT,
    valor_recebido_centavos INTEGER NOT NULL,
    troco_centavos INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'novo',
    pago INTEGER NOT NULL DEFAULT 0,
    criado_em TEXT NOT NULL,
    atualizado_em TEXT NOT NULL,
    equipe_id INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS pedido_itens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    emoji TEXT NOT NULL DEFAULT '🍽️',
    preco_centavos INTEGER NOT NULL,
    quantidade INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS equipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cargo TEXT NOT NULL,
    ativo INTEGER NOT NULL DEFAULT 1,
    criado_em TEXT NOT NULL,
    atualizado_em TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status)`,
  `CREATE INDEX IF NOT EXISTS idx_pedido_itens_pedido ON pedido_itens(pedido_id)`,
  `CREATE INDEX IF NOT EXISTS idx_equipes_cargo ON equipes(cargo)`,
];

async function preparar(): Promise<void> {
  const client = getClient();

  for (const sql of DDL) {
    await client.execute(sql);
  }

  // Adicionar coluna equipe_id se não existir
  try {
    await client.execute(`ALTER TABLE pedidos ADD COLUMN equipe_id INTEGER`);
  } catch {
    // Ignorar erro (coluna já existe)
  }

  // Adicionar coluna codigo_operacao à tabela equipes se não existir
  try {
    await client.execute(`ALTER TABLE equipes ADD COLUMN codigo_operacao TEXT`);
  } catch {
    // Ignorar erro (coluna já existe)
  }

  // Adicionar coluna pago à tabela pedidos se não existir
  try {
    await client.execute(
      `ALTER TABLE pedidos ADD COLUMN pago INTEGER NOT NULL DEFAULT 0`,
    );
  } catch {
    // Ignorar erro (coluna já existe)
  }

  // Migrar status 'pago' para 'novo'
  try {
    await client.execute(
      "UPDATE pedidos SET status = 'novo' WHERE status = 'pago'",
    );
  } catch {
    // Ignorar erro
  }

  // Criar caixa padrão (Admin) se não houver nenhuma equipe
  const { rows: equipesRows } = await client.execute(
    "SELECT COUNT(*) AS total FROM equipes",
  );
  const totalEquipes = Number(equipesRows[0]?.total ?? 0);
  if (totalEquipes === 0) {
    const agora = new Date().toISOString();
    await client.execute({
      sql: `INSERT INTO equipes (nome, cargo, codigo_operacao, ativo, criado_em, atualizado_em)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: ["Admin", "caixa", "4179", 1, agora, agora],
    });
  }

  const { rows } = await client.execute(
    "SELECT COUNT(*) AS total FROM produtos",
  );
  const total = Number(rows[0]?.total ?? 0);

  if (total === 0) {
    for (const produto of PRODUTOS_SEED) {
      await client.execute({
        sql: `INSERT INTO produtos (nome, descricao, categoria, preco_centavos, estoque, ativo, emoji)
              VALUES (?, ?, ?, ?, ?, 1, ?)`,
        args: [
          produto.nome,
          produto.descricao,
          produto.categoria,
          produto.precoCentavos,
          produto.estoque,
          produto.emoji,
        ],
      });
    }
  }
}

export async function db(): Promise<Client> {
  if (!g.__saborReady) {
    g.__saborReady = preparar().catch((erro) => {
      g.__saborReady = undefined;
      throw erro;
    });
  }
  await g.__saborReady;
  return getClient();
}

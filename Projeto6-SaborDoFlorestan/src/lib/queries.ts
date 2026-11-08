import type { Client } from "@libsql/client";
import { db } from "./db";
import type {
  Cargo,
  Categoria,
  Equipe,
  FormaPagamento,
  ItemPedido,
  Pedido,
  Produto,
  Resumo,
  StatusPedido,
} from "./types";

type Executor = Pick<Client, "execute">;

const CATEGORIAS_VALIDAS: Categoria[] = [
  "Salgados",
  "Doces",
  "Bebidas",
  "Combos",
];

const FORMAS_VALIDAS: FormaPagamento[] = ["pix", "cartao", "dinheiro"];

const CARGOS_VALIDOS: Cargo[] = ["caixa", "atendente", "garçon", "operador_cozinha"];

const STATUS_VALIDOS: StatusPedido[] = [
  "novo",
  "preparando",
  "pronto",
  "entregue",
  "cancelado",
];

function texto(valor: unknown, padrao = ""): string {
  return typeof valor === "string" ? valor.trim() : padrao;
}

function inteiro(valor: unknown, padrao = 0): number {
  const numero = typeof valor === "number" ? valor : Number(valor);
  return Number.isFinite(numero) ? Math.trunc(numero) : padrao;
}

function mapProduto(row: Record<string, unknown>): Produto {
  return {
    id: inteiro(row.id),
    nome: texto(row.nome),
    descricao: typeof row.descricao === "string" ? row.descricao : null,
    categoria: (texto(row.categoria) as Categoria) || "Salgados",
    precoCentavos: inteiro(row.preco_centavos),
    estoque: inteiro(row.estoque),
    ativo: inteiro(row.ativo),
    emoji: texto(row.emoji, "🍽️") || "🍽️",
  };
}

function mapItem(row: Record<string, unknown>): ItemPedido {
  return {
    produtoId: inteiro(row.produto_id),
    nome: texto(row.nome),
    emoji: texto(row.emoji, "🍽️") || "🍽️",
    precoCentavos: inteiro(row.preco_centavos),
    quantidade: inteiro(row.quantidade),
  };
}

function mapEquipe(row: Record<string, unknown>): Equipe {
  return {
    id: inteiro(row.id),
    nome: texto(row.nome),
    cargo: (texto(row.cargo) as Cargo) || "caixa",
    codigoOperacao: texto(row.codigo_operacao) || null,
    ativo: inteiro(row.ativo),
    criadoEm: texto(row.criado_em),
    atualizadoEm: texto(row.atualizado_em),
  };
}

function mapPedido(
  row: Record<string, unknown>,
  itens: ItemPedido[],
): Pedido {
  const id = inteiro(row.id);
  return {
    id,
    numero: String(id).padStart(3, "0"),
    cliente:
      typeof row.cliente === "string" && row.cliente.trim()
        ? row.cliente
        : null,
    totalCentavos: inteiro(row.total_centavos),
    formaPagamento:
      (texto(row.forma_pagamento) as FormaPagamento) || "dinheiro",
    detalhePagamento:
      typeof row.detalhe_pagamento === "string"
        ? row.detalhe_pagamento
        : null,
    valorRecebidoCentavos: inteiro(row.valor_recebido_centavos),
    trocoCentavos: inteiro(row.troco_centavos),
    status: (texto(row.status) as StatusPedido) || "novo",
    pago: inteiro(row.pago) === 1,
    equipeId: row.equipe_id === null || row.equipe_id === undefined
      ? null
      : inteiro(row.equipe_id),
    criadoEm: texto(row.criado_em),
    atualizadoEm: texto(row.atualizado_em),
    itens,
  };
}

async function buscarProduto(
  id: number,
  executor: Executor,
): Promise<Produto | null> {
  const { rows } = await executor.execute({
    sql: "SELECT * FROM produtos WHERE id = ?",
    args: [id],
  });
  const row = rows[0];
  return row ? mapProduto(row as Record<string, unknown>) : null;
}

export async function listarProdutos(
  incluirInativos = false,
): Promise<Produto[]> {
  const client = await db();
  const ordemCategoria = `CASE categoria
    WHEN 'Salgados' THEN 1
    WHEN 'Doces' THEN 2
    WHEN 'Bebidas' THEN 3
    WHEN 'Combos' THEN 4
    ELSE 5
  END`;
  const { rows } = await client.execute(
    incluirInativos
      ? `SELECT * FROM produtos ORDER BY ${ordemCategoria}, nome`
      : `SELECT * FROM produtos WHERE ativo = 1 ORDER BY ${ordemCategoria}, nome`,
  );
  return rows.map((row) => mapProduto(row as Record<string, unknown>));
}

type ProdutoEntrada = {
  nome: string;
  descricao: string | null;
  categoria: Categoria;
  precoCentavos: number;
  estoque: number;
  ativo: number;
  emoji: string;
};

function validarProduto(
  dados: Record<string, unknown>,
  atual?: Produto,
): ProdutoEntrada {
  const nome = texto(dados.nome, atual?.nome ?? "").slice(0, 80);
  if (!nome) throw new Error("Informe o nome do produto.");

  const categoria = texto(
    dados.categoria,
    atual?.categoria ?? "Salgados",
  ) as Categoria;
  if (!CATEGORIAS_VALIDAS.includes(categoria)) {
    throw new Error("Categoria inválida.");
  }

  const precoCentavos =
    dados.precoCentavos === undefined
      ? atual?.precoCentavos ?? 0
      : inteiro(dados.precoCentavos);
  if (precoCentavos <= 0) {
    throw new Error("Informe um preço maior que zero.");
  }

  const estoque =
    dados.estoque === undefined
      ? atual?.estoque ?? 0
      : inteiro(dados.estoque);
  if (estoque < 0) {
    throw new Error("O estoque não pode ser negativo.");
  }

  const ativo =
    dados.ativo === undefined
      ? atual?.ativo ?? 1
      : inteiro(dados.ativo)
        ? 1
        : 0;

  const emoji =
    texto(dados.emoji, atual?.emoji ?? "🍽️").slice(0, 8) || "🍽️";

  const descricaoBruta =
    dados.descricao === undefined
      ? atual?.descricao ?? null
      : dados.descricao;
  const descricao =
    typeof descricaoBruta === "string" && descricaoBruta.trim()
      ? descricaoBruta.trim().slice(0, 160)
      : null;

  return {
    nome,
    descricao,
    categoria,
    precoCentavos,
    estoque,
    ativo,
    emoji,
  };
}

export async function criarProduto(dados: unknown): Promise<Produto> {
  const registro = (dados ?? {}) as Record<string, unknown>;
  const produto = validarProduto(registro);
  const client = await db();

  const resultado = await client.execute({
    sql: `INSERT INTO produtos (nome, descricao, categoria, preco_centavos, estoque, ativo, emoji)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      produto.nome,
      produto.descricao,
      produto.categoria,
      produto.precoCentavos,
      produto.estoque,
      produto.ativo,
      produto.emoji,
    ],
  });

  const criado = await buscarProduto(
    Number(resultado.lastInsertRowid),
    client,
  );
  if (!criado) throw new Error("Não foi possível criar o produto.");
  return criado;
}

export async function atualizarProduto(
  id: number,
  dados: unknown,
): Promise<Produto> {
  const client = await db();
  const atual = await buscarProduto(id, client);
  if (!atual) throw new Error("Produto não encontrado.");

  const produto = validarProduto(
    (dados ?? {}) as Record<string, unknown>,
    atual,
  );

  await client.execute({
    sql: `UPDATE produtos
          SET nome = ?, descricao = ?, categoria = ?, preco_centavos = ?,
              estoque = ?, ativo = ?, emoji = ?
          WHERE id = ?`,
    args: [
      produto.nome,
      produto.descricao,
      produto.categoria,
      produto.precoCentavos,
      produto.estoque,
      produto.ativo,
      produto.emoji,
      id,
    ],
  });

  const atualizado = await buscarProduto(id, client);
  if (!atualizado) throw new Error("Produto não encontrado.");
  return atualizado;
}

export async function montarItens(
  brutos: unknown,
  executor: Executor,
): Promise<{ itens: ItemPedido[]; totalCentavos: number }> {
  if (!Array.isArray(brutos) || !brutos.length) {
    throw new Error("O carrinho está vazio.");
  }

  const quantidades = new Map<number, number>();

  for (const bruto of brutos) {
    if (!bruto || typeof bruto !== "object") continue;
    const item = bruto as { produtoId?: unknown; quantidade?: unknown };
    const produtoId = inteiro(item.produtoId);
    const quantidade = inteiro(item.quantidade);
    if (produtoId <= 0 || quantidade <= 0) continue;
    quantidades.set(
      produtoId,
      Math.min(99, (quantidades.get(produtoId) ?? 0) + quantidade),
    );
  }

  if (!quantidades.size) {
    throw new Error("Nenhum item válido no carrinho.");
  }

  const itens: ItemPedido[] = [];
  let totalCentavos = 0;

  for (const [produtoId, quantidade] of quantidades) {
    const produto = await buscarProduto(produtoId, executor);
    if (!produto || produto.ativo !== 1) {
      throw new Error("Um dos produtos não está mais disponível.");
    }
    if (produto.estoque < quantidade) {
      throw new Error(
        `Estoque insuficiente para ${produto.nome} (disponível: ${produto.estoque}).`,
      );
    }
    itens.push({
      produtoId,
      nome: produto.nome,
      emoji: produto.emoji,
      precoCentavos: produto.precoCentavos,
      quantidade,
    });
    totalCentavos += produto.precoCentavos * quantidade;
  }

  return { itens, totalCentavos };
}

export async function criarPedido(dados: unknown): Promise<Pedido> {
  const corpo = (dados ?? {}) as Record<string, unknown>;
  const formaPagamento = texto(corpo.formaPagamento) as FormaPagamento;

  if (!FORMAS_VALIDAS.includes(formaPagamento)) {
    throw new Error("Forma de pagamento inválida.");
  }

  const cliente = texto(corpo.cliente).slice(0, 60) || null;
  const detalhe =
    texto(corpo.detalhePagamento).slice(0, 30) ||
    (formaPagamento === "cartao" ? "cartao" : formaPagamento);

  const client = await db();
  const tx = await client.transaction("write");
  let pedidoId = 0;

  try {
    const { itens, totalCentavos } = await montarItens(corpo.itens, tx);

    let valorRecebido = totalCentavos;
    let troco = 0;

    if (formaPagamento === "dinheiro") {
      valorRecebido = inteiro(corpo.valorRecebidoCentavos);
      if (valorRecebido < totalCentavos) {
        throw new Error("Valor recebido insuficiente.");
      }
      troco = valorRecebido - totalCentavos;
    }

    const agora = new Date().toISOString();

    const equipeId =
      corpo.equipeId === undefined || corpo.equipeId === null
        ? null
        : inteiro(corpo.equipeId);

    const pago = corpo.pago === true || inteiro(corpo.pago) === 1 ? 1 : 0;

    const resultado = await tx.execute({
      sql: `INSERT INTO pedidos
              (cliente, total_centavos, forma_pagamento, detalhe_pagamento,
               valor_recebido_centavos, troco_centavos, status, pago, criado_em, atualizado_em, equipe_id)
            VALUES (?, ?, ?, ?, ?, ?, 'novo', ?, ?, ?, ?)`,
      args: [
        cliente,
        totalCentavos,
        formaPagamento,
        detalhe,
        valorRecebido,
        troco,
        pago,
        agora,
        agora,
        equipeId,
      ],
    });

    pedidoId = Number(resultado.lastInsertRowid);

    for (const item of itens) {
      const atualizacao = await tx.execute({
        sql: "UPDATE produtos SET estoque = estoque - ? WHERE id = ? AND estoque >= ?",
        args: [item.quantidade, item.produtoId, item.quantidade],
      });

      if (atualizacao.rowsAffected !== 1) {
        throw new Error(`Estoque insuficiente para ${item.nome}.`);
      }

      await tx.execute({
        sql: `INSERT INTO pedido_itens
                (pedido_id, produto_id, nome, emoji, preco_centavos, quantidade)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          pedidoId,
          item.produtoId,
          item.nome,
          item.emoji,
          item.precoCentavos,
          item.quantidade,
        ],
      });
    }

    await tx.commit();
  } catch (erro) {
    await tx.rollback();
    throw erro;
  }

  const pedido = await buscarPedido(pedidoId);
  if (!pedido) throw new Error("Pedido criado, mas não encontrado.");
  return pedido;
}

export async function buscarPedido(id: number): Promise<Pedido | null> {
  const client = await db();
  const { rows } = await client.execute({
    sql: "SELECT * FROM pedidos WHERE id = ?",
    args: [id],
  });
  if (!rows.length) return null;

  const itens = await client.execute({
    sql: "SELECT * FROM pedido_itens WHERE pedido_id = ? ORDER BY id",
    args: [id],
  });

  return mapPedido(
    rows[0] as Record<string, unknown>,
    itens.rows.map((row) => mapItem(row as Record<string, unknown>)),
  );
}

export async function listarPedidos(): Promise<Pedido[]> {
  const client = await db();
  const pedidos = await client.execute(
    "SELECT * FROM pedidos ORDER BY id DESC LIMIT 200",
  );

  if (!pedidos.rows.length) return [];

  const ids = pedidos.rows
    .map((row) => inteiro((row as Record<string, unknown>).id))
    .filter((id) => id > 0);

  const placeholders = ids.map(() => "?").join(",");
  const itens = await client.execute({
    sql: `SELECT * FROM pedido_itens WHERE pedido_id IN (${placeholders}) ORDER BY id`,
    args: ids,
  });

  const porPedido = new Map<number, ItemPedido[]>();

  for (const row of itens.rows) {
    const registro = row as Record<string, unknown>;
    const pedidoId = inteiro(registro.pedido_id);
    const lista = porPedido.get(pedidoId) ?? [];
    lista.push(mapItem(registro));
    porPedido.set(pedidoId, lista);
  }

  return pedidos.rows.map((row) => {
    const registro = row as Record<string, unknown>;
    const id = inteiro(registro.id);
    return mapPedido(registro, porPedido.get(id) ?? []);
  });
}

export async function atualizarStatus(
  id: number,
  status: unknown,
  equipeId?: unknown,
): Promise<Pedido> {
  const statusValido = texto(status) as StatusPedido;
  if (!STATUS_VALIDOS.includes(statusValido)) {
    throw new Error("Status inválido.");
  }

  const client = await db();
  let equipeIdValido: number | null = null;
  let atualizarEquipeId = false;

  if (equipeId !== undefined) {
    if (equipeId === null) {
      equipeIdValido = null;
      atualizarEquipeId = true;
    } else {
      const idEquipe = inteiro(equipeId);
      if (idEquipe > 0) {
        const equipe = await buscarEquipe(idEquipe);
        if (!equipe || !CARGOS_VALIDOS.includes(equipe.cargo)) {
          throw new Error("Equipe inválida.");
        }
        equipeIdValido = idEquipe;
        atualizarEquipeId = true;
      }
    }
  }

  const sqlAtualizacao = atualizarEquipeId
    ? `UPDATE pedidos SET status = ?, equipe_id = ?, atualizado_em = ? WHERE id = ?`
    : `UPDATE pedidos SET status = ?, atualizado_em = ? WHERE id = ?`;
  const argsAtualizacao = atualizarEquipeId
    ? [statusValido, equipeIdValido, new Date().toISOString(), id]
    : [statusValido, new Date().toISOString(), id];

  const resultado = await client.execute({
    sql: sqlAtualizacao,
    args: argsAtualizacao,
  });

  if (resultado.rowsAffected !== 1) {
    throw new Error("Pedido não encontrado.");
  }

  const pedido = await buscarPedido(id);
  if (!pedido) throw new Error("Pedido não encontrado.");
  return pedido;
}

export async function finalizarPedido(
  id: number,
  dados: unknown,
): Promise<Pedido> {
  const corpo = (dados ?? {}) as Record<string, unknown>;
  const client = await db();
  const atual = await buscarPedido(id);
  if (!atual) throw new Error("Pedido não encontrado.");
  if (atual.status === "cancelado") throw new Error("Pedido cancelado.");
  if (atual.status !== "pronto") {
    throw new Error("O pedido ainda não está pronto para entrega.");
  }

  const agora = new Date().toISOString();

  if (atual.pago) {
    const resultado = await client.execute({
      sql: `UPDATE pedidos SET status = 'entregue', atualizado_em = ? WHERE id = ?`,
      args: [agora, id],
    });
    if (resultado.rowsAffected !== 1) {
      throw new Error("Pedido não encontrado.");
    }
    const pedido = await buscarPedido(id);
    if (!pedido) throw new Error("Pedido não encontrado.");
    return pedido;
  }

  const formaPagamento = texto(corpo.formaPagamento) as FormaPagamento;
  if (!FORMAS_VALIDAS.includes(formaPagamento)) {
    throw new Error("Forma de pagamento inválida.");
  }

  const detalhe =
    texto(corpo.detalhePagamento).slice(0, 30) ||
    (formaPagamento === "cartao" ? "cartao" : formaPagamento);

  const total = atual.totalCentavos;
  let valorRecebido = total;
  let troco = 0;

  if (formaPagamento === "dinheiro") {
    valorRecebido = inteiro(corpo.valorRecebidoCentavos);
    if (valorRecebido < total) {
      throw new Error("Valor recebido insuficiente.");
    }
    troco = valorRecebido - total;
  }

  const resultado = await client.execute({
    sql: `UPDATE pedidos
            SET status = 'entregue', pago = 1, forma_pagamento = ?, detalhe_pagamento = ?,
                valor_recebido_centavos = ?, troco_centavos = ?, atualizado_em = ?
          WHERE id = ?`,
    args: [formaPagamento, detalhe, valorRecebido, troco, agora, id],
  });

  if (resultado.rowsAffected !== 1) {
    throw new Error("Pedido não encontrado.");
  }

  const pedido = await buscarPedido(id);
  if (!pedido) throw new Error("Pedido não encontrado.");
  return pedido;
}

export async function resumo(): Promise<Resumo> {
  const client = await db();

  const [geral, formas, top] = await Promise.all([
    client.execute(
      "SELECT COUNT(*) AS pedidos, COALESCE(SUM(total_centavos), 0) AS total FROM pedidos WHERE status != 'cancelado'",
    ),
    client.execute(
      "SELECT forma_pagamento, COALESCE(SUM(total_centavos), 0) AS total FROM pedidos WHERE status != 'cancelado' GROUP BY forma_pagamento",
    ),
    client.execute(
      `SELECT pi.nome,
              SUM(pi.quantidade) AS quantidade,
              SUM(pi.quantidade * pi.preco_centavos) AS total
         FROM pedido_itens pi
         JOIN pedidos p ON p.id = pi.pedido_id
        WHERE p.status != 'cancelado'
        GROUP BY pi.nome
        ORDER BY quantidade DESC
        LIMIT 5`,
    ),
  ]);

  const linhaGeral = (geral.rows[0] ?? {}) as Record<string, unknown>;
  const pedidos = inteiro(linhaGeral.pedidos);
  const total = inteiro(linhaGeral.total);

  const porForma: Record<FormaPagamento, number> = {
    pix: 0,
    cartao: 0,
    dinheiro: 0,
  };

  for (const row of formas.rows) {
    const registro = row as Record<string, unknown>;
    const forma = texto(registro.forma_pagamento) as FormaPagamento;
    if (FORMAS_VALIDAS.includes(forma)) {
      porForma[forma] = inteiro(registro.total);
    }
  }

  const topProdutos = top.rows.map((row) => {
    const registro = row as Record<string, unknown>;
    return {
      nome: texto(registro.nome),
      quantidade: inteiro(registro.quantidade),
      totalCentavos: inteiro(registro.total),
    };
  });

  return {
    totalCentavos: total,
    pedidos,
    ticketMedioCentavos: pedidos > 0 ? Math.round(total / pedidos) : 0,
    porForma,
    topProdutos,
  };
}

export async function resetarVendas(): Promise<void> {
  const client = await db();
  const tx = await client.transaction("write");

  try {
    await tx.execute("DELETE FROM pedido_itens");
    await tx.execute("DELETE FROM pedidos");
    await tx.execute("UPDATE produtos SET estoque = 30");
    await tx.commit();
  } catch (erro) {
    await tx.rollback();
    throw erro;
  }
}

export async function listarEquipes(): Promise<Equipe[]> {
  const client = await db();
  const { rows } = await client.execute(
    "SELECT * FROM equipes ORDER BY cargo, nome",
  );
  return rows.map((row) => mapEquipe(row as Record<string, unknown>));
}

export async function buscarEquipe(id: number): Promise<Equipe | null> {
  const client = await db();
  const { rows } = await client.execute({
    sql: "SELECT * FROM equipes WHERE id = ?",
    args: [id],
  });
  if (!rows.length) return null;
  return mapEquipe(rows[0] as Record<string, unknown>);
}

type EquipeEntrada = {
  nome: string;
  cargo: Cargo;
  ativo: number;
  codigoOperacao: string | null;
};

function validarEquipe(dados: Record<string, unknown>, atual?: Equipe): EquipeEntrada {
  const nome = texto(dados.nome, atual?.nome ?? "").slice(0, 80);
  if (!nome) throw new Error("Informe o nome da equipe.");

  const cargo = texto(
    dados.cargo,
    atual?.cargo ?? "caixa",
  ) as Cargo;
  if (!CARGOS_VALIDOS.includes(cargo)) {
    throw new Error("Cargo inválido.");
  }

  const ativo =
    dados.ativo === undefined
      ? atual?.ativo ?? 1
      : inteiro(dados.ativo)
        ? 1
        : 0;

  const codigoOperacao =
    texto(dados.codigoOperacao, atual?.codigoOperacao ?? "") || null;

  return { nome, cargo, ativo, codigoOperacao };
}

export async function criarEquipe(dados: unknown): Promise<Equipe> {
  const registro = (dados ?? {}) as Record<string, unknown>;
  const equipe = validarEquipe(registro);
  const client = await db();

  const agora = new Date().toISOString();
  const resultado = await client.execute({
    sql: `INSERT INTO equipes (nome, cargo, codigo_operacao, ativo, criado_em, atualizado_em)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [equipe.nome, equipe.cargo, equipe.codigoOperacao, equipe.ativo, agora, agora],
  });

  const criado = await buscarEquipe(Number(resultado.lastInsertRowid));
  if (!criado) throw new Error("Não foi possível criar a equipe.");
  return criado;
}

export async function atualizarEquipe(
  id: number,
  dados: unknown,
): Promise<Equipe> {
  const client = await db();
  const atual = await buscarEquipe(id);
  if (!atual) throw new Error("Equipe não encontrada.");

  const equipe = validarEquipe((dados ?? {}) as Record<string, unknown>, atual);
  const agora = new Date().toISOString();

  await client.execute({
    sql: `UPDATE equipes
          SET nome = ?, cargo = ?, ativo = ?, atualizado_em = ?
          WHERE id = ?`,
    args: [equipe.nome, equipe.cargo, equipe.ativo, agora, id],
  });

  const atualizado = await buscarEquipe(id);
  if (!atualizado) throw new Error("Equipe não encontrada.");
  return atualizado;
}

export async function removerEquipe(id: number): Promise<void> {
  const client = await db();
  const tx = await client.transaction("write");

  try {
    const equipe = await buscarEquipe(id);
    if (!equipe) throw new Error("Equipe não encontrada.");

    await tx.execute({ sql: "DELETE FROM equipes WHERE id = ?", args: [id] });
    await tx.commit();
  } catch (erro) {
    await tx.rollback();
    throw erro;
  }
}

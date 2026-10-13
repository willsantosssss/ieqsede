// @ts-nocheck
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema";
import { 
  InsertUser, users, celulas, inscricoesBatismo, usuariosCadastrados, pedidosOracao, anotacoesDevocional,
  eventos, noticias, avisoImportante, contatosIgreja, lideres, relatorios, dadosContribuicao,
  contribuicoes, inscricoesEventos, inscricoesEscolaCrescimento, anexos, pagamentosEventos, configEscolaCrescimento,
  configPagamentosEventos, recados,
  InsertCelula, InsertInscricaoBatismo, InsertUsuarioCadastrado, InsertPedidoOracao, InsertAnotacaoDevocional,
  InsertEvento, InsertNoticia, InsertAvisoImportante, InsertContatoIgreja, InsertLider, InsertRelatorio, InsertDadosContribuicao, InsertInscricaoEvento, InsertInscricaoEscolaCrescimento, InsertAnexo, InsertPagamentoEvento, InsertConfigEscolaCrescimento,
  InsertConfigPagamentoEvento
} from "../drizzle/schema";
import { databaseUrl } from "./security/database-config.mjs";
import { eq, desc, and } from "drizzle-orm";

let _db: ReturnType<typeof drizzle> | null = null;
let _poolConnection: ReturnType<typeof mysql.createPool> | null = null;

// Get or create a reusable MySQL connection pool
export function getSqlClient() {
  if (!_poolConnection && process.env.DATABASE_URL) {
    void 0;
    _poolConnection = mysql.createPool(databaseUrl(process.env));
  }
  void 0;
  return _poolConnection;
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const pool = getSqlClient()!;
      _db = drizzle(pool, { schema, mode: 'default' });
      void 0;
    } catch (error) {
      void 0;
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    void 0;
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      if (user[field] !== undefined) {
        values[field] = user[field];
        updateSet[field] = user[field];
      }
    };

    assignNullable("name");
    assignNullable("email");
    assignNullable("loginMethod");

    const existing = await db.select().from(users).where(eq(users.openId, user.openId));

    if (existing.length > 0) {
      if (Object.keys(updateSet).length > 0) {
        await db.update(users).set(updateSet).where(eq(users.openId, user.openId));
      }
    } else {
      await db.insert(users).values(values);
    }
  } catch (error) {
    void 0;
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.openId, openId));
  return result[0] || null;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.id, id));
  return result[0] || null;
}

// ==================== USUÁRIOS CADASTRADOS ====================

export async function upsertUsuarioCadastrado(data: InsertUsuarioCadastrado) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  void 0;
  void 0;

  if (!data.userId) {
    throw new Error("userId is required for upsertUsuarioCadastrado");
  }

  const existing = await db
    .select()
    .from(usuariosCadastrados)
    .where(eq(usuariosCadastrados.userId, data.userId));

  void 0;

  if (existing.length > 0) {
    void 0;
    await db
      .update(usuariosCadastrados)
      .set(data)
      .where(eq(usuariosCadastrados.userId, data.userId));
  } else {
    void 0;
    await db.insert(usuariosCadastrados).values(data);
  }
}

export async function getUsuarioCadastrado(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(usuariosCadastrados)
    .where(eq(usuariosCadastrados.userId, userId));
  return result[0] || null;
}

export async function getAllUsuariosCadastrados() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(usuariosCadastrados);
}

// ==================== CÉLULAS ====================

export async function getCelulas() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(celulas);
}

export async function getCelulaById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(celulas).where(eq(celulas.id, id));
  return result[0] || null;
}

export async function createCelula(data: InsertCelula) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(celulas).values(data);
}

export async function updateCelula(id: number, data: Partial<InsertCelula>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(celulas).set(data).where(eq(celulas.id, id));
}

export async function deleteCelula(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(celulas).where(eq(celulas.id, id));
}

// ==================== INSCRIÇÕES BATISMO ====================

export async function getInscricoesBatismo() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inscricoesBatismo);
}

export async function getInscricoesBatismoPendentes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inscricoesBatismo).where(eq(inscricoesBatismo.status, "pendente"));
}

export async function createInscricaoBatismo(data: InsertInscricaoBatismo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(inscricoesBatismo).values(data);
}

export async function updateInscricaoBatismo(id: number, data: Partial<InsertInscricaoBatismo>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(inscricoesBatismo).set(data).where(eq(inscricoesBatismo.id, id));
}

export async function deleteInscricaoBatismo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(inscricoesBatismo).where(eq(inscricoesBatismo.id, id));
}

// ==================== PEDIDOS DE ORAÇÃO ====================

export async function getPedidosOracao() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pedidosOracao);
}

export async function getPedidoOracaoById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(pedidosOracao).where(eq(pedidosOracao.id, id));
  return result[0] || null;
}

export async function createPedidoOracao(data: InsertPedidoOracao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(pedidosOracao).values(data);
}

export async function updatePedidoOracao(id: number, data: Partial<InsertPedidoOracao>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(pedidosOracao).set(data).where(eq(pedidosOracao.id, id));
}

export async function deletePedidoOracao(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(pedidosOracao).where(eq(pedidosOracao.id, id));
}

// ==================== ANOTAÇÕES DEVOCIONAL ====================

export async function getAnotacoesDevocional(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(anotacoesDevocional)
    .where(eq(anotacoesDevocional.userId, userId));
}

export async function getAnotacoesDevocionalByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(anotacoesDevocional)
    .where(eq(anotacoesDevocional.userId, userId));
}

export async function getAnotacaoDevocionalByCapitulo(userId: number, livro: string, capitulo: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(anotacoesDevocional)
    .where(
      and(eq(anotacoesDevocional.userId, userId), eq(anotacoesDevocional.livro, livro), eq(anotacoesDevocional.capitulo, capitulo))
    );
  return result[0] || null;
}

export async function createAnotacaoDevocional(data: InsertAnotacaoDevocional) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(anotacoesDevocional).values(data);
}

export async function updateAnotacaoDevocional(
  id: number,
  data: Partial<InsertAnotacaoDevocional>,
  userId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(anotacoesDevocional)
    .set(data)
    .where(and(eq(anotacoesDevocional.id, id), eq(anotacoesDevocional.userId, userId)));
}

export async function deleteAnotacaoDevocional(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(anotacoesDevocional).where(and(eq(anotacoesDevocional.id, id), eq(anotacoesDevocional.userId, userId)));
}

export async function deleteAnotacoesDevocionalByCapitulo(userId: number, livro: string, capitulo: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(anotacoesDevocional)
    .where(
      and(eq(anotacoesDevocional.userId, userId), eq(anotacoesDevocional.livro, livro), eq(anotacoesDevocional.capitulo, capitulo))
    );
}

// ==================== EVENTOS ====================

export async function getEventos() {
  void 0;
  const db = await getDb();
  if (!db) {
    void 0;
    return [];
  }
  try {
    void 0;
    const result = await db.select().from(eventos).orderBy(desc(eventos.id));
    void 0;
    return result;
  } catch (error) {
    void 0;
    return [];
  }
}

export async function getEventoById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(eventos).where(eq(eventos.id, id));
  return result[0] || null;
}

export async function getEventosEspeciais() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(eventos).where(eq(eventos.especial, true));
}

export async function createEvento(data: InsertEvento) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(eventos).values(data);
}

export async function updateEvento(id: number, data: Partial<InsertEvento>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(eventos).set(data).where(eq(eventos.id, id));
}

export async function deleteEvento(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(eventos).where(eq(eventos.id, id));
}

// ==================== NOTÍCIAS ====================

export async function getNoticias() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(noticias);
}

export async function getNoticiaById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(noticias).where(eq(noticias.id, id));
  return result[0] || null;
}

export async function createNoticia(data: InsertNoticia) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(noticias).values(data);
}

export async function updateNoticia(id: number, data: Partial<InsertNoticia>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(noticias).set(data).where(eq(noticias.id, id));
}

export async function deleteNoticia(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(noticias).where(eq(noticias.id, id));
}

// ==================== AVISOS IMPORTANTES ====================

export async function getAvisosImportantes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(avisoImportante);
}

export async function getAvisoImportante() {
  const db = await getDb();
  if (!db) return null;
  // Retornar o aviso mais recente e ativo
  const result = await db
    .select()
    .from(avisoImportante)
    .where(eq(avisoImportante.ativo, 1))
    .orderBy(desc(avisoImportante.updatedAt))
    .limit(1);
  return result[0] || null;
}

export async function createAvisoImportante(data: InsertAvisoImportante) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(avisoImportante).values(data);
}

export async function updateAvisoImportante(
  id: number,
  data: Partial<InsertAvisoImportante>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(avisoImportante).set(data).where(eq(avisoImportante.id, id));
}

export async function deleteAvisoImportante(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(avisoImportante).where(eq(avisoImportante.id, id));
}

export async function desativarAvisoImportante() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Desativar todos os avisos
  await db.update(avisoImportante).set({ ativo: 0 });
}

export async function saveAvisoImportante(data: InsertAvisoImportante) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Desativar todos os avisos antigos
  await db.update(avisoImportante).set({ ativo: 0 });
  // Criar novo aviso com ativo=1
  return await db.insert(avisoImportante).values({
    ...data,
    ativo: 1,
  });
}

// ==================== CONTATOS IGREJA ====================

export async function getContatosIgreja() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contatosIgreja);
}

export async function createContatoIgreja(data: InsertContatoIgreja) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(contatosIgreja).values(data);
}

export async function updateContatoIgreja(id: number, data: Partial<InsertContatoIgreja>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contatosIgreja).set(data).where(eq(contatosIgreja.id, id));
}

export async function deleteContatoIgreja(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(contatosIgreja).where(eq(contatosIgreja.id, id));
}

// ==================== LÍDERES ====================

export async function getLideres() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lideres);
}

export async function getLiderByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(lideres).where(eq(lideres.userId, userId));
  return result[0] || null;
}

export async function getLiderByCelula(celula: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(lideres).where(eq(lideres.celula, celula));
  return result[0] || null;
}

export async function getLiderById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(lideres).where(eq(lideres.id, id));
  return result[0] || null;
}

export async function createLider(data: InsertLider) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.insert(lideres).values(data);
    // Buscar pelo userId para garantir que retorna o líder correto
    const lider = await db.select().from(lideres)
      .where(eq(lideres.userId, data.userId))
      .orderBy(lideres.id)
      .limit(1);
    return lider[0] || { ...data, id: 0 };
  } catch (error: any) {
    void 0;
    throw new Error(`Erro ao criar líder: ${error.message}`);
  }
}

export async function updateLider(id: number, data: Partial<InsertLider>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(lideres).set(data).where(eq(lideres.id, id));
}

export async function deleteLider(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(lideres).where(eq(lideres.id, id));
}

// ==================== RELATÓRIOS ====================

export async function getRelatorios() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(relatorios);
}

export async function getRelatoriosByCelula(celula: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(relatorios).where(eq(relatorios.celula, celula));
}

export async function getRelatoriosByLiderId(liderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(relatorios).where(eq(relatorios.liderId, liderId));
}

export async function getRelatoriosByLiderIdWithFilters(
  liderId: number,
  filtro?: { dataInicio?: string; dataFim?: string; tipo?: string; limite?: number }
) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    // Primeiro, buscar a célula do líder
    const liderData = await db.select().from(lideres).where(eq(lideres.id, liderId));
    if (!liderData || liderData.length === 0) {
      void 0;
      return [];
    }
    
    const celulaDolider = liderData[0].celula;
    
    // Filtrar relatórios apenas da célula do líder
    let query = db.select().from(relatorios).where(eq(relatorios.celula, celulaDolider));
    
    if (filtro?.dataInicio) {
      query = query.where((col) => col.periodo >= filtro.dataInicio);
    }
    if (filtro?.dataFim) {
      query = query.where((col) => col.periodo <= filtro.dataFim);
    }
    if (filtro?.tipo) {
      query = query.where(eq(relatorios.tipo, filtro.tipo));
    }
    
    query = query.orderBy(desc(relatorios.periodo));
    
    if (filtro?.limite && filtro.limite > 0) {
      query = query.limit(filtro.limite);
    }
    
    const result = await query;
    return result;
  } catch (error) {
    void 0;
    return [];
  }
}

export async function createRelatorio(data: Omit<InsertRelatorio, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(relatorios).values(data);
  return Number((result as any).insertId || 0);
}

export async function updateRelatorio(id: number, data: Partial<InsertRelatorio>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(relatorios).set(data).where(eq(relatorios.id, id));
}

export async function deleteRelatorio(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(relatorios).where(eq(relatorios.id, id));
}

// ==================== DADOS DE CONTRIBUIÇÃO ====================

export async function getDadosContribuicao() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(dadosContribuicao).limit(1);
  return result[0] || null;
}

export async function updateDadosContribuicao(data: Partial<InsertDadosContribuicao>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(dadosContribuicao).limit(1);
  if (existing.length > 0) {
    await db.update(dadosContribuicao).set(data);
  } else {
    await db.insert(dadosContribuicao).values(data as InsertDadosContribuicao);
  }
}

// ==================== CONTRIBUIÇÕES ====================

export async function getContribuicoes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contribuicoes);
}

export async function getContribuicoesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contribuicoes).where(eq(contribuicoes.userId, userId));
}

export async function createContribuicao(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(contribuicoes).values(data);
}

export async function deleteContribuicao(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(contribuicoes).where(eq(contribuicoes.id, id));
}

// ==================== INSCRIÇÕES EVENTOS ====================

export async function getInscricoesEventos() {
  const db = await getDb();
  if (!db) return [];
  const inscricoes = await db.select().from(inscricoesEventos);
  
  // Buscar titulos e datas dos eventos
  const eventosMap = new Map();
  const eventosData = await db.select().from(eventos);
  eventosData.forEach((e: any) => {
    eventosMap.set(e.id, { titulo: e.titulo, data: e.data });
  });
  
  // Retornar dados conforme esperado pela tela
  return inscricoes.map((i: any) => {
    const eventoInfo = eventosMap.get(i.eventoId) || { titulo: 'Evento desconhecido', data: '' };
    return {
      id: i.id,
      eventoId: i.eventoId,
      eventoTitulo: eventoInfo.titulo,
      eventoData: eventoInfo.data,
      nome: i.nome,
      celula: i.celula,
      telefone: i.telefone,
      status: i.status,
      userId: i.userId,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    };
  });
}

export async function getMinhasInscricoesEventos(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.select().from(inscricoesEventos).where(eq(inscricoesEventos.userId, userId));
}

export async function getInscricoesEventosByEventoId(eventoId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inscricoesEventos).where(eq(inscricoesEventos.eventoId, eventoId));
}

export async function createInscricaoEvento(data: InsertInscricaoEvento) {
  const pool = getSqlClient();
  if (!pool) throw new Error("Database not available");
  
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO inscricoesEventos (eventoId, userId, nomeInscrito, emailInscrito, telefoneinscrito, celulaInscrito, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [data.eventoId, data.userId || null, data.nome, data.email || null, data.telefone, data.celula]
    );
    const inscricaoId = (result as any).insertId;
    const [configs] = await conn.query('SELECT valor FROM configPagamentosEventos WHERE eventoId = ? AND ativo = 1 LIMIT 1', [data.eventoId]);
    if (Array.isArray(configs) && configs.length) {
      await conn.query('INSERT INTO pagamentos_eventos (inscricaoId, valor, metodo, status) VALUES (?, ?, ?, ?)',
        [inscricaoId, (configs[0] as any).valor, 'pix', 'pendente']);
    }
    await conn.commit();
    return { ...data, id: inscricaoId };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally { conn.release(); }
}

export async function deleteInscricaoEvento(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(inscricoesEventos).where(eq(inscricoesEventos.id, id));
}

// ==================== ESCOLA DE CRESCIMENTO ====================

export async function getInscricoesEscolaCrescimento() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inscricoesEscolaCrescimento);
}

export async function createInscricaoEscolaCrescimento(data: InsertInscricaoEscolaCrescimento) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(inscricoesEscolaCrescimento).values(data);
  return data;
}

export async function deleteInscricaoEscolaCrescimento(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(inscricoesEscolaCrescimento).where(eq(inscricoesEscolaCrescimento.id, id));
}

// ==================== ANIVERSARIANTES ====================

export async function getAniversariantes() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(usuariosCadastrados);
  return result.filter((u) => u.dataNascimento);
}

export async function getAniversariantesMes(mes: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(usuariosCadastrados);
  return result.flatMap((u) => {
    if (!u.dataNascimento) return [];
    const parts = u.dataNascimento.split(/[-/]/).map(Number);
    const month = parts[1];
    const day = u.dataNascimento.includes('-') ? parts[2] : parts[0];
    return month === mes ? [{ nome: u.nome, celula: u.celula, dia: day, mes: month }] : [];
  });
}

// ==================== DELETAR USUÁRIO COMPLETAMENTE ====================

export async function deleteUserCompletely(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Deletar apenas os dados do perfil do usuário
    // Nota: Mantemos histórico de contribuições, inscrições e líderes para auditoria
    await db.delete(usuariosCadastrados).where(eq(usuariosCadastrados.userId, userId));
    await db.delete(users).where(eq(users.id, userId));
    return { success: true, userId, message: "Usuário deletado com sucesso" };
  } catch (error: any) {
    void 0;
    throw new Error(`Erro ao deletar usuário: ${error.message}`);
  }
}


// ==================== USUÁRIOS CADASTRADOS ====================

export async function getUsuariosCadastrados() {
  const db = await getDb();
  if (!db) return [];
  try {
    const result = await db.select().from(usuariosCadastrados);
    return result;
  } catch (error) {
    void 0;
    return [];
  }
}

export async function getMembrosPorCelula(celula: string) {
  const db = await getDb();
  if (!db) return [];
  try {
    const result = await db.select().from(usuariosCadastrados).where(eq(usuariosCadastrados.celula, celula));
    return result;
  } catch (error) {
    void 0;
    return [];
  }
}

export async function getInscricoesEventosPorCelula(celula: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select({
    id: inscricoesEventos.id, nome: inscricoesEventos.nome,
    celula: inscricoesEventos.celula, eventoId: inscricoesEventos.eventoId,
  }).from(inscricoesEventos).where(eq(inscricoesEventos.celula, celula));
}

export async function getEscolaPorCelula(celula: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select({
    id: inscricoesEscolaCrescimento.id, nome: inscricoesEscolaCrescimento.nome,
    celula: inscricoesEscolaCrescimento.celula, curso: inscricoesEscolaCrescimento.curso,
    status: inscricoesEscolaCrescimento.status,
  }).from(inscricoesEscolaCrescimento).where(eq(inscricoesEscolaCrescimento.celula, celula));
}

// ==================== ORAÇÃO - INCREMENTAR CONTADOR ====================

export async function incrementarContadorOracao(pedidoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    // Buscar pedido atual
    const pedido = await db.select().from(pedidosOracao).where(eq(pedidosOracao.id, pedidoId));
    if (!pedido || pedido.length === 0) throw new Error("Pedido not found");
    
    // Incrementar contador
    const novoContador = (pedido[0].contadorOrando || 0) + 1;
    await db.update(pedidosOracao)
      .set({ contadorOrando: novoContador })
      .where(eq(pedidosOracao.id, pedidoId));
    
    return { success: true, novoContador };
  } catch (error) {
    void 0;
    throw error;
  }
}

// ==================== CONFIG ESCOLA DE CRESCIMENTO ====================

export async function getConfigEscolaCrescimento() {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select().from(configEscolaCrescimento).limit(1);
    if (result.length === 0) {
      // Criar configuração padrão se não existir
      const defaultConfig = {
        dataInicio: "10/03/2026",
        descricaoConecte: "Principios elementares da fé.",
        descricaoLidere1: "Uma vida com propósitos.",
        descricaoLidere2: "Tornando-se um cristão apaixonado e contagiante.",
        descricaoAvance: "Kriptonita: Como destruir o que rouba a sua força.",
      };
      await db.insert(configEscolaCrescimento).values(defaultConfig);
      return defaultConfig;
    }
    return result[0];
  } catch (error) {
    void 0;
    return null;
  }
}

export async function updateConfigEscolaCrescimento(data: Partial<InsertConfigEscolaCrescimento>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const config = await getConfigEscolaCrescimento();
    if (!config) {
      // Criar nova configuração
      return await db.insert(configEscolaCrescimento).values(data as InsertConfigEscolaCrescimento);
    }
    // Atualizar configuração existente
    await db.update(configEscolaCrescimento).set(data).limit(1);
    return await getConfigEscolaCrescimento();
  } catch (error) {
    void 0;
    throw error;
  }
}

// ==================== ANEXOS LÍDERES ====================

export async function getAnexos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(anexos);
}

export async function getAnexoById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(anexos).where(eq(anexos.id, id));
  return result[0] || null;
}

export async function createAnexo(data: InsertAnexo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(anexos).values(data);
  return result.insertId;
}

export async function updateAnexo(id: number, data: Partial<InsertAnexo>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(anexos).set(data).where(eq(anexos.id, id));
}

export async function deleteAnexo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(anexos).where(eq(anexos.id, id));
}


// Pagamentos de Eventos
export async function getPagamentosEventos() {
  const pool = getSqlClient();
  if (!pool) throw new Error("Database not available");
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM pagamentos_eventos ORDER BY id DESC');
    return rows;
  } finally {
    conn.release();
  }
}

export async function getPagamentoEventoByEventoId(eventoId: number) {
  const pool = getSqlClient();
  if (!pool) throw new Error("Database not available");
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM pagamentos_eventos WHERE eventoId = ? LIMIT 1', [eventoId]);
    return (rows as any[])[0] || null;
  } finally {
    conn.release();
  }
}

export async function createPagamentoEvento(data: InsertPagamentoEvento) {
  const pool = getSqlClient();
  if (!pool) throw new Error("Database not available");
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query(
      'INSERT INTO pagamentos_eventos (eventoId, valor, qrCodeUrl, chavePix, nomeRecebedor, ativo) VALUES (?, ?, ?, ?, ?, ?)',
      [data.eventoId, data.valor, data.qrCodeUrl, data.chavePix, data.nomeRecebedor, data.ativo || 1]
    );
    const insertId = (result as any).insertId;
    return {
      id: insertId,
      eventoId: data.eventoId,
      valor: data.valor,
      qrCodeUrl: data.qrCodeUrl,
      chavePix: data.chavePix,
      nomeRecebedor: data.nomeRecebedor,
      ativo: data.ativo || 1,
    };
  } catch (error: any) {
    void 0;
    throw new Error(`Erro ao criar configuração de pagamento: ${error.message}`);
  } finally {
    conn.release();
  }
}

export async function updatePagamentoEvento(id: number, data: Partial<InsertPagamentoEvento>) {
  const pool = getSqlClient();
  if (!pool) throw new Error("Database not available");
  const conn = await pool.getConnection();
  try {
    const updates: string[] = [];
    const values: any[] = [];
    
    if (data.valor !== undefined) { updates.push('valor = ?'); values.push(data.valor); }
    if (data.qrCodeUrl !== undefined) { updates.push('qrCodeUrl = ?'); values.push(data.qrCodeUrl); }
    if (data.chavePix !== undefined) { updates.push('chavePix = ?'); values.push(data.chavePix); }
    if (data.nomeRecebedor !== undefined) { updates.push('nomeRecebedor = ?'); values.push(data.nomeRecebedor); }
    if (data.ativo !== undefined) { updates.push('ativo = ?'); values.push(data.ativo); }
    
    if (updates.length === 0) return;
    
    values.push(id);
    await conn.query(`UPDATE pagamentos_eventos SET ${updates.join(', ')} WHERE id = ?`, values);
  } finally {
    conn.release();
  }
}

export async function deletePagamentoEvento(id: number) {
  const pool = getSqlClient();
  if (!pool) throw new Error("Database not available");
  const conn = await pool.getConnection();
  try {
    await conn.query('DELETE FROM pagamentos_eventos WHERE id = ?', [id]);
  } finally {
    conn.release();
  }
}

// ==================== INSCRIÇÕES EVENTOS COM STATUS DE PAGAMENTO ====================

export async function getInscricoesEventosPagas() {
  const pool = getSqlClient();
  if (!pool) return [];
  
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT 
        ie.id,
        ie.eventoId,
        ie.nomeInscrito as nome,
        ie.emailInscrito as email,
        ie.telefoneinscrito as telefone,
        ie.celulaInscrito as celula,
        ie.createdAt,
        ie.updatedAt,
        e.titulo as eventoTitulo,
        e.data as eventoData,
        pe.id as pagamentoId,
        pe.valor,
        pe.metodo,
        pe.status as statusPagamento,
        pe.comprovante,
        pe.createdAt as dataPagamento
      FROM inscricoesEventos ie
      LEFT JOIN eventos e ON ie.eventoId = e.id
      LEFT JOIN pagamentos_eventos pe ON ie.id = pe.inscricaoId
      WHERE e.tipo IN ('evento-especial', 'special')
      ORDER BY ie.createdAt DESC
    `);
    connection.release();
    
    void 0;
    return (rows || []).map((row: any) => ({
      ...row,
      // Mapear status do banco para o formato esperado pelo app
      statusPagamento: row.statusPagamento === 'confirmado' ? 'pago' : 'nao-pago',
      dataPagamento: row.dataPagamento,
      observacoes: null,
    }));
  } catch (error) {
    void 0;
    return [];
  }
}

export async function updateInscricaoEventoStatus(inscricaoId: number, statusPagamento: string, observacoes?: string) {
  const pool = getSqlClient();
  if (!pool) throw new Error("Database not available");
  
  try {
    const connection = await pool.getConnection();
    
    // Atualizar status de pagamento na tabela pagamentos_eventos
    const statusMapeado = statusPagamento === 'pago' ? 'confirmado' : 'pendente';
    
    await connection.query(`
      UPDATE pagamentos_eventos 
      SET status = ?, updatedAt = NOW()
      WHERE inscricaoId = ?
    `, [statusMapeado, inscricaoId]);
    
    // Também atualizar o updatedAt da inscrição
    await connection.query(`
      UPDATE inscricoesEventos 
      SET updatedAt = NOW()
      WHERE id = ?
    `, [inscricaoId]);
    
    connection.release();
    void 0;
    return { success: true };
  } catch (error) {
    void 0;
    throw error;
  }
}


// ==================== CONFIGURAÇÕES DE PAGAMENTO DE EVENTOS ====================

export async function getConfigPagamentosEventos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(configPagamentosEventos).orderBy(desc(configPagamentosEventos.createdAt));
}

export async function getConfigPagamentoEventoByEventoId(eventoId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(configPagamentosEventos).where(eq(configPagamentosEventos.eventoId, eventoId));
  return result[0] || null;
}

export async function getConfigPagamentoEventoById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(configPagamentosEventos).where(eq(configPagamentosEventos.id, id));
  return result[0] || null;
}

export async function createConfigPagamentoEvento(data: InsertConfigPagamentoEvento) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.insert(configPagamentosEventos).values(data);
    const config = await getConfigPagamentoEventoByEventoId(data.eventoId);
    return config || { ...data, id: 0 };
  } catch (error: any) {
    void 0;
    throw new Error(`Erro ao criar configuração de pagamento: ${error.message}`);
  }
}

export async function updateConfigPagamentoEvento(id: number, data: Partial<InsertConfigPagamentoEvento>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.update(configPagamentosEventos).set(data).where(eq(configPagamentosEventos.id, id));
    return await getConfigPagamentoEventoById(id);
  } catch (error: any) {
    void 0;
    throw new Error(`Erro ao atualizar configuração de pagamento: ${error.message}`);
  }
}

export async function deleteConfigPagamentoEvento(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.delete(configPagamentosEventos).where(eq(configPagamentosEventos.id, id));
  } catch (error: any) {
    void 0;
    throw new Error(`Erro ao deletar configuração de pagamento: ${error.message}`);
  }
}


// ===== RECADOS IMPORTANTES =====

export async function getRecados() {
  const db = await getDb();
  if (!db) return [];
  try {
    const result = await db.select().from(recados).where(eq(recados.ativo, 1)).orderBy(desc(recados.criado_em));
    return result || [];
  } catch (error: any) {
    void 0;
    return [];
  }
}

export async function getRecadoById(id: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select().from(recados).where(and(eq(recados.id, id), eq(recados.ativo, 1)));
    return result?.[0] || null;
  } catch (error: any) {
    void 0;
    return null;
  }
}

export async function createRecado(titulo: string, conteudo: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.insert(recados).values({ titulo, conteudo, ativo: 1 });
    return result;
  } catch (error: any) {
    void 0;
    throw new Error(`Erro ao criar recado: ${error.message}`);
  }
}

export async function updateRecado(id: number, titulo: string, conteudo: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.update(recados).set({ titulo, conteudo, atualizado_em: new Date() }).where(eq(recados.id, id));
  } catch (error: any) {
    void 0;
    throw new Error(`Erro ao atualizar recado: ${error.message}`);
  }
}

export async function deleteRecado(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.update(recados).set({ ativo: 0 }).where(eq(recados.id, id));
  } catch (error: any) {
    void 0;
    throw new Error(`Erro ao deletar recado: ${error.message}`);
  }
}

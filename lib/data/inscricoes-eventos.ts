import { createTRPCClient } from '@/lib/trpc';

export interface InscricaoEvento {
  id: string;
  eventoId: string;
  eventoTitulo: string;
  eventoData: string;
  nomeCompleto: string;
  celula: string;
  telefone: string;
  createdAt: string;
}

const INSCRICOES_KEY = '@inscricoes_eventos';

// Categorias que permitem inscrição
export const CATEGORIAS_COM_INSCRICAO = ['evento-especial', 'retiro', 'conferencia'];

export function eventoPermiteInscricao(categoria: string): boolean {
  return CATEGORIAS_COM_INSCRICAO.includes(categoria);
}

// ==================== LEITURA ====================

function adapt(row: any): InscricaoEvento {
  return { id: String(row.id), eventoId: String(row.eventoId), eventoTitulo: row.eventoTitulo || '',
    eventoData: row.eventoData || '', nomeCompleto: row.nome, celula: row.celula || '',
    telefone: row.telefone || '', createdAt: String(row.createdAt || '') };
}
export async function getInscricoesEventos(): Promise<InscricaoEvento[]> {
  return (await createTRPCClient().inscricoesEventos.list.query()).map(adapt);
}
export async function getInscricoesPorEvento(eventoId: string) {
  return (await createTRPCClient().inscricoesEventos.getByEvento.query(Number(eventoId))).map(adapt);
}
export async function getInscricoesPorCelula(celula: string) {
  return (await createTRPCClient().inscricoesEventos.getByCelula.query(celula)).map(adapt);
}
export async function getInscricoesPorEventoECelula(eventoId: string, celula: string) {
  return (await getInscricoesPorCelula(celula)).filter(item => item.eventoId === eventoId);
}
export async function verificarInscricao(eventoId: string, _nomeCompleto: string) {
  return (await createTRPCClient().inscricoesEventos.minhas.query()).some(item => item.eventoId === Number(eventoId));
}
export async function criarInscricao(dados: Omit<InscricaoEvento, 'id' | 'createdAt'>): Promise<InscricaoEvento> {
  return adapt(await createTRPCClient().inscricoesEventos.create.mutate({eventoId: Number(dados.eventoId),
    nome: dados.nomeCompleto, telefone: dados.telefone, celula: dados.celula}));
}
export async function removerInscricao(id: string): Promise<boolean> {
  await createTRPCClient().inscricoesEventos.delete.mutate(Number(id));
  return true;
}

// ==================== ESTATÍSTICAS ====================

export async function getEstatisticasInscricoes() {
  const todas = await getInscricoesEventos();

  // Agrupar por evento
  const porEvento: Record<string, { titulo: string; data: string; total: number }> = {};
  todas.forEach(i => {
    if (!porEvento[i.eventoId]) {
      porEvento[i.eventoId] = { titulo: i.eventoTitulo, data: i.eventoData, total: 0 };
    }
    porEvento[i.eventoId].total++;
  });

  // Agrupar por célula
  const porCelula: Record<string, number> = {};
  todas.forEach(i => {
    porCelula[i.celula] = (porCelula[i.celula] || 0) + 1;
  });

  return {
    total: todas.length,
    porEvento: Object.entries(porEvento).map(([id, dados]) => ({ eventoId: id, ...dados })),
    porCelula: Object.entries(porCelula).map(([celula, total]) => ({ celula, total })),
  };
}


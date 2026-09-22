import { createTRPCClient } from '@/lib/trpc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getInscricoesPorCelula } from './inscricoes-eventos';

// Tipos
export interface LiderCelula {
  id: string;
  nome: string;
  celula: string;
  criadoEm: string;
}

export interface RelatorioCelula {
  id: string;
  celulaId: string;
  celulaNome: string;
  liderNome: string;
  data: string;
  totalPessoas: number;
  visitantes: number;
  criadoEm: string;
}

export interface MembroCelula {
  userId?: number;
  nome: string;
  dataNascimento: string;
  celula: string;
  inscritoBatismo: boolean;
  inscritoEventos: string[];
}

// Chaves de armazenamento
const LIDERES_KEY = '@lideres_celulas';
const RELATORIOS_KEY = '@relatorios_celulas';
const LIDER_LOGADO_KEY = '@lider_logado';

// A liderança é validada no servidor usando a conta autenticada.
export async function obterSessaoLider(): Promise<LiderCelula | null> {
  const api = createTRPCClient();
  const user = await api.auth.me.query();
  if (!user) return null;
  const leader = await api.lideres.getByUserId.query(user.id);
  if (!leader || leader.ativo !== 1) return null;
  return { id: String(leader.id), nome: leader.nome, celula: leader.celula, criadoEm: '' };
}
export async function encerrarSessaoLider() { await AsyncStorage.removeItem(LIDER_LOGADO_KEY); }

// ==================== RELATÓRIOS ====================

export async function getRelatorios(celulaNome?: string): Promise<RelatorioCelula[]> {
  try {
    const data = await AsyncStorage.getItem(RELATORIOS_KEY);
    const relatorios: RelatorioCelula[] = data ? JSON.parse(data) : [];
    if (celulaNome) {
      return relatorios.filter(r => r.celulaNome === celulaNome);
    }
    return relatorios;
  } catch {
    return [];
  }
}

export async function adicionarRelatorio(relatorio: Omit<RelatorioCelula, 'id' | 'criadoEm'>): Promise<RelatorioCelula> {
  const relatorios = await getRelatorios();
  const novoRelatorio: RelatorioCelula = {
    ...relatorio,
    id: Date.now().toString(),
    criadoEm: new Date().toISOString(),
  };
  relatorios.push(novoRelatorio);
  await AsyncStorage.setItem(RELATORIOS_KEY, JSON.stringify(relatorios));
  return novoRelatorio;
}

export async function removerRelatorio(id: string): Promise<void> {
  const relatorios = await getRelatorios();
  const filtrados = relatorios.filter(r => r.id !== id);
  await AsyncStorage.setItem(RELATORIOS_KEY, JSON.stringify(filtrados));
}

// ==================== MEMBROS DA CÉLULA ====================

export async function getMembrosDaCelula(celulaNome: string): Promise<MembroCelula[]> {
  const rows = await createTRPCClient().usuarios.getMembrosPorCelula.query(celulaNome);
  return rows.map(row => ({ userId: row.userId ?? undefined, nome: row.nome, dataNascimento: row.dataNascimento || '',
    celula: row.celula || '', inscritoBatismo: false, inscritoEventos: [] }));
}

// ==================== ANIVERSARIANTES DA CÉLULA ====================

export function getAniversariantesDaCelula(membros: MembroCelula[], mes?: number): MembroCelula[] {
  const mesAtual = mes ?? new Date().getMonth() + 1;
  
  return membros.filter(m => {
    if (!m.dataNascimento) return false;
    try {
      const parts = m.dataNascimento.split(/[\/\-]/);
      let mesMembro: number;
      
      // Tenta formato DD/MM/YYYY ou DD-MM-YYYY
      if (parts.length >= 2) {
        mesMembro = parseInt(parts[1], 10);
      } else {
        return false;
      }
      
      return mesMembro === mesAtual;
    } catch {
      return false;
    }
  });
}

// ==================== ESTATÍSTICAS ====================

export async function getEstatisticasCelula(celulaNome: string): Promise<{
  totalMembros: number;
  aniversariantesMes: number;
  inscritosEventos: number;
  totalRelatorios: number;
  mediaPresenca: number;
  mediaVisitantes: number;
}> {
  const membros = await getMembrosDaCelula(celulaNome);
  const aniversariantes = getAniversariantesDaCelula(membros);
  const relatorios = await getRelatorios(celulaNome);
  
  const inscricoes = await getInscricoesPorCelula(celulaNome);
  const inscritosEventos = inscricoes.length;
  
  const mediaPresenca = relatorios.length > 0
    ? Math.round(relatorios.reduce((acc, r) => acc + r.totalPessoas, 0) / relatorios.length)
    : 0;
    
  const mediaVisitantes = relatorios.length > 0
    ? Math.round(relatorios.reduce((acc, r) => acc + r.visitantes, 0) / relatorios.length)
    : 0;
  
  return {
    totalMembros: membros.length,
    aniversariantesMes: aniversariantes.length,
    inscritosEventos,
    totalRelatorios: relatorios.length,
    mediaPresenca,
    mediaVisitantes,
  };
}

import AsyncStorage from '@react-native-async-storage/async-storage';

export type PrayerCategory = "saude" | "familia" | "trabalho" | "espiritual" | "outros";

export interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  category: PrayerCategory;
  author: string;
  date: string;
  prayingCount: number;
  isAnswered: boolean;
  testimony?: string;
}

export const categoryLabels: Record<PrayerCategory, string> = {
  saude: "Saúde",
  familia: "Família",
  trabalho: "Trabalho",
  espiritual: "Espiritual",
  outros: "Outros",
};

export const categoryEmojis: Record<PrayerCategory, string> = {
  saude: "🏥",
  familia: "👨‍👩‍👧‍👦",
  trabalho: "💼",
  espiritual: "✨",
  outros: "🙏",
};

// Dados iniciais (seed)
const PEDIDOS_INICIAIS: PrayerRequest[] = [];

const PEDIDOS_KEY = '@pedidos_oracao';
const PEDIDOS_INICIALIZADOS_KEY = '@pedidos_oracao_init';

// ==================== LEITURA ====================

export async function getPedidosOracao(): Promise<PrayerRequest[]> {
  try {
    const init = await AsyncStorage.getItem(PEDIDOS_INICIALIZADOS_KEY);
    if (!init) {
      await AsyncStorage.setItem(PEDIDOS_KEY, JSON.stringify(PEDIDOS_INICIAIS));
      await AsyncStorage.setItem(PEDIDOS_INICIALIZADOS_KEY, 'true');
      return PEDIDOS_INICIAIS;
    }
    const data = await AsyncStorage.getItem(PEDIDOS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return PEDIDOS_INICIAIS;
  }
}

export async function getPedidoById(id: string): Promise<PrayerRequest | null> {
  const todos = await getPedidosOracao();
  return todos.find(p => p.id === id) || null;
}

// ==================== CRIAÇÃO ====================

export async function criarPedido(dados: Omit<PrayerRequest, 'id' | 'prayingCount' | 'isAnswered'>): Promise<PrayerRequest> {
  const todos = await getPedidosOracao();
  const novo: PrayerRequest = {
    ...dados,
    id: Date.now().toString(),
    prayingCount: 0,
    isAnswered: false,
  };
  todos.push(novo);
  await AsyncStorage.setItem(PEDIDOS_KEY, JSON.stringify(todos));
  return novo;
}

// ==================== EDIÇÃO ====================

export async function editarPedido(id: string, dados: Partial<PrayerRequest>): Promise<PrayerRequest | null> {
  const todos = await getPedidosOracao();
  const index = todos.findIndex(p => p.id === id);
  if (index < 0) return null;
  todos[index] = { ...todos[index], ...dados };
  await AsyncStorage.setItem(PEDIDOS_KEY, JSON.stringify(todos));
  return todos[index];
}

export async function marcarRespondido(id: string, testimony?: string): Promise<boolean> {
  const todos = await getPedidosOracao();
  const index = todos.findIndex(p => p.id === id);
  if (index < 0) return false;
  todos[index].isAnswered = true;
  if (testimony) todos[index].testimony = testimony;
  await AsyncStorage.setItem(PEDIDOS_KEY, JSON.stringify(todos));
  return true;
}

// ==================== REMOÇÃO ====================

export async function removerPedido(id: string): Promise<boolean> {
  const todos = await getPedidosOracao();
  const filtrados = todos.filter(p => p.id !== id);
  if (filtrados.length === todos.length) return false;
  await AsyncStorage.setItem(PEDIDOS_KEY, JSON.stringify(filtrados));
  return true;
}

// Compatibilidade
export const mockPrayerRequests: PrayerRequest[] = PEDIDOS_INICIAIS;


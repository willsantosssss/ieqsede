import { trpc } from '@/lib/trpc';
export function useLeader() {
  const me = trpc.auth.me.useQuery(undefined, { staleTime: 0 });
  const leader = trpc.lideres.getByUserId.useQuery(me.data?.id ?? 0, { enabled: !!me.data, staleTime: 0 });
  return leader.data?.ativo === 1 ? leader.data : null;
}

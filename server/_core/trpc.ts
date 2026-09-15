import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import type { TrpcContext } from './context';
import { accessLevel } from '../security/access.mjs';
import { getLiderByUserId } from '../db';
const t = initTRPC.context<TrpcContext>().create({ transformer: superjson });
export const router = t.router;
const guarded = t.procedure.use(async ({ ctx, path, type, getRawInput, next }) => {
  const level = accessLevel(path, type);
  if (level === 'public') return next();
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
  if (ctx.user.role === 'admin' || level === 'member') return next();
  const input: any = await getRawInput();
  if (level === 'self' && input === ctx.user.id) return next();
  if (level === 'leader') {
    const leader = await getLiderByUserId(ctx.user.id);
    if (leader?.ativo === 1) {
      if (path.startsWith('anexos.')) return next();
      const requestedId = typeof input === 'object' ? input?.liderId : input;
      const requestedCell = typeof input === 'object' ? input?.celula : input;
      if (path === 'relatorios.create' && requestedId === leader.id && requestedCell === leader.celula) return next();
      if (['relatorios.getByLiderId', 'relatorios.getByLiderIdWithFilters'].includes(path) && requestedId === leader.id) return next();
      if (['relatorios.getByCelula', 'usuarios.getMembrosPorCelula', 'inscricoesEventos.getByCelula', 'escolaCrescimento.getByCelula'].includes(path) && requestedCell === leader.celula) return next();
    }
  }
  throw new TRPCError({ code: 'FORBIDDEN' });
});
export const publicProcedure = guarded;
export const protectedProcedure = guarded.use(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { ...ctx, user: ctx.user } });
});
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
  return next();
});

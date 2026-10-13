import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import type { User } from '../../drizzle/schema';
import { sdk } from './sdk';
export type TrpcContext = { req: CreateExpressContextOptions['req']; res: CreateExpressContextOptions['res']; user: User | null; sdk: typeof sdk };
export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;
  try { user = await sdk.authenticateRequest(opts.req); } catch { /* Public calls can be anonymous. */ }
  return { req: opts.req, res: opts.res, user, sdk };
}

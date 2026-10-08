import { createHash, randomBytes } from 'node:crypto';
import { and, eq, gt } from 'drizzle-orm';
import { parse } from 'cookie';
import { sessions, users } from '../../drizzle/schema';
import { getDb } from '../db';
import { COOKIE_NAME } from '../../shared/const';
export const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const digest = (token: string) => createHash('sha256').update(token).digest('hex');
export function requestToken(req: any): string | undefined {
  const bearer = req.headers.authorization;
  if (typeof bearer === 'string' && bearer.startsWith('Bearer ')) return bearer.slice(7).trim();
  return parse(req.headers.cookie || '')[COOKIE_NAME];
}
export const sdk = {
  async createSessionToken(openId: string, _options: { name?: string } = {}) {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const [user] = await db.select().from(users).where(eq(users.openId, openId));
    if (!user) throw new Error('User not found');
    const token = randomBytes(32).toString('hex');
    await db.insert(sessions).values({ tokenHash: digest(token), userId: user.id, expiresAt: new Date(Date.now() + SESSION_MS) });
    return token;
  },
  async authenticateRequest(req: any) {
    const token = requestToken(req);
    if (!token || !/^[a-f0-9]{64}$/.test(token)) throw new Error('Invalid session');
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const [row] = await db.select({ user: users }).from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(and(eq(sessions.tokenHash, digest(token)), gt(sessions.expiresAt, new Date())));
    if (!row) throw new Error('Invalid session');
    return row.user;
  },
  async revokeRequest(req: any) {
    const token = requestToken(req);
    const db = await getDb();
    if (token && db) await db.delete(sessions).where(eq(sessions.tokenHash, digest(token)));
  },
};

import { randomUUID } from 'node:crypto';
import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { getDb } from './db';
import { hashPassword, verifyPassword } from './security/passwords.mjs';

export async function signupUser(email: string, password: string, name: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  email = email.trim().toLowerCase();
  const hashed = await hashPassword(password);
  try {
    await db.insert(users).values({ email, name: name.trim(), password: hashed, openId: randomUUID(), loginMethod: 'email', role: 'user' });
  } catch { throw new Error('Não foi possível criar a conta com esses dados.'); }
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return { success: true, userId: user.id, email: user.email, name: user.name, openId: user.openId };
}
const dummyHash = hashPassword(randomUUID());
export async function loginUser(email: string, password: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const [user] = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase()));
  const valid = await verifyPassword(password, user?.password || await dummyHash);
  if (!user || !valid) throw new Error('Email ou senha incorretos.');
  return { success: true, userId: user.id, email: user.email, name: user.name, openId: user.openId };
}

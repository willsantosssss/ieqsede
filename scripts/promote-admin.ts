import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { users } from '../drizzle/schema';
import { getDb, getSqlClient } from '../server/db';
import { databaseUrl } from '../server/security/database-config.mjs';
async function main() {
  databaseUrl(process.env);
  const email=process.argv[2]?.trim().toLowerCase();
  if(!email) throw new Error('Informe o email da conta já cadastrada no banco novo.');
  const db=await getDb();
  if(!db) throw new Error('Banco indisponível');
  const [user]=await db.select().from(users).where(eq(users.email,email));
  if(!user) throw new Error('Conta não encontrada. Cadastre pelo app primeiro.');
  await db.update(users).set({role:'admin'}).where(eq(users.id,user.id));
}
main().finally(async()=>{await getSqlClient()?.end();});

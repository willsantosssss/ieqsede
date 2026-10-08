import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { databaseUrl } from './server/security/database-config.mjs';
export default defineConfig({
  schema: './drizzle/schema.ts', out: './drizzle/migrations', dialect: 'mysql',
  ...(process.env.DATABASE_URL ? { dbCredentials: { url: databaseUrl(process.env) } } : {}),
});

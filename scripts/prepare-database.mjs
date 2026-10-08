import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL não está configurada; não foi possível preparar o banco.');
  process.exit(1);
}

const sqlPath = new URL('./prepare-database.sql', import.meta.url);
const sql = await readFile(sqlPath, 'utf8');
const statements = sql
  .split(/;\s*(?:\r?\n|$)/)
  .map((statement) => statement.trim())
  .filter(Boolean);

if (statements.some((statement) => /^\s*(?:DROP|TRUNCATE|DELETE|UPDATE|INSERT)\b/i.test(statement))) {
  throw new Error('O preparo estrutural contém uma operação de dados proibida.');
}

const connection = await mysql.createConnection(databaseUrl);
try {
  for (const originalStatement of statements) {
    const addColumn = originalStatement.match(
      /^ALTER TABLE `([^`]+)` ADD COLUMN IF NOT EXISTS `([^`]+)`\s+([\s\S]+)$/i,
    );

    if (addColumn) {
      const [, tableName, columnName, definition] = addColumn;
      const [columns] = await connection.query(
        'SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1',
        [tableName, columnName],
      );
      if (columns.length > 0) continue;

      await connection.query(
        `ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${definition}`,
      );
      continue;
    }

    await connection.query(originalStatement);
  }

  const [tables] = await connection.query(
    'SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = \'BASE TABLE\'',
  );
  const tableCount = Number(tables[0]?.count ?? 0);
  console.log(JSON.stringify({ ok: true, statements: statements.length, tables: tableCount, dataCopied: false }));
} finally {
  await connection.end();
}

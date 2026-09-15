import assert from 'node:assert/strict';
import test from 'node:test';
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';

// Never accepts DATABASE_URL or a remote/production target.
const target = process.env.IEQ_TEST_DATABASE_URL;
test('MySQL: migrations, authentication, revocation and ownership', { skip: !target }, async () => {
  const url = new URL(target!);
  assert.equal(url.protocol, 'mysql:');
  assert.ok(['127.0.0.1', 'localhost'].includes(url.hostname));
  assert.equal(url.pathname, '/ieqsede_test');
  process.env.DATABASE_URL = target;
  delete process.env.ALLOW_REMOTE_DATABASE;
  const connection = await mysql.createConnection(target!);
  const db = await import('../server/db');
  try {
    const [existing] = await connection.query<any[]>('SHOW TABLES');
    assert.equal(existing.length, 0, 'Requires a NEW empty database');
    await migrate(drizzle(connection), { migrationsFolder: './drizzle/migrations' });
    const [tables] = await connection.query<any[]>('SHOW TABLES');
    assert.ok(tables.length >= 23);
    const { signupUser, loginUser } = await import('../server/auth-simple');
    const { sdk } = await import('../server/_core/sdk');
    const { appRouter } = await import('../server/routers');
    const a = await signupUser('a@example.invalid', 'Teste-isolado-123!', 'Pessoa A');
    const b = await signupUser('b@example.invalid', 'Teste-isolado-456!', 'Pessoa B');
    assert.equal((await loginUser(' A@EXAMPLE.INVALID ', 'Teste-isolado-123!')).userId, a.userId);
    await assert.rejects(loginUser('a@example.invalid', 'senha-errada'));
    await assert.rejects(signupUser('A@example.invalid', 'Teste-isolado-123!', 'Duplicado'));
    const token = await sdk.createSessionToken(a.openId!);
    const req = { headers: { authorization: 'Bearer ' + token } };
    const user = await sdk.authenticateRequest(req);
    assert.equal(user.id, a.userId);
    assert.equal(user.role, 'user');
    const api = appRouter.createCaller({user, req, res: { clearCookie() {} }, sdk} as any);
    assert.ok(!('password' in (await api.auth.me())!));
    await assert.rejects(api.eventos.delete({id:1}), (e:any) => e.code === 'FORBIDDEN');
    await connection.execute('INSERT INTO anotacoesDevocional (userId, livro, capitulo, texto) VALUES (?, ?, ?, ?)', [b.userId, 'João', 1, 'Privado B']);
    const [notes] = await connection.query<any[]>('SELECT id FROM anotacoesDevocional WHERE userId = ?', [b.userId]);
    await api.anotacoesDevocional.update({id: notes[0].id, texto:'Tentativa A'});
    const [after] = await connection.query<any[]>('SELECT texto FROM anotacoesDevocional WHERE id = ?', [notes[0].id]);
    assert.equal(after[0].texto, 'Privado B');
    await sdk.revokeRequest(req);
    await assert.rejects(sdk.authenticateRequest(req));
    console.log('PASS: migrations, normalized login, bad password, duplicate email, session, role, safe profile, admin restriction, note ownership, revocation.');
  } finally {
    await connection.end();
    await db.getSqlClient()?.end();
  }
});

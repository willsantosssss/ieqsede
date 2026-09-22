import assert from 'node:assert/strict';
import test from 'node:test';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createHash } from 'node:crypto';
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
    // Real member/admin CRUD and data boundaries, without database mocks.
    await api.usuarios.create({nome:'Pessoa A', celula:'A', dataNascimento:'1990-09-22'});
    await db.upsertUsuarioCadastrado({userId:b.userId, nome:'Pessoa B', celula:'B', dataNascimento:'1991-09-23'});
    const birthdays = await api.usuarios.getAniversariantes(9);
    assert.equal(birthdays.length, 2);
    assert.deepEqual(Object.keys(birthdays[0]).sort(), ['celula','dia','mes','nome']);
    await connection.execute("UPDATE users SET role = 'admin' WHERE id = ?", [b.userId]);
    const adminToken = await sdk.createSessionToken(b.openId!);
    const adminReq = {headers:{authorization:'Bearer '+adminToken}};
    const admin = appRouter.createCaller({user:await sdk.authenticateRequest(adminReq),req:adminReq,res:{},sdk} as any);
    await admin.eventos.create({titulo:'Evento teste', descricao:'Fictício', data:'2026-10-03', horario:'10:00', local:'Teste', tipo:'retiro', requireInscricao:1});
    const events = await api.eventos.list();
    const eventId = events[0].id;
    await api.inscricoesEventos.create({eventoId:eventId,nome:'Pessoa A',telefone:'000000000',celula:'A',userId:b.userId});
    const own = await api.inscricoesEventos.minhas();
    assert.equal(own.length,1);
    assert.equal(own[0].userId,a.userId, 'client cannot assign another owner');
    assert.equal((await admin.inscricoesEventos.minhas()).length,0);
    await assert.rejects(api.inscricoesEventos.list(), (e:any) => e.code === 'FORBIDDEN');
    await connection.execute('INSERT INTO lideres (userId,nome,celula,telefone) VALUES (?,?,?,?)',[a.userId,'Pessoa A','A','000']);
    assert.equal((await api.usuarios.getMembrosPorCelula('A')).length,1);
    await assert.rejects(api.usuarios.getMembrosPorCelula('B'), (e:any) => e.code === 'FORBIDDEN');
    await connection.execute('UPDATE lideres SET ativo = 0 WHERE userId = ?',[a.userId]);
    await assert.rejects(api.usuarios.getMembrosPorCelula('A'), (e:any) => e.code === 'FORBIDDEN');
    await admin.eventos.update({id:eventId,data:{titulo:'Atualizado'}});
    assert.equal((await api.eventos.getById(eventId))?.titulo,'Atualizado');
    await admin.inscricoesEventos.delete(own[0].id);
    assert.equal((await api.inscricoesEventos.minhas()).length,0);
    await admin.eventos.delete({id:eventId});
    assert.equal((await api.eventos.list()).length,0);
    const expired = await sdk.createSessionToken(a.openId!);
    await connection.execute('UPDATE sessions SET expiresAt = ? WHERE tokenHash = ?', [new Date(0),createHash('sha256').update(expired).digest('hex')]);
    await assert.rejects(sdk.authenticateRequest({headers:{authorization:'Bearer '+expired}}));

    // Real HTTP server: cookies, session revocation, CORS and web navigation.
    const base = 'http://127.0.0.1:32147';
    const child = spawn(process.execPath, ['dist/index.js'], {env:{...process.env,NODE_ENV:'development',HOST:'127.0.0.1',PORT:'32147',CORS_ORIGINS:base},stdio:'pipe'});
    let serverLog = '';
    child.stderr.on('data', chunk => { serverLog += chunk.toString(); });
    try {
      let ready = false;
      for (let n=0;n<60;n++) {
        try { ready = (await fetch(base+'/api/ready')).ok; } catch {}
        if(ready) break;
        await new Promise(resolve=>setTimeout(resolve,250));
      }
      assert.ok(ready,serverLog);
      const login = await fetch(base+'/api/trpc/auth.login',{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify({json:{email:'a@example.invalid',password:'Teste-isolado-123!'}})});
      assert.equal(login.status,200,await login.clone().text());
      const cookieHeader = login.headers.get('set-cookie')!;
      assert.match(cookieHeader,/HttpOnly/i);
      assert.match(cookieHeader,/SameSite=Lax/i);
      const cookie = cookieHeader.split(';')[0];
      assert.equal((await fetch(base+'/api/auth/me',{headers:{Cookie:cookie}})).status,200);
      assert.equal((await fetch(base+'/api/auth/me',{headers:{Cookie:cookie,Origin:'https://other.invalid'}})).status,403);
      for(const route of ['/', '/login', '/agenda']) {
        const response = await fetch(base+route);
        assert.equal(response.status,200);
        assert.match(response.headers.get('content-type')!,/text\/html/);
      }
      assert.equal((await fetch(base+'/api/auth/logout',{method:'POST',headers:{Cookie:cookie,Origin:base}})).status,200);
      assert.equal((await fetch(base+'/api/auth/me',{headers:{Cookie:cookie}})).status,401);
    } finally {
      if(child.exitCode === null) { const stopped = once(child,'exit'); child.kill(); await stopped; }
    }
    await sdk.revokeRequest(req);
    await assert.rejects(sdk.authenticateRequest(req));
    console.log('PASS: migrations, normalized login, bad password, duplicate email, session, role, safe profile, admin restriction, note ownership, revocation.');
  } finally {
    await connection.end();
    await db.getSqlClient()?.end();
  }
});

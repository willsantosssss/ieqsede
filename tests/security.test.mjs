import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../server/security/passwords.mjs';
import { accessLevel } from '../server/security/access.mjs';
import { databaseUrl } from '../server/security/database-config.mjs';
test('senhas usam salt aleatório e rejeitam senha incorreta e hashes antigos', async () => {
  const password='Exemplo de senha forte!';
  const a=await hashPassword(password); const b=await hashPassword(password);
  assert.notEqual(a,b);
  assert.equal(await verifyPassword(password,a),true);
  assert.equal(await verifyPassword('incorreta',a),false);
  assert.equal(await verifyPassword(password,'0'.repeat(64)),false);
  assert.equal(await verifyPassword(password,'scrypt$9999999999$8$3$x$y'),false);
  await assert.rejects(()=>hashPassword('curta'));
});
test('operações destrutivas e dados privados nunca são públicos', () => {
  for(const route of ['eventos.delete','usuarios.deleteUser','usuarios.list','inscricoes.list','lideres.create','recados.create','qualquer.rotaNova']) assert.equal(accessLevel(route,'mutation'),'admin');
  assert.equal(accessLevel('usuarios.list','query'),'admin');
  assert.equal(accessLevel('auth.login','mutation'),'public');
  assert.equal(accessLevel('eventos.list','query'),'public');
  assert.equal(accessLevel('eventos.list','mutation'),'admin');
  assert.equal(accessLevel('anotacoesDevocional.delete','mutation'),'member');
  assert.equal(accessLevel('lideres.getByUserId','query'),'self');
  assert.equal(accessLevel('relatorios.create','mutation'),'leader');
});
test('banco remoto exige configuração explícita, sem fallback de produção', () => {
  assert.throws(()=>databaseUrl({}));
  assert.throws(()=>databaseUrl({DATABASE_URL:'mysql://user:pass@remote.invalid/app'}));
  assert.throws(()=>databaseUrl({DATABASE_URL:'postgres://localhost/app'}));
  assert.equal(databaseUrl({DATABASE_URL:'mysql://localhost/ieqsede'}),'mysql://localhost/ieqsede');
});

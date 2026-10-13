export function databaseUrl(env) {
  if (!env.DATABASE_URL) throw new Error('Configure um banco novo em DATABASE_URL.');
  const url = new URL(env.DATABASE_URL);
  if (url.protocol !== 'mysql:') throw new Error('O banco deve ser MySQL.');
  if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) && env.ALLOW_REMOTE_DATABASE !== 'true') {
    throw new Error('Banco remoto bloqueado. Confirme o isolamento antes de definir ALLOW_REMOTE_DATABASE=true.');
  }
  return env.DATABASE_URL;
}

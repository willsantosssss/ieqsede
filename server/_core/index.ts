import 'dotenv/config';
import express from 'express';
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs/promises';
import multer from 'multer';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from '../routers';
import { createContext } from './context';
import { sdk } from './sdk';
import { COOKIE_NAME } from '../../shared/const';
import { getSessionCookieOptions } from './cookies';
import { databaseUrl } from '../security/database-config.mjs';
import { getLiderByUserId, getSqlClient } from '../db';

const app = express();
app.disable('x-powered-by');
// Trust only explicitly configured proxy IPs/subnets, never arbitrary forwarded headers.
const trustedProxies = (process.env.TRUSTED_PROXIES || '').split(',').map((s: string) => s.trim()).filter(Boolean);
if (trustedProxies.length) app.set('trust proxy', trustedProxies);
const origins = new Set((process.env.CORS_ORIGINS || 'http://localhost:8081').split(',').map((s: string) => s.trim()));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const origin = req.headers.origin;
  if (origin && !origins.has(origin)) { res.sendStatus(403); return; }
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  }
  if (req.method === 'OPTIONS') { res.sendStatus(204); return; }
  next();
});
// Bound attempts and memory on a single instance. Shared limiter required before horizontal scaling.
const attempts = new Map<string, { count: number; until: number }>();
app.use('/api', (req, res, next) => {
  const now = Date.now();
  for (const [key, item] of attempts) if (item.until <= now) attempts.delete(key);
  const auth = /auth\.(login|signup)/.test(req.path);
  const key = (req.ip || req.socket.remoteAddress || 'unknown') + (auth ? ':auth' : ':api');
  const item = attempts.get(key) || { count: 0, until: now + 60000 };
  if (++item.count > (auth ? 10 : 300) || (!attempts.has(key) && attempts.size >= 10000)) {
    res.setHeader('Retry-After', '60'); res.sendStatus(429); return;
  }
  attempts.set(key, item); next();
});
app.use(express.json({ limit: '256kb' }));
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/ready', async (_req, res) => {
  try {
    const pool = getSqlClient();
    if (!pool) throw new Error('Database unavailable');
    await pool.query({ sql: 'SELECT 1 FROM users LIMIT 1', timeout: 3000 });
    res.json({ ok: true });
  } catch { res.status(503).json({ ok: false }); }
});
app.get('/api/auth/me', async (req, res) => {
  try { const { password, ...user } = await sdk.authenticateRequest(req); res.json({ user }); }
  catch { res.status(401).json({ user: null }); }
});
app.post('/api/auth/logout', async (req, res) => {
  await sdk.revokeRequest(req);
  res.clearCookie(COOKIE_NAME, getSessionCookieOptions(req));
  res.json({ success: true });
});
const uploadsDir = path.resolve(process.env.UPLOADS_DIR || 'uploads');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 5 } });
app.post('/api/upload', async (req, res, next) => {
  try {
    const user = await sdk.authenticateRequest(req);
    if (user.role !== 'admin') { res.sendStatus(403); return; }
    next();
  } catch { res.sendStatus(401); }
}, upload.single('file'), async (req, res) => {
  if (!req.file || req.file.buffer.subarray(0, 5).toString() !== '%PDF-') {
    res.status(400).json({ error: 'Envie um PDF de até 10 MB.' }); return;
  }
  await fs.mkdir(uploadsDir, { recursive: true });
  const filename = randomUUID() + '.pdf';
  await fs.writeFile(path.join(uploadsDir, filename), req.file.buffer, { flag: 'wx' });
  res.json({ url: '/api/files/' + filename, fileName: req.file.originalname });
});
app.get('/api/files/:filename', async (req, res) => {
  try {
    const user = await sdk.authenticateRequest(req);
    const leader = user.role === 'admin' ? null : await getLiderByUserId(user.id);
    if (user.role !== 'admin' && leader?.ativo !== 1) { res.sendStatus(403); return; }
  } catch { res.sendStatus(401); return; }
  const filename = String(req.params.filename);
  if (!/^[a-f0-9-]{36}\.pdf$/.test(filename)) { res.sendStatus(404); return; }
  res.download(path.join(uploadsDir, filename), filename, err => {
    if (err && !res.headersSent) res.sendStatus(404);
  });
});
app.use('/api/trpc', createExpressMiddleware({ router: appRouter, createContext, allowBatching: false }));
// Serve the exported web app with the API on the same origin for HttpOnly cookies.
const webRoot = path.resolve('dist/app');
app.use(express.static(webRoot));
app.get('/{*route}', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(webRoot, 'index.html'), error => { if (error) next(error); });
});
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(error instanceof multer.MulterError ? 400 : 500).json({ error: 'Não foi possível concluir a operação.' });
});
databaseUrl(process.env);
createServer(app).listen(Number(process.env.PORT || 3000), process.env.HOST || '127.0.0.1');

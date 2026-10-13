import type { CookieOptions, Request } from 'express';
export function getSessionCookieOptions(_req: Request): CookieOptions {
  return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' };
}

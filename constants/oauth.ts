export const SESSION_TOKEN_KEY = 'ieqsede-session';

export const USER_INFO_KEY = 'ieqsede-user-info';

export const APP_ID = 'ieqsede';

export const DEFAULT_API_BASE_URL = 'https://ieqsede-production.up.railway.app';

export const OWNER_OPEN_ID = '';

export const OWNER_NAME = '';

export const OAUTH_PORTAL_URL = '';

export const OAUTH_SERVER_URL = '';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;

export function getApiBaseUrl() {
 
 const browserOrigin = typeof window !== 'undefined' ? window.location?.origin : undefined;
 
 const fallback = browserOrigin && !/^https?:\/\/(localhost|127\.0\.0\.1)(:|$)/.test(browserOrigin) ? browserOrigin : DEFAULT_API_BASE_URL;
 
 const value=(process.env.EXPO_PUBLIC_API_BASE_URL || fallback).replace(/\/$/,'');
 
 const url=new URL(value);
 
 if(url.protocol!=='https:' && !['localhost','127.0.0.1'].includes(url.hostname)) throw new Error('A API remota deve usar HTTPS.');
 
 return value;
 
}

export const getRedirectUri=()=> 'ieqsede://oauth/callback';

export const getLoginUrl=()=> { throw new Error('Use o login com email e senha.'); };

export async function startOAuthLogin(): Promise<string|null> { return getLoginUrl(); }









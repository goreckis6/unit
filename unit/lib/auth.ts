import { cookies } from 'next/headers';

const SESSION_COOKIE = 'admin_session';
const SECRET = process.env.ADMIN_SESSION_SECRET || 'change-me-in-production';

function encodeBase64(data: string): string {
  return Buffer.from(data, 'utf8').toString('base64url');
}

function decodeBase64(data: string): string {
  return Buffer.from(data, 'base64url').toString('utf8');
}

function sign(data: string): string {
  const crypto = require('crypto');
  return crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
}

export function createSession(email: string): string {
  const payload = JSON.stringify({ email, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  const encoded = encodeBase64(payload);
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifySession(token: string): { email: string } | null {
  try {
    const [encoded, signature] = token.split('.');
    if (!encoded || !signature) return null;
    const expected = sign(encoded);
    if (signature !== expected) return null;
    const payload = JSON.parse(decodeBase64(encoded));
    if (payload.exp < Date.now()) return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<{ email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return token ? verifySession(token) : null;
}

export async function setSessionCookie(email: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSession(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

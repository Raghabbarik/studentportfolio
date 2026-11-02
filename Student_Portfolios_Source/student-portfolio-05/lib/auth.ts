import { env } from 'cloudflare:workers';

export const ADMIN_DEFAULT_EMAIL = 'student5techxera@gmail.com';
export const ADMIN_DEFAULT_PASSWORD = 'Student5@2026';
const DEFAULT_SECRET = 'portfolio-journal-jwt-secret-key-student-05-2026-secure';

export function getAdminEmail(): string {
  const custom = (env as unknown as { ADMIN_EMAIL?: string })?.ADMIN_EMAIL;
  return (custom || ADMIN_DEFAULT_EMAIL).toLowerCase();
}

export function getAdminPassword(): string {
  const custom = (env as unknown as { ADMIN_PASSWORD?: string })?.ADMIN_PASSWORD;
  return custom || ADMIN_DEFAULT_PASSWORD;
}

export function getJwtSecret(): string {
  const custom = (env as unknown as { JWT_SECRET?: string })?.JWT_SECRET;
  return custom || DEFAULT_SECRET;
}

function base64UrlEncode(data: Uint8Array): string {
  let str = '';
  for (let i = 0; i < data.length; i++) {
    str += String.fromCharCode(data[i]);
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signAdminToken(
  email: string,
  expiresInSeconds = 7 * 24 * 3600
): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: email.toLowerCase(),
    role: 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };

  const enc = new TextEncoder();
  const headerPart = base64UrlEncode(enc.encode(JSON.stringify(header)));
  const payloadPart = base64UrlEncode(enc.encode(JSON.stringify(payload)));
  const data = enc.encode(`${headerPart}.${payloadPart}`);

  const key = await getCryptoKey(getJwtSecret());
  const signature = await crypto.subtle.sign('HMAC', key, data);
  const signaturePart = base64UrlEncode(new Uint8Array(signature));

  return `${headerPart}.${payloadPart}.${signaturePart}`;
}

export async function verifyAdminToken(
  tokenOrReq: string | Request | null | undefined
): Promise<{ email: string; role: string } | null> {
  let token: string | null = null;

  if (typeof tokenOrReq === 'string') {
    token = tokenOrReq;
  } else if (tokenOrReq && typeof (tokenOrReq as Request).headers?.get === 'function') {
    const req = tokenOrReq as Request;
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader.match(/(?:^|;\s*)admin_token=([^;]+)/);
      token = match ? decodeURIComponent(match[1]) : null;
    }
  }

  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerPart, payloadPart, signaturePart] = parts;
    const enc = new TextEncoder();
    const data = enc.encode(`${headerPart}.${payloadPart}`);
    const signature = base64UrlDecode(signaturePart);

    const key = await getCryptoKey(getJwtSecret());
    const valid = await crypto.subtle.verify('HMAC', key, signature as unknown as BufferSource, data);
    if (!valid) return null;

    const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadPart));
    const payload = JSON.parse(payloadJson) as { sub?: string; role?: string; exp?: number };

    if (!payload.sub || payload.role !== 'admin') return null;
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;

    return { email: payload.sub, role: 'admin' };
  } catch {
    return null;
  }
}

export function validateAdminCredentials(email: string, pass: string): boolean {
  if (!email || !pass) return false;
  return (
    email.trim().toLowerCase() === getAdminEmail() &&
    pass === getAdminPassword()
  );
}

export function getAdminCookie(token: string): string {
  return `admin_token=${encodeURIComponent(
    token
  )}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`;
}

export function getClearAdminCookie(): string {
  return `admin_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}


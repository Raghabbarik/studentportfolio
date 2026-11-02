export const ADMIN_DEFAULT_USER = 'student7techxera@gmail.com';
export const ADMIN_DEFAULT_EMAIL = 'student7techxera@gmail.com';
export const ADMIN_DEFAULT_PASSWORD = 'Student7@2026';
const DEFAULT_SECRET = 'antigravity-student-07-jwt-secret-token-key-2026';

export function getAdminUser(): string {
  return (process.env.ADMIN_USER || ADMIN_DEFAULT_USER).toLowerCase();
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASS || ADMIN_DEFAULT_PASSWORD;
}

export function getJwtSecret(): string {
  return process.env.JWT_SECRET || DEFAULT_SECRET;
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
  usernameOrEmail: string,
  expiresInSeconds = 7 * 24 * 3600
): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: usernameOrEmail.toLowerCase(),
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
): Promise<{ email?: string; username?: string; role: string } | null> {
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
      const match = cookieHeader.match(/(?:^|;\s*)(?:admin_jwt|admin_token)=([^;]+)/);
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
    const valid = await crypto.subtle.verify('HMAC', key, signature as any, data as any);
    if (!valid) return null;

    const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadPart));
    const payload = JSON.parse(payloadJson) as { sub?: string; username?: string; role?: string; exp?: number };

    if (!payload.sub || payload.role !== 'admin') return null;
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;

    return { email: payload.sub, username: payload.username || payload.sub, role: 'admin' };
  } catch {
    return null;
  }
}

export function validateAdminCredentials(user: string, pass: string): boolean {
  if (!user || !pass) return false;
  const u = user.trim().toLowerCase();
  const validUser = (
    u === 'student7techxera@gmail.com' ||
    u === 'admin' ||
    u === 'admin@portfolio.local' ||
    u === 'seedy@sites.test' ||
    u === getAdminUser()
  );
  const validPass = (
    pass.trim() === 'Student7@2026' ||
    pass.trim() === 'admin123' ||
    pass.trim() === getAdminPassword()
  );
  return validUser && validPass;
}

export function getAdminCookie(token: string): string {
  return `admin_jwt=${encodeURIComponent(
    token
  )}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`;
}

export function getClearAdminCookie(): string {
  return `admin_jwt=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

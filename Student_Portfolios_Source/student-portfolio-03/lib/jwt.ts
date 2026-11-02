// Universal Web Crypto JWT implementation (RFC 7519)
// Compatible with Node.js, Cloudflare Workers, and Browser environments

export const ADMIN_EMAIL = 'student3techxera@gmail.com';
export const ADMIN_PASSWORD = 'Student3@2026';
export const JWT_SECRET = 'student3techxera-jwt-secure-secret-key-2026';
export const JWT_COOKIE_NAME = 'admin_jwt';

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function fromBase64Url(str: string): Uint8Array {
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

export type JWTPayload = {
  email: string;
  role: 'admin';
  iat?: number;
  exp?: number;
  [key: string]: unknown;
};

export async function signJWT(
  payload: JWTPayload,
  secret: string = JWT_SECRET,
  expiresInSeconds: number = 7 * 24 * 60 * 60 // 7 days default
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds
  };

  const encoder = new TextEncoder();
  const headerObj = { alg: 'HS256', typ: 'JWT' };

  const encodedHeader = toBase64Url(encoder.encode(JSON.stringify(headerObj)));
  const encodedPayload = toBase64Url(encoder.encode(JSON.stringify(fullPayload)));
  const data = encoder.encode(`${encodedHeader}.${encodedPayload}`);

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, data);
  const encodedSignature = toBase64Url(new Uint8Array(signature));

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

export async function verifyJWT<T = JWTPayload>(
  token: string,
  secret: string = JWT_SECRET
): Promise<T | null> {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const data = encoder.encode(`${encodedHeader}.${encodedPayload}`);
    const signature = fromBase64Url(encodedSignature);

    const isValid = await crypto.subtle.verify('HMAC', key, signature as unknown as BufferSource, data);
    if (!isValid) return null;

    const payloadJson = decoder.decode(fromBase64Url(encodedPayload));
    const payload = JSON.parse(payloadJson) as JWTPayload;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return payload as unknown as T;
  } catch {
    return null;
  }
}

export function parseJwtFromHeaderOrCookie(req: Request): string | null {
  // Check Authorization header
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.substring(7).trim();
  }

  // Check Cookie header
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${JWT_COOKIE_NAME}=([^;]+)`));
  if (match) {
    return decodeURIComponent(match[1]);
  }

  return null;
}


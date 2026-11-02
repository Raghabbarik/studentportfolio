const JWT_SECRET = process.env.JWT_SECRET || 'techxera_student4_2026_jwt_secret_token_secure_hmac_sha256_key';

export const ADMIN_EMAIL = 'student4techxera@gmail.com';
export const ADMIN_PASSWORD = 'Student4@2026';
export const ADMIN_COOKIE_NAME = 'admin_jwt';

export interface AdminJWTPayload {
  sub: string;
  email: string;
  role: 'owner' | 'admin';
  iat?: number;
  exp?: number;
}

function base64UrlEncode(bytesOrStr: Uint8Array | string): string {
  const bytes = typeof bytesOrStr === 'string' ? new TextEncoder().encode(bytesOrStr) : bytesOrStr;
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return atob(str);
}

export async function signJWT(payload: AdminJWTPayload, expiresInSeconds = 7 * 24 * 60 * 60): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: AdminJWTPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(fullPayload));
  const dataToSign = `${headerB64}.${payloadB64}`;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(dataToSign));
  const sigB64 = base64UrlEncode(new Uint8Array(sigBuffer));

  return `${dataToSign}.${sigB64}`;
}

export async function verifyJWT(token?: string | null): Promise<AdminJWTPayload | null> {
  if (!token || typeof token !== 'string') return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, sigB64] = parts;
    const dataToVerify = `${headerB64}.${payloadB64}`;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigStr = base64UrlDecode(sigB64);
    const sigBytes = new Uint8Array(sigStr.length);
    for (let i = 0; i < sigStr.length; i++) {
      sigBytes[i] = sigStr.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      enc.encode(dataToVerify)
    );

    if (!isValid) return null;

    const payloadRaw = base64UrlDecode(payloadB64);
    const payload = JSON.parse(payloadRaw) as AdminJWTPayload;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Token expired
    }

    return payload;
  } catch {
    return null;
  }
}

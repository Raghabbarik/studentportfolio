import { SignJWT, jwtVerify } from 'jose';

export const ADMIN_CREDENTIALS = {
  email: 'student2techxera@gmail.com',
  password: 'Student2@2026'
};

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'student2techxera-jwt-secure-signing-key-2026-portfolio-bento'
);

export const COOKIE_NAME = 'admin_jwt';

export async function createAdminToken(user = { email: ADMIN_CREDENTIALS.email, role: 'admin' }) {
  return await new SignJWT(user)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload && payload.role === 'admin') {
      return payload as { email: string; role: string; iat?: number; exp?: number };
    }
    return null;
  } catch {
    return null;
  }
}

export function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach(c => {
    const [key, ...vals] = c.trim().split('=');
    if (key) {
      cookies[key] = decodeURIComponent(vals.join('='));
    }
  });
  return cookies;
}

export async function getAdminSession(req: Request) {
  // Check Authorization header first
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const verified = await verifyAdminToken(token);
    if (verified) return verified;
  }

  // Check cookie
  const cookieHeader = req.headers.get('cookie');
  const cookies = parseCookies(cookieHeader);
  const token = cookies[COOKIE_NAME];
  if (token) {
    return await verifyAdminToken(token);
  }

  return null;
}


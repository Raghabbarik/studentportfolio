import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'student-portfolio-admin-secret-key-2026-secure';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export const COOKIE_NAME = 'admin_token';

export async function signAdminToken(username: string = 'student8techxera@gmail.com'): Promise<string> {
  return await new SignJWT({ username, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(username)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

export async function verifyAdminToken(token: string): Promise<{ username: string; role: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return {
      username: (payload.username as string) || (payload.sub as string) || 'admin',
      role: (payload.role as string) || 'admin',
    };
  } catch (err) {
    return null;
  }
}

export function checkAdminCredentials(username?: string, password?: string): boolean {
  const expectedUser = (process.env.ADMIN_USERNAME || 'student8techxera@gmail.com').trim().toLowerCase();
  const expectedPass = (process.env.ADMIN_PASSWORD || 'Student8@2026').trim();

  if (!username || !password) return false;
  return username.trim().toLowerCase() === expectedUser && password.trim() === expectedPass;
}

export async function isAuthenticatedAdmin(req?: Request): Promise<boolean> {
  // 1. Check Authorization header
  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      const verified = await verifyAdminToken(token);
      if (verified) return true;
    }

    // 2. Check Cookie header from Request
    const cookieHeader = req.headers.get('cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
      if (match && match[1]) {
        const verified = await verifyAdminToken(decodeURIComponent(match[1]));
        if (verified) return true;
      }
    }
  }

  // 3. Check next/headers cookies() (for App Router server components and route handlers)
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (token) {
      const verified = await verifyAdminToken(token);
      if (verified) return true;
    }
  } catch {
    // cookies() may throw outside request contexts
  }

  return false;
}


import { checkAdminCredentials, signAdminToken, COOKIE_NAME } from '../../../../lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { username, password } = body as { username?: string; password?: string };

    if (!username || !password) {
      return Response.json({ error: 'Username and password are required.' }, { status: 400 });
    }

    const isValid = checkAdminCredentials(username, password);
    if (!isValid) {
      return Response.json({ error: 'Invalid admin credentials. Please try again.' }, { status: 401 });
    }

    const token = await signAdminToken(username.trim());
    const cookieStore = await cookies();

    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return Response.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: username.trim(),
    });
  } catch (err) {
    console.error('Login error:', err);
    return Response.json({ error: 'An unexpected error occurred during login.' }, { status: 500 });
  }
}


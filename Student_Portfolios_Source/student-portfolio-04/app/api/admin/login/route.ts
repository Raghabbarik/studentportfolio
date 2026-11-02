import { cookies } from 'next/headers';
import { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_COOKIE_NAME, signJWT } from '../../../../lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    // Strict validation against configured admin credentials:
    if (email !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
      return Response.json(
        { error: 'Invalid admin email or password.' },
        { status: 401 }
      );
    }

    // Generate cryptographic JWT token with HMAC-SHA256:
    const token = await signJWT({
      sub: 'admin_student_04',
      email: ADMIN_EMAIL,
      role: 'owner'
    });

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60
    });

    return Response.json(
      {
        success: true,
        message: 'Admin signed in successfully with JWT.',
        email: ADMIN_EMAIL,
        token
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin login error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred during sign in.' },
      { status: 500 }
    );
  }
}

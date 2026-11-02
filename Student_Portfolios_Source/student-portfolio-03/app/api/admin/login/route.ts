import { ADMIN_EMAIL, ADMIN_PASSWORD, JWT_COOKIE_NAME, signJWT } from '../../../../lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    if (
      email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase() ||
      password !== ADMIN_PASSWORD
    ) {
      return Response.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Sign JWT token valid for 7 days
    const token = await signJWT({
      email: ADMIN_EMAIL,
      role: 'admin'
    });

    const cookieVal = `${JWT_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;

    return Response.json(
      {
        success: true,
        token,
        user: {
          email: ADMIN_EMAIL,
          role: 'admin'
        }
      },
      {
        headers: {
          'Set-Cookie': cookieVal
        }
      }
    );
  } catch (error) {
    console.error('Admin login error:', error);
    return Response.json(
      { error: 'Internal server error during authentication.' },
      { status: 500 }
    );
  }
}


import { signJWT } from '../../../../lib/auth-jwt';

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = 'student10techxera@gmail.com';
const ADMIN_PASSWORD = 'Student10@2026';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
      return Response.json(
        { error: 'Invalid admin credentials. Please check email and password.' },
        { status: 401 }
      );
    }

    // Generate JWT token valid for 7 days
    const token = await signJWT({
      email: ADMIN_EMAIL,
      role: 'admin',
    });

    const response = Response.json(
      {
        success: true,
        message: 'Authentication successful.',
        token,
        user: {
          email: ADMIN_EMAIL,
          role: 'admin',
        },
      },
      { status: 200 }
    );

    // Set secure HttpOnly cookie for session persistence
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = [
      `admin_token=${token}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      'Max-Age=604800', // 7 days
      ...(isProduction ? ['Secure'] : []),
    ].join('; ');

    response.headers.set('Set-Cookie', cookieOptions);
    return response;
  } catch (error: any) {
    console.error('Admin login error:', error);
    return Response.json(
      { error: 'An unexpected error occurred during login.' },
      { status: 500 }
    );
  }
}


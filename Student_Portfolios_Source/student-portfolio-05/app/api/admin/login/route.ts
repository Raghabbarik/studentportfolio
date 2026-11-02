import { validateAdminCredentials, signAdminToken, getAdminCookie } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const { email = '', password = '' } = body;

    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    if (!validateAdminCredentials(email, password)) {
      return Response.json(
        { error: 'Invalid admin credentials. Please check email and password.' },
        { status: 401 }
      );
    }

    const token = await signAdminToken(email);
    const cookie = getAdminCookie(token);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Authentication successful.',
        user: { email: email.toLowerCase(), role: 'admin' },
        token,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookie,
        },
      }
    );
  } catch (error) {
    console.error('Admin login error:', error);
    return Response.json(
      { error: 'Internal server error during login.' },
      { status: 500 }
    );
  }
}


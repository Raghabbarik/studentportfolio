import { validateAdminCredentials, signAdminToken, getAdminCookie } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { username?: string; email?: string; password?: string };
    const userVal = (body.username || body.email || '').trim();
    const password = (body.password || '').trim();

    if (!userVal || !password) {
      return Response.json(
        { error: 'Email/username and password are required.' },
        { status: 400 }
      );
    }

    if (!validateAdminCredentials(userVal, password)) {
      return Response.json(
        { error: 'Invalid admin credentials. Please check email/username and password (student7techxera@gmail.com / Student7@2026).' },
        { status: 401 }
      );
    }

    const token = await signAdminToken(userVal);
    const cookie = getAdminCookie(token);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin authentication successful (JWT token issued).',
        user: { username: userVal, role: 'admin' },
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


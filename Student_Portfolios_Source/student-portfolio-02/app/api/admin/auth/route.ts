import { ADMIN_CREDENTIALS, createAdminToken, getAdminSession, COOKIE_NAME } from '../../../../lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({})) as { email?: string; password?: string };
    const email = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    if (
      email === ADMIN_CREDENTIALS.email.toLowerCase() &&
      password === ADMIN_CREDENTIALS.password
    ) {
      const token = await createAdminToken({ email: ADMIN_CREDENTIALS.email, role: 'admin' });
      
      const response = Response.json({
        success: true,
        message: 'Admin authentication successful.',
        token,
        user: { email: ADMIN_CREDENTIALS.email, role: 'admin' }
      });

      // Set HTTP-only secure cookie
      response.headers.set(
        'Set-Cookie',
        `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
      );

      return response;
    }

    return Response.json(
      { error: 'Invalid admin credentials. Please check your email and password.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Admin login error:', error);
    return Response.json(
      { error: 'Authentication service encountered an error.' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getAdminSession(req);
    if (session) {
      return Response.json({
        authenticated: true,
        user: { email: session.email, role: session.role }
      });
    }
    return Response.json({ authenticated: false }, { status: 401 });
  } catch (error) {
    return Response.json({ authenticated: false, error: 'Session check failed' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = Response.json({
    success: true,
    message: 'Logged out successfully.'
  });

  // Clear cookie
  response.headers.set(
    'Set-Cookie',
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );

  return response;
}


import { parseJwtFromHeaderOrCookie, verifyJWT } from '../../../../lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const token = parseJwtFromHeaderOrCookie(req);
    if (!token) {
      return Response.json({ authenticated: false }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
      return Response.json({ authenticated: false }, { status: 401 });
    }

    return Response.json({
      authenticated: true,
      user: {
        email: payload.email,
        role: payload.role
      }
    });
  } catch (error) {
    console.error('Admin auth check error:', error);
    return Response.json({ authenticated: false }, { status: 500 });
  }
}


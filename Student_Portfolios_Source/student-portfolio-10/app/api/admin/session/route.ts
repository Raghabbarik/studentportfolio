import { verifyJWT, extractTokenFromRequest } from '../../../../lib/auth-jwt';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const token = extractTokenFromRequest(req);
    if (!token) {
      return Response.json(
        { authenticated: false, message: 'No token provided' },
        { status: 200 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
      return Response.json(
        { authenticated: false, message: 'Invalid or expired token' },
        { status: 200 }
      );
    }

    return Response.json({
      authenticated: true,
      user: {
        email: payload.email,
        role: payload.role,
        exp: payload.exp,
      },
    });
  } catch (error: any) {
    return Response.json(
      { authenticated: false, error: error.message },
      { status: 500 }
    );
  }
}


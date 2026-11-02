import { verifyAdminToken } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await verifyAdminToken(req);
    if (!user) {
      return Response.json({ authenticated: false }, { status: 200 });
    }
    return Response.json({ authenticated: true, user }, { status: 200 });
  } catch (error) {
    console.error('Session check error:', error);
    return Response.json({ authenticated: false }, { status: 200 });
  }
}


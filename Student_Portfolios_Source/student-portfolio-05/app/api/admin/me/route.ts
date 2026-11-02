import { verifyAdminToken } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const admin = await verifyAdminToken(req);
  if (!admin) {
    return Response.json({ authenticated: false }, { status: 401 });
  }
  return Response.json({ authenticated: true, user: admin }, { status: 200 });
}


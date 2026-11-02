import { isAuthenticatedAdmin } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authenticated = await isAuthenticatedAdmin(req);
    return Response.json({ authenticated });
  } catch (err) {
    console.error('Check auth error:', err);
    return Response.json({ authenticated: false });
  }
}


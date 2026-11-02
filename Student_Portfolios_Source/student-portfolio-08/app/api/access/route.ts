import { sameOrigin } from '../../../lib/storage';
import { isAuthenticatedAdmin } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request) {
  try {
    if (!sameOrigin(req)) return Response.json({ error: 'Invalid request origin.' }, { status: 403 });

    const isAdmin = await isAuthenticatedAdmin(req);
    if (!isAdmin) {
      return Response.json({ error: 'Only the portfolio admin can assign editing access.' }, { status: 403 });
    }

    const { email } = (await req.json()) as { email: unknown };
    if (typeof email !== 'string' || email.length > 160 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      return Response.json({ error: 'Enter a valid student email, or leave it blank.' }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Unable to save access. Please try again.' }, { status: 503 });
  }
}

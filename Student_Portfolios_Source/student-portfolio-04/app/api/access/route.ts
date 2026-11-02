import { getChatGPTUser } from '../../chatgpt-auth';
import { permission, saveStudentEmail, sameOrigin } from '../../../lib/storage';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request) {
  try {
    if (!sameOrigin(req)) {
      return Response.json({ error: 'Invalid request origin.' }, { status: 403 });
    }

    const u = await getChatGPTUser();
    if (!u || (await permission(u.email)) !== 'owner') {
      return Response.json(
        { error: 'Only the portfolio owner can assign editing access.' },
        { status: 403 }
      );
    }

    const { email } = (await req.json()) as { email: unknown };
    if (
      typeof email !== 'string' ||
      email.length > 160 ||
      (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    ) {
      return Response.json(
        { error: 'Enter a valid student email, or leave it blank to remove access.' },
        { status: 400 }
      );
    }

    await saveStudentEmail(email.trim().toLowerCase());
    return Response.json({ success: true });
  } catch (error) {
    console.error('Access update error:', error);
    return Response.json(
      { error: 'Unable to save access. Please try again.' },
      { status: 503 }
    );
  }
}

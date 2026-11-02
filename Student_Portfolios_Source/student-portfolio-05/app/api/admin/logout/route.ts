import { getClearAdminCookie } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  return new Response(
    JSON.stringify({ success: true, message: 'Logged out successfully.' }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': getClearAdminCookie(),
      },
    }
  );
}


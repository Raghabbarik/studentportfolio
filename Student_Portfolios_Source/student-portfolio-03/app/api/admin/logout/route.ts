import { JWT_COOKIE_NAME } from '../../../../lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST() {
  return Response.json(
    { success: true },
    {
      headers: {
        'Set-Cookie': `${JWT_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
      }
    }
  );
}


import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME } from '../../../../lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);

  return Response.json(
    { success: true, message: 'Signed out.' },
    { status: 200 }
  );
}

export async function GET(req: Request) {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);

  const url = new URL('/admin', req.url);
  return Response.redirect(url, 302);
}

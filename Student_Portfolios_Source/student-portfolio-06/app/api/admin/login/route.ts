import { NextResponse } from 'next/server';
import { ADMIN_USER, ADMIN_PASS, signJWT } from '../../../../lib/admin-auth';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as any;
    const { username, password } = body || {};

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    }

    if (String(username).trim().toLowerCase() !== ADMIN_USER || String(password) !== ADMIN_PASS) {
      return NextResponse.json({ error: 'Invalid credentials. Access denied.' }, { status: 401 });
    }

    const payload = { username: ADMIN_USER, role: 'admin' };
    const token = signJWT(payload);

    const res = NextResponse.json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: payload,
    });

    res.cookies.set('admin_jwt', token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 7 * 86400,
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

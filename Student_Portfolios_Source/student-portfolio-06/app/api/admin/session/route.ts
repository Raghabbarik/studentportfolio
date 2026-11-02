import { NextResponse } from 'next/server';
import { verifyJWT, extractAuthToken } from '../../../../lib/admin-auth';

export async function GET(req: Request) {
  const token = extractAuthToken(req);
  const user = verifyJWT(token);

  if (user) {
    return NextResponse.json({
      authenticated: true,
      user: { username: user.username, role: user.role },
    });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}


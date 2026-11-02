import {validateAdminCredentials} from '../../../../lib/storage';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json() as {email?: string; password?: string};
    const email = (body.email || '').trim();
    const password = (body.password || '').trim();

    if (!email || !password) {
      return Response.json({error: 'Please enter both email and password.'}, {status: 400});
    }

    const isValid = await validateAdminCredentials(email, password);
    if (!isValid) {
      return Response.json({error: 'Invalid admin credentials. Please check your email and password.'}, {status: 401});
    }

    const sessionPayload = {
      email: email.toLowerCase(),
      ts: Date.now()
    };
    const token = encodeURIComponent(btoa(JSON.stringify(sessionPayload)));

    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    // Set 7-day persistent session cookies
    headers.append('Set-Cookie', `portfolio_admin_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);
    headers.append('Set-Cookie', `portfolio_admin=1; Path=/; SameSite=Lax; Max-Age=604800`);

    return new Response(JSON.stringify({success: true, email}), {
      status: 200,
      headers
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return Response.json({error: 'An unexpected error occurred during login.'}, {status: 500});
  }
}

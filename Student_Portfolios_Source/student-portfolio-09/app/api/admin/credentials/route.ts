import {isRequestAdmin, updateAdminCredentials, getAdminCredentials} from '../../../../lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!isRequestAdmin(req)) {
    return Response.json({error: 'Unauthorized'}, {status: 401});
  }
  const creds = await getAdminCredentials();
  return Response.json({email: creds.email});
}

export async function PUT(req: Request) {
  if (!isRequestAdmin(req)) {
    return Response.json({error: 'Unauthorized'}, {status: 401});
  }
  try {
    const body = await req.json() as {email?: string; password?: string};
    const email = (body.email || '').trim();
    const password = (body.password || '').trim();

    if (!email) {
      return Response.json({error: 'Admin email is required.'}, {status: 400});
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({error: 'Please enter a valid email address.'}, {status: 400});
    }

    if (password && password.length < 4) {
      return Response.json({error: 'Password must be at least 4 characters long.'}, {status: 400});
    }

    const success = await updateAdminCredentials(email, password || undefined);
    if (!success) {
      return Response.json({error: 'Failed to update credentials.'}, {status: 500});
    }

    const sessionToken = btoa(JSON.stringify({
      email,
      ts: Date.now()
    }));

    const res = Response.json({success: true, email});
    res.headers.set('Set-Cookie', `portfolio_admin_session=${encodeURIComponent(sessionToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);
    return res;
  } catch (err) {
    console.error('Update credentials error:', err);
    return Response.json({error: 'Unable to update credentials.'}, {status: 500});
  }
}

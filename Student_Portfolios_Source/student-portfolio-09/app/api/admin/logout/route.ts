export const dynamic = 'force-dynamic';

export async function POST() {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.append('Set-Cookie', 'portfolio_admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  headers.append('Set-Cookie', 'portfolio_admin=; Path=/; SameSite=Lax; Max-Age=0');
  headers.append('Set-Cookie', '__sites_local_auth=; Path=/; Max-Age=0');
  return new Response(JSON.stringify({success: true}), {
    status: 200,
    headers
  });
}

export async function GET() {
  const headers = new Headers();
  headers.append('Set-Cookie', 'portfolio_admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  headers.append('Set-Cookie', 'portfolio_admin=; Path=/; SameSite=Lax; Max-Age=0');
  headers.append('Set-Cookie', '__sites_local_auth=; Path=/; Max-Age=0');
  headers.set('Location', '/admin');
  return new Response(null, {
    status: 302,
    headers
  });
}

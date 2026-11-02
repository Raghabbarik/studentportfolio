export const dynamic = 'force-dynamic';

export async function POST() {
  const response = Response.json(
    { success: true, message: 'Logged out successfully.' },
    { status: 200 }
  );

  response.headers.set(
    'Set-Cookie',
    'admin_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
  );
  return response;
}


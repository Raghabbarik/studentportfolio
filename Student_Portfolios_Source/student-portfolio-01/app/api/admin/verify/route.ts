import { verifyJWT } from "../../../../lib/jwt";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  let token: string | null = null;
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/admin_jwt=([^;]+)/);
    if (match) token = decodeURIComponent(match[1]);
  }

  const verified = token ? await verifyJWT(token) : null;
  if (verified) {
    return Response.json({
      authenticated: true,
      user: { email: verified.email, role: verified.role },
    });
  }
  return Response.json({ authenticated: false }, { status: 401 });
}

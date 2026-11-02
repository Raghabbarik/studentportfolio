import { signJWT } from "../../../../lib/jwt";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "student1techxera@gmail.com";
const ADMIN_PASSWORD = "Student1@2026";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const { email, password } = body;
    if (
      email &&
      password &&
      email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
      password.trim() === ADMIN_PASSWORD
    ) {
      const token = await signJWT({ email: ADMIN_EMAIL, role: "admin" });
      const cookieHeader = `admin_jwt=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`;
      return Response.json(
        { success: true, token, user: { email: ADMIN_EMAIL, role: "admin" } },
        { headers: { "Set-Cookie": cookieHeader } }
      );
    }
    return Response.json(
      { success: false, error: "Invalid admin email or password." },
      { status: 401 }
    );
  } catch {
    return Response.json({ success: false, error: "Malformed request" }, { status: 400 });
  }
}

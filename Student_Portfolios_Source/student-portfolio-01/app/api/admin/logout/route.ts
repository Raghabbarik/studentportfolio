export const dynamic = "force-dynamic";

export async function POST() {
  return Response.json(
    { success: true, message: "Logged out" },
    {
      headers: {
        "Set-Cookie": "admin_jwt=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
      },
    }
  );
}


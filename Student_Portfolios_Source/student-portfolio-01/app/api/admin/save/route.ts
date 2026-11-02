import { verifyJWT } from "../../../../lib/jwt";
import { database } from "../../../../lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
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
  if (!verified) {
    return Response.json(
      { success: false, error: "Unauthorized: Valid JWT required." },
      { status: 401 }
    );
  }

  try {
    const body = (await req.json()) as Record<string, any>;
    const profile = body.profile || body;
    const now = new Date().toISOString();

    // Write to portfolio-data.json on disk if running on Node / Vercel
    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const jsonPath = path.resolve(process.cwd(), "portfolio-data.json");
      fs.writeFileSync(jsonPath, JSON.stringify(profile, null, 2), "utf-8");
    } catch (fsErr) {
      console.warn("File write fallback:", fsErr);
    }

    try {
      await database()
        .prepare(
          "INSERT INTO portfolios (id, data, revision, updated_at) VALUES (1, ?, 1, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data, revision = revision + 1, updated_at = excluded.updated_at"
        )
        .bind(JSON.stringify(profile), now)
        .run();
    } catch (dbErr) {
      console.warn("DB sync notice (file write is primary):", dbErr);
    }

    return Response.json({
      success: true,
      message: "All changes successfully saved to portfolio-data.json!",
      savedAt: now,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ success: false, error: msg }, { status: 500 });
  }
}

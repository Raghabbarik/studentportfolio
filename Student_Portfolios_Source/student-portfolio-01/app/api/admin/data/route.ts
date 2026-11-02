import { readProfile } from "../../../../lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { profile } = await readProfile();
    return Response.json(profile, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Error reading admin data:", error);
    return Response.json({ error: "Failed to load data" }, { status: 500 });
  }
}

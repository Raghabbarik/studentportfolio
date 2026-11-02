import { getAdminSession } from '../../../../lib/admin-auth';
import { readFullJsonData, writeFullJsonData, writeJsonProfile } from '../../../../lib/json-storage';
import { profileSchema } from '../../../../lib/portfolio';
import { database } from '../../../../lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const admin = await getAdminSession(req);
    if (!admin) {
      return Response.json({ error: 'Unauthorized. Admin JWT token required.' }, { status: 401 });
    }

    const data = readFullJsonData();
    return Response.json({
      success: true,
      data,
      admin: { email: admin.email, role: admin.role }
    });
  } catch (error) {
    console.error('Error in GET /api/admin/data:', error);
    return Response.json({ error: 'Failed to retrieve portfolio data.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await getAdminSession(req);
    if (!admin) {
      return Response.json({ error: 'Unauthorized. Admin JWT token required.' }, { status: 401 });
    }

    const body = (await req.json()) as any;
    if (!body) {
      return Response.json({ error: 'Missing request payload.' }, { status: 400 });
    }

    // Support both direct profile saving and full data file saving
    let profileToSave = body.profile || body;
    let messages = body.messages;

    // Validate profile schema
    const parsed = profileSchema.safeParse(profileToSave);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
      return Response.json({ error: `Validation error: ${errorMsg}` }, { status: 400 });
    }

    const currentData = readFullJsonData();
    const finalData = {
      profile: parsed.data,
      revision: (currentData.revision || 0) + 1,
      updatedAt: new Date().toISOString(),
      messages: Array.isArray(messages) ? messages : (currentData.messages || [])
    };

    // Save directly to .json file!
    const result = writeFullJsonData(finalData);

    // Optional: Synchronize with SQLite database for resilience
    try {
      const db = database();
      const now = result.updatedAt;
      await db.prepare('INSERT INTO portfolios (id, data, revision, updated_at) VALUES (1, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data, revision = excluded.revision, updated_at = excluded.updated_at')
        .bind(JSON.stringify(parsed.data), result.revision, now)
        .run();
    } catch (dbErr) {
      console.warn('Note: SQLite sync skipped (JSON storage succeeded):', dbErr);
    }

    return Response.json({
      success: true,
      message: 'All changes saved to portfolio-data.json successfully!',
      revision: result.revision,
      updatedAt: result.updatedAt,
      data: finalData
    });
  } catch (error) {
    console.error('Error in PUT /api/admin/data:', error);
    return Response.json({ error: 'Failed to write portfolio data to JSON file.' }, { status: 500 });
  }
}


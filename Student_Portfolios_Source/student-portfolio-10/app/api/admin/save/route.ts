import { verifyJWT, extractTokenFromRequest } from '../../../../lib/auth-jwt';
import { writePortfolioJSON } from '../../../../lib/json-storage';
import { profileSchema, type Profile } from '../../../../lib/portfolio';
import { database } from '../../../../lib/storage';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request) {
  try {
    // 1. JWT verification
    const token = extractTokenFromRequest(req);
    if (!token) {
      return Response.json(
        { error: 'Unauthorized: Admin authentication token required.' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
      return Response.json(
        { error: 'Forbidden: Invalid or expired admin token.' },
        { status: 403 }
      );
    }

    // 2. Parse and validate body
    const body = (await req.json().catch(() => null)) as any;
    if (!body || !body.profile) {
      return Response.json(
        { error: 'Invalid payload: "profile" object is required.' },
        { status: 400 }
      );
    }

    const parseResult = profileSchema.safeParse(body.profile);
    if (!parseResult.success) {
      return Response.json(
        {
          error: 'Validation failed.',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const validatedProfile: Profile = parseResult.data;

    // 3. Save directly to data/portfolio-data.json
    const saveResult = writePortfolioJSON(validatedProfile);

    // 4. Also optionally sync to D1 database if present
    try {
      const now = saveResult.updatedAt;
      const db = database();
      await db
        .prepare(
          'INSERT INTO portfolios (id, data, revision, updated_at) VALUES (1, ?, 1, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data, revision = revision + 1, updated_at = excluded.updated_at'
        )
        .bind(JSON.stringify(validatedProfile), now)
        .run();
    } catch (dbErr) {
      // D1 sync warning is non-fatal since the JSON file is the primary storage requested
      console.warn('D1 sync skipped or failed:', dbErr);
    }

    return Response.json({
      success: true,
      message: 'All changes saved successfully to data/portfolio-data.json',
      updatedAt: saveResult.updatedAt,
      profile: validatedProfile,
    });
  } catch (error: any) {
    console.error('Error saving portfolio data:', error);
    return Response.json(
      { error: 'Failed to save portfolio data: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}


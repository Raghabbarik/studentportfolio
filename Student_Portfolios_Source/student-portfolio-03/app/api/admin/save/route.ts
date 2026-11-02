import { parseJwtFromHeaderOrCookie, verifyJWT } from '../../../../lib/jwt';
import { database } from '../../../../lib/storage';
import { profileSchema } from '../../../../lib/portfolio';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const token = parseJwtFromHeaderOrCookie(req);
    if (!token) {
      return Response.json(
        { error: 'Unauthorized: missing JWT token.' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
      return Response.json(
        { error: 'Forbidden: invalid or expired JWT token.' },
        { status: 403 }
      );
    }

    const body = (await req.json()) as { profile: unknown };
    if (!body || !body.profile) {
      return Response.json(
        { error: 'Profile data is required.' },
        { status: 400 }
      );
    }

    const parsed = profileSchema.safeParse(body.profile);
    if (!parsed.success) {
      return Response.json(
        {
          error: 'Validation failed for profile data.',
          issues: parsed.error.issues
        },
        { status: 400 }
      );
    }

    const p = parsed.data;
    const now = new Date().toISOString();

    // 1. In Node.js / Vercel environments, write to data/portfolio-data.json directly
    try {
      const fs = await import('node:fs');
      const path = await import('node:path');
      const filePath = path.resolve(process.cwd(), 'data', 'portfolio-data.json');
      fs.writeFileSync(filePath, JSON.stringify(p, null, 2), 'utf-8');
    } catch {
      // Ignored if filesystem is read-only or not in Node.js
    }

    // 2. In Cloudflare Workers environment, sync to D1 database
    try {
      const db = database();
      if (db) {
        const existing = (await db
          .prepare('SELECT id, revision FROM portfolios WHERE id = ?')
          .bind(1)
          .first()) as { id: number; revision: number } | null;

        if (!existing) {
          await db
            .prepare(
              'INSERT INTO portfolios (id, data, revision, updated_at) VALUES (?, ?, ?, ?)'
            )
            .bind(1, JSON.stringify(p), 1, now)
            .run();
        } else {
          await db
            .prepare(
              'UPDATE portfolios SET data = ?, revision = revision + 1, updated_at = ? WHERE id = ?'
            )
            .bind(JSON.stringify(p), now, 1)
            .run();
        }
      }
    } catch (dbErr) {
      console.warn('Database sync skipped (not on Cloudflare):', dbErr);
    }

    return Response.json({
      success: true,
      message: 'Profile saved successfully.',
      updatedAt: now
    });
  } catch (error) {
    console.error('Admin save error:', error);
    return Response.json(
      { error: 'Failed to save profile: ' + String(error) },
      { status: 500 }
    );
  }
}


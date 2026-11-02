import { getChatGPTUser } from '../../chatgpt-auth';
import { readProfile, database, permission, sameOrigin } from '../../../lib/storage';
import { profileSchema, safeUrl } from '../../../lib/portfolio';
import { verifyAdminToken } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return Response.json(await readProfile(), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: 'Unable to load this portfolio. Please try again.' },
      { status: 503 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    if (!sameOrigin(req)) {
      return Response.json({ error: 'Invalid request origin.' }, { status: 403 });
    }

    // Check JWT admin token first, then fallback to ChatGPT auth
    const admin = await verifyAdminToken(req);
    let authorized = false;

    if (admin) {
      authorized = true;
    } else {
      const user = await getChatGPTUser();
      if (user && (await permission(user.email)) !== 'none') {
        authorized = true;
      }
    }

    if (!authorized) {
      return Response.json(
        { error: 'Editing access is required. Please sign in.' },
        { status: 401 }
      );
    }

    if (Number(req.headers.get('content-length') ?? 0) > 100000) {
      return Response.json({ error: 'Portfolio is too large.' }, { status: 413 });
    }

    const body = (await req.json()) as { profile: unknown; revision: number };
    const parsed = profileSchema.safeParse(body.profile);
    if (!parsed.success || !Number.isInteger(body.revision) || body.revision < 0) {
      return Response.json({ error: 'Please check your profile fields.' }, { status: 400 });
    }

    const p = parsed.data;
    for (const url of [
      p.photo,
      p.resume,
      p.github,
      p.linkedin,
      p.instagram,
      p.behance,
      p.dribbble,
      ...p.projects.flatMap((x) => [x.url, x.image]),
    ]) {
      if (url && !safeUrl(url)) {
        return Response.json({ error: 'Use a valid http or https link.' }, { status: 400 });
      }
    }

    if (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
      return Response.json({ error: 'Please enter a valid contact email.' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const db = database();
    if (db) {
      let result;
      if (body.revision === 0) {
        result = await db
          .prepare(
            'INSERT OR IGNORE INTO portfolios (id, data, revision, updated_at) VALUES (?, ?, ?, ?)'
          )
          .bind(1, JSON.stringify(p), 1, now)
          .run();
      } else {
        result = await db
          .prepare(
            'UPDATE portfolios SET data = ?, revision = revision + 1, updated_at = ? WHERE id = ? AND revision = ?'
          )
          .bind(JSON.stringify(p), now, 1, body.revision)
          .run();
      }

      if (result && !result.meta?.changes) {
        return Response.json(
          { error: 'This portfolio changed in another window. Reload before saving.' },
          { status: 409 }
        );
      }
    }

    // Instantly rewrite local projects.json file sitting on hard drive
    try {
      const fs = await import('node:fs');
      const path = await import('node:path');
      const filePath = path.resolve(process.cwd(), 'projects.json');
      fs.writeFileSync(filePath, JSON.stringify(p.projects, null, 2), 'utf8');
      console.log('[Node.js Server] Instantly rewrote local projects.json on hard drive:', filePath);
    } catch (fsErr) {
      console.warn('[Node.js Server] Could not write local projects.json:', fsErr);
    }

    return Response.json({ revision: body.revision + 1, updatedAt: now });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: 'Your changes could not be saved. Your draft is still here; please try again.' },
      { status: 503 }
    );
  }
}

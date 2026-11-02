import { verifyAdminToken } from '../../../lib/auth';
import { sameOrigin } from '../../../lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const candidates = [
      path.resolve(process.cwd(), 'projects.json'),
      path.resolve(process.cwd(), 'student-portfolio-05', 'projects.json'),
      'D:\\Student_Portfolios_10_Complete_Source\\Student_Portfolios_Source\\student-portfolio-05\\projects.json'
    ];

    let foundPath = candidates.find(c => fs.existsSync(c));

    if (foundPath) {
      const data = fs.readFileSync(foundPath, 'utf8');
      return new Response(data, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      });
    }

    return Response.json({ error: 'Not found', cwd: process.cwd(), tried: candidates }, { status: 404 });
  } catch (err) {
    console.error('Error reading projects.json:', err);
    return Response.json({ error: 'Unable to read projects.json' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!sameOrigin(req)) {
      return Response.json({ error: 'Invalid request origin.' }, { status: 403 });
    }

    const admin = await verifyAdminToken(req);
    if (!admin) {
      return Response.json({ error: 'Admin authentication required.' }, { status: 401 });
    }

    const body = (await req.json()) as Record<string, unknown> | unknown[];
    const projects = Array.isArray(body)
      ? body
      : body && typeof body === 'object' && 'projects' in body && Array.isArray(body.projects)
      ? body.projects
      : null;

    if (!Array.isArray(projects)) {
      return Response.json({ error: 'Invalid projects format. Expected an array.' }, { status: 400 });
    }

    const fs = await import('node:fs');
    const path = await import('node:path');
    const filePath = path.resolve(process.cwd(), 'projects.json');
    fs.writeFileSync(filePath, JSON.stringify(projects, null, 2), 'utf8');
    console.log('[Node.js Server] Instantly rewrote local projects.json on hard drive:', filePath);

    return Response.json({ success: true, count: projects.length, filePath });
  } catch (err) {
    console.error('Error writing projects.json:', err);
    return Response.json({ error: 'Unable to rewrite projects.json' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return PUT(req);
}

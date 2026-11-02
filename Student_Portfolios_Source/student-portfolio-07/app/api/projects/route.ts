import fs from 'node:fs';
import path from 'node:path';
import { verifyAdminToken } from '../../../lib/auth';
import { readProfile } from '../../../lib/storage';

export const dynamic = 'force-dynamic';

function getProjectsFilePath(): string {
  return path.resolve(process.cwd(), 'projects.json');
}

export async function GET() {
  try {
    const filePath = getProjectsFilePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return new Response(content, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      });
    }

    const { profile } = await readProfile();
    return Response.json(profile, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Error in GET /api/projects:', error);
    return Response.json({ error: 'Failed to read projects.json' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return handleSave(req);
}

export async function PUT(req: Request) {
  return handleSave(req);
}

async function handleSave(req: Request) {
  try {
    const body = (await req.json()) as any;
    const profileData = body.profile || body;
    profileData.lastUpdated = new Date().toISOString();

    const filePath = getProjectsFilePath();
    fs.writeFileSync(filePath, JSON.stringify(profileData, null, 2), 'utf-8');
    console.log(`[API] projects.json successfully rewritten on hard drive at: ${filePath}`);

    return Response.json({
      success: true,
      message: 'projects.json file successfully rewritten on local hard drive.',
      savedAt: profileData.lastUpdated,
      projectsCount: Array.isArray(profileData.projects) ? profileData.projects.length : 0,
    });
  } catch (error: any) {
    console.error('Error in saving /api/projects:', error);
    return Response.json(
      { error: 'Failed to rewrite projects.json: ' + (error?.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

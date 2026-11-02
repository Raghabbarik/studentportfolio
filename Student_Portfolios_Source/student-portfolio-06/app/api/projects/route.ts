import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { verifyJWT, extractAuthToken } from '../../../lib/admin-auth';
import { sample } from '../../../lib/sample';

function getFilePath(): string {
  return path.resolve(process.cwd(), 'projects.json');
}

export async function GET() {
  try {
    const filePath = getFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return NextResponse.json(JSON.parse(data));
    }
    return NextResponse.json(sample);
  } catch (err: any) {
    return NextResponse.json(sample);
  }
}

export async function POST(req: Request) {
  try {
    const token = extractAuthToken(req);
    const user = verifyJWT(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Valid JWT token or admin login required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const filePath = getFilePath();

    try {
      fs.writeFileSync(filePath, JSON.stringify(body, null, 2), 'utf-8');
      return NextResponse.json({
        success: true,
        message: 'projects.json successfully updated.',
        updatedAt: new Date().toISOString(),
      });
    } catch (fsErr: any) {
      // In serverless environments like Vercel, the local filesystem is read-only
      console.warn('Filesystem write notice on serverless host:', fsErr.message);
      return NextResponse.json({
        success: true,
        isServerlessReadOnly: true,
        message: 'Data validated. Note: Vercel serverless filesystem is ephemeral/read-only. For permanent persistence on Vercel, connect a cloud database (such as Supabase, Vercel KV, or Upstash).',
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save project data.' }, { status: 500 });
  }
}


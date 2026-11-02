import { env } from 'cloudflare:workers';
import { sample } from './sample';
import type { Profile } from './portfolio';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function database(): any | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = (env as unknown as { DB?: any })?.DB;
  return db || null;
}

export async function readProfile() {
  let profile: Profile = { ...sample };
  let revision = 0;
  let updatedAt: string | null = null;

  try {
    const db = database();
    if (db) {
      const row = (await db
        .prepare('SELECT data, revision, updated_at FROM portfolios WHERE id = ?')
        .bind(1)
        .first()) as { data: string; revision: number; updated_at: string } | null;
      if (row) {
        profile = JSON.parse(row.data) as Profile;
        revision = row.revision;
        updatedAt = row.updated_at;
      }
    }
  } catch {
    // Database fallback for Vercel / serverless deployments
  }

  try {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const filePath = path.resolve(process.cwd(), 'projects.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        profile.projects = parsed;
      }
    }
  } catch {
    // Non-node runtime fallback
  }

  return { profile, revision, updatedAt };
}

export async function studentEmail() {
  try {
    const db = database();
    if (db) {
      const row = (await db
        .prepare('SELECT student_email FROM settings WHERE id = ?')
        .bind(1)
        .first()) as { student_email: string } | null;
      return row?.student_email ?? '';
    }
  } catch {}
  return '';
}

export function ownerEmail() {
  return ((env as unknown as { OWNER_EMAIL?: string })?.OWNER_EMAIL ?? '').toLowerCase();
}

export async function permission(email: string) {
  if (!email) return 'none';
  if (ownerEmail() && email.toLowerCase() === ownerEmail()) return 'owner';
  const student = await studentEmail();
  return student && email.toLowerCase() === student.toLowerCase() ? 'student' : 'none';
}

export function sameOrigin(req: Request) {
  const origin = req.headers.get('origin');
  return origin === new URL(req.url).origin;
}

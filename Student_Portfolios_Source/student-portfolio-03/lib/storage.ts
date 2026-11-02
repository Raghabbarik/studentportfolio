import { sample } from './sample';
import type { Profile } from './portfolio';

// Safe accessor for Cloudflare Workers environment bindings (when present)
export async function getCloudflareDB() {
  try {
    const mod = 'cloudflare:workers';
    const cf = await import(/* webpackIgnore: true */ mod);
    return cf?.env?.DB ?? null;
  } catch {
    return null;
  }
}

export function database() {
  try {
    const g = globalThis as any;
    if (g?.__env__?.DB) return g.__env__.DB;
    if (g?.env?.DB) return g.env.DB;
  } catch {
    // Ignore
  }
  return null;
}

export async function readProfile() {
  try {
    const db = (await getCloudflareDB()) || database();
    if (db) {
      const row = (await db
        .prepare('SELECT data, revision, updated_at FROM portfolios WHERE id = ?')
        .bind(1)
        .first()) as { data: string; revision: number; updated_at: string } | null;
      if (row) {
        return {
          profile: JSON.parse(row.data) as Profile,
          revision: row.revision,
          updatedAt: row.updated_at
        };
      }
    }
  } catch {
    // Fallback to sample JSON (Vercel / Node.js)
  }
  return { profile: sample, revision: 0, updatedAt: null };
}

export async function studentEmail() {
  try {
    const db = (await getCloudflareDB()) || database();
    if (db) {
      const row = (await db
        .prepare('SELECT student_email FROM settings WHERE id = ?')
        .bind(1)
        .first()) as { student_email: string } | null;
      return row?.student_email ?? '';
    }
  } catch {
    // Fallback
  }
  return '';
}

export function ownerEmail() {
  try {
    const g = globalThis as any;
    return ((g?.env?.OWNER_EMAIL ?? process.env?.OWNER_EMAIL ?? '') as string).toLowerCase();
  } catch {
    return '';
  }
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

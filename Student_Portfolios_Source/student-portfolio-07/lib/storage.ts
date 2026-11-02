import { sample } from './sample';
import type { Profile } from './portfolio';
import fs from 'node:fs';
import path from 'node:path';

// Safely get database interface across Cloudflare, Vercel, and local Node environments
export function database(): any {
  const g = globalThis as any;
  if (g.env?.DB) return g.env.DB;
  if (g.DB) return g.DB;
  
  // Safe mock database for non-Cloudflare environments (e.g. Vercel, Node.js)
  return {
    prepare: () => ({
      bind: () => ({
        first: async () => null,
        run: async () => ({}),
        all: async () => ({ results: [] }),
      }),
    }),
  };
}

export async function readProfile(): Promise<{ profile: Profile; revision: number; updatedAt: string | null }> {
  // First attempt to read directly from projects.json on disk
  try {
    const projectsPath = path.resolve(process.cwd(), 'projects.json');
    if (fs.existsSync(projectsPath)) {
      const content = fs.readFileSync(projectsPath, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object' && parsed.name) {
        return {
          profile: parsed as Profile,
          revision: 1,
          updatedAt: parsed.lastUpdated || new Date().toISOString(),
        };
      }
    }
  } catch (err) {
    // If running in an environment without direct fs access, fallback to database or sample
  }

  try {
    const row = await database()
      .prepare('SELECT data, revision, updated_at FROM portfolios WHERE id = ?')
      .bind(1)
      .first();

    return row
      ? {
        profile: JSON.parse(row.data) as Profile,
        revision: row.revision,
        updatedAt: row.updated_at,
      }
      : { profile: sample, revision: 0, updatedAt: null };
  } catch {
    return { profile: sample, revision: 0, updatedAt: null };
  }
}

export async function studentEmail(): Promise<string> {
  try {
    const row = await database()
      .prepare('SELECT student_email FROM settings WHERE id = ?')
      .bind(1)
      .first();
    return row?.student_email ?? '';
  } catch {
    return '';
  }
}

export function ownerEmail(): string {
  const g = globalThis as any;
  return ((g.env?.OWNER_EMAIL || process.env.OWNER_EMAIL || '')).toLowerCase();
}

export async function permission(email: string): Promise<string> {
  if (!email) return 'none';
  const owner = ownerEmail();
  if (owner && email.toLowerCase() === owner) return 'owner';
  const student = await studentEmail();
  return student && email.toLowerCase() === student.toLowerCase() ? 'student' : 'none';
}

export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  return origin === new URL(req.url).origin;
}

import { sample } from './sample';
import type { Profile } from './portfolio';
import fs from 'node:fs';
import path from 'node:path';

function getProjectsFileData(): Profile | null {
  try {
    const filePath = path.resolve(process.cwd(), 'projects.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as Profile;
    }
  } catch { }
  return null;
}

export function database() {
  try {
    const cf = (typeof globalThis !== 'undefined' && (globalThis as any).env?.DB) || null;
    if (cf) return cf;
  } catch { }
  return {
    prepare() {
      return {
        bind() {
          return {
            first: async () => null,
            run: async () => ({ meta: { changes: 0 } }),
          };
        },
      };
    },
  };
}

export async function readProfile(): Promise<{ profile: Profile; revision: number; updatedAt: string | null }> {
  // 1. Try Cloudflare Workers D1 if running on Cloudflare
  try {
    const cfModule = 'cloudflare' + ':workers';
    const cf = (await import(/* webpackIgnore: true */ cfModule).catch(() => null)) as any;
    if (cf && cf.env && cf.env.DB) {
      const row = (await cf.env.DB.prepare('SELECT data, revision, updated_at FROM portfolios WHERE id = ?').bind(1).first()) as { data: string; revision: number; updated_at: string } | null;
      if (row) {
        return {
          profile: JSON.parse(row.data) as Profile,
          revision: row.revision,
          updatedAt: row.updated_at,
        };
      }
    }
  } catch {
    // Not on Cloudflare
  }

  // 2. Fallback to local projects.json
  const fileData = getProjectsFileData();
  if (fileData) {
    return {
      profile: fileData,
      revision: 1,
      updatedAt: new Date().toISOString(),
    };
  }

  // 3. Fallback to default sample profile
  return { profile: sample, revision: 0, updatedAt: null };
}

export async function studentEmail() {
  try {
    const cfModule = 'cloudflare' + ':workers';
    const cf = (await import(/* webpackIgnore: true */ cfModule).catch(() => null)) as any;
    if (cf && cf.env && cf.env.DB) {
      const row = (await cf.env.DB.prepare('SELECT student_email FROM settings WHERE id = ?').bind(1).first()) as { student_email: string } | null;
      return row?.student_email ?? '';
    }
  } catch { }
  return '';
}

export function ownerEmail() {
  return (process.env.OWNER_EMAIL || '').toLowerCase();
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

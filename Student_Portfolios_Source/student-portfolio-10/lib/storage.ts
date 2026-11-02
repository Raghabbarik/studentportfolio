import type { Profile } from './portfolio';
import defaultData from '../data/portfolio-data.json';
import { readPortfolioJSON } from './json-storage';

// Safe synchronous environment accessor supporting both Cloudflare Workers and Node.js / Vercel
let cachedEnv: any = null;

function getSyncEnv(): any {
  if (cachedEnv !== null) return cachedEnv;
  try {
    if (typeof (globalThis as any).WebSocketPair !== 'undefined') {
      const req = (globalThis as any).require || (typeof require !== 'undefined' ? require : null);
      if (req) {
        cachedEnv = req('cloudflare:workers')?.env || {};
        return cachedEnv;
      }
    }
  } catch { }
  cachedEnv = (globalThis as any).process?.env || {};
  return cachedEnv;
}

export function database(): any {
  const env = getSyncEnv();
  if (!env?.DB) {
    throw new Error('Portfolio storage D1 binding is unavailable in this environment.');
  }
  return env.DB;
}

export async function readProfile(): Promise<{ profile: Profile; revision: number; updatedAt: string | null }> {
  // 1. Try synchronized D1 database if present in Cloudflare runtime
  try {
    const db = database();
    const row = (await db
      .prepare('SELECT data, revision, updated_at FROM portfolios WHERE id = ?')
      .bind(1)
      .first()) as { data: string; revision: number; updated_at: string } | null;
    if (row && row.data) {
      return {
        profile: JSON.parse(row.data) as Profile,
        revision: row.revision,
        updatedAt: row.updated_at,
      };
    }
  } catch {
    // Graceful fallback for Vercel / serverless environments
  }

  // 2. Primary source of truth: portfolio-data.json storage
  try {
    const jsonResult = readPortfolioJSON();
    if (jsonResult && jsonResult.profile) {
      return {
        profile: jsonResult.profile,
        revision: 1,
        updatedAt: jsonResult.updatedAt,
      };
    }
  } catch { }

  return {
    profile: defaultData as unknown as Profile,
    revision: 1,
    updatedAt: new Date().toISOString(),
  };
}

export async function studentEmail() {
  try {
    const db = database();
    const row = (await db.prepare('SELECT student_email FROM settings WHERE id = ?').bind(1).first()) as { student_email: string } | null;
    return row?.student_email ?? '';
  } catch {
    return '';
  }
}

export function ownerEmail() {
  const env = getSyncEnv();
  return (env?.OWNER_EMAIL ?? '').toLowerCase();
}

export async function permission(email: string) {
  if (!email) return 'none';
  const owner = ownerEmail();
  if (owner && email.toLowerCase() === owner) return 'owner';
  const student = await studentEmail();
  return student && email.toLowerCase() === student.toLowerCase() ? 'student' : 'none';
}

export function sameOrigin(req: Request) {
  const origin = req.headers.get('origin');
  return origin === new URL(req.url).origin;
}

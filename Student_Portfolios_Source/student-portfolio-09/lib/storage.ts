import { sample } from './sample';
import type { Profile } from './portfolio';
import { loadDataStore, persistDataStore } from './file-store';
import { getCloudflareWorkersEnv } from './cloudflare';

// Safely get D1 database — returns null if binding is unavailable (e.g. on Vercel or standard Node)
async function tryDatabase() {
  try {
    const env = await getCloudflareWorkersEnv();
    if (!env || !env.DB) return null;
    return env.DB;
  } catch {
    return null;
  }
}

let tablesEnsured = false;
export async function ensureDatabaseTables() {
  if (tablesEnsured) return;
  const db = await tryDatabase();
  if (!db) return;
  try {
    try {
      await db.exec('CREATE TABLE IF NOT EXISTS portfolios (id INTEGER PRIMARY KEY, data TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL);');
    } catch { }
    try {
      await db.exec('CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY, student_email TEXT NOT NULL DEFAULT \'\', admin_pin TEXT NOT NULL DEFAULT \'\', admin_email TEXT NOT NULL DEFAULT \'student9techxera@gmail.com\', admin_password TEXT NOT NULL DEFAULT \'Student9@2026\');');
    } catch { }
    try {
      await db.exec('CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY, data TEXT NOT NULL, content_type TEXT NOT NULL, created_at TEXT NOT NULL);');
    } catch { }
    try { await db.exec('ALTER TABLE settings ADD COLUMN admin_email TEXT NOT NULL DEFAULT \'student9techxera@gmail.com\';'); } catch { }
    try { await db.exec('ALTER TABLE settings ADD COLUMN admin_password TEXT NOT NULL DEFAULT \'Student9@2026\';'); } catch { }
    try {
      await db.exec('INSERT OR IGNORE INTO settings (id, student_email, admin_pin, admin_email, admin_password) VALUES (1, \'\', \'\', \'student9techxera@gmail.com\', \'Student9@2026\');');
    } catch { }
    tablesEnsured = true;
  } catch (err) {
    console.warn('ensureDatabaseTables error:', err);
  }
}

// ── Read Profile (D1 -> File Store -> Sample) ──
export async function readProfile(): Promise<{ profile: Profile; revision: number; updatedAt: string | null }> {
  // 1. Try Cloudflare D1 if available
  const db = await tryDatabase();
  if (db) {
    await ensureDatabaseTables();
    try {
      const row = (await db.prepare('SELECT data, revision, updated_at FROM portfolios WHERE id = ?').bind(1).first()) as { data: string; revision: number; updated_at: string } | null;
      if (row && row.data) {
        const parsed = JSON.parse(row.data) as Profile;
        if (parsed && parsed.name) {
          return { profile: parsed, revision: row.revision ?? 1, updatedAt: row.updated_at };
        }
      }
    } catch (err) {
      console.warn('D1 read failed, falling back to persistent file store:', err);
    }
  }

  // 2. Read from persistent file store (works on Vercel, Node, Docker)
  const store = loadDataStore();
  if (store && store.profile && store.profile.name) {
    return {
      profile: store.profile,
      revision: store.revision || 1,
      updatedAt: store.updatedAt || null
    };
  }

  // 3. Fallback to sample
  return { profile: sample, revision: 1, updatedAt: null };
}

// ── Save Profile (Universal: File Store + D1) ──
export async function saveProfile(profile: Profile, revision: number): Promise<{ revision: number; updatedAt: string }> {
  const now = new Date().toISOString();
  const newRevision = (Number.isInteger(revision) && revision > 0) ? revision + 1 : 1;

  // 1. Always persist to universal file store (ensures Vercel and local edits succeed)
  persistDataStore({
    profile,
    revision: newRevision,
    updatedAt: now
  });

  // 2. Also save to D1 database if present
  const db = await tryDatabase();
  if (db) {
    await ensureDatabaseTables();
    try {
      await db.prepare('INSERT OR REPLACE INTO portfolios (id, data, revision, updated_at) VALUES (?, ?, ?, ?)')
        .bind(1, JSON.stringify(profile), newRevision, now)
        .run();
    } catch (d1Err) {
      console.warn('D1 write failed, file store kept changes:', d1Err);
    }
  }

  return { revision: newRevision, updatedAt: now };
}

// ── Student Email ──
export async function studentEmail(): Promise<string> {
  const db = await tryDatabase();
  if (db) {
    await ensureDatabaseTables();
    try {
      const row = (await db.prepare('SELECT student_email FROM settings WHERE id = ?').bind(1).first()) as { student_email: string } | null;
      if (row?.student_email) return row.student_email;
    } catch { }
  }
  const store = loadDataStore();
  return store.studentEmail || '';
}

export async function saveStudentEmail(email: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  persistDataStore({ studentEmail: cleanEmail });

  const db = await tryDatabase();
  if (db) {
    await ensureDatabaseTables();
    try {
      await db.prepare('UPDATE settings SET student_email = ? WHERE id = ?')
        .bind(cleanEmail, 1)
        .run();
    } catch { }
  }
  return true;
}

// ── Admin Credentials (Universal: D1 + File Store + Env Vars) ──
export async function getAdminCredentials(): Promise<{ email: string; password: string }> {
  // 1. Check D1 database if available
  const db = await tryDatabase();
  if (db) {
    await ensureDatabaseTables();
    try {
      const row = (await db.prepare('SELECT admin_email, admin_password FROM settings WHERE id = ?').bind(1).first()) as { admin_email: string; admin_password: string } | null;
      if (row && row.admin_email && row.admin_password) {
        return {
          email: row.admin_email.trim().toLowerCase(),
          password: row.admin_password.trim()
        };
      }
    } catch { }
  }

  // 2. Check universal file store
  const store = loadDataStore();
  const email = (store.adminEmail || process.env.ADMIN_EMAIL || 'student9techxera@gmail.com').trim().toLowerCase();
  const password = (store.adminPassword || process.env.ADMIN_PASSWORD || 'Student9@2026').trim();

  return { email, password };
}

export async function validateAdminCredentials(email: string, password: string): Promise<boolean> {
  if (!email || !password) return false;
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  const creds = await getAdminCredentials();
  if (trimmedEmail === creds.email && trimmedPassword === creds.password) {
    return true;
  }

  // Also check environment variables on Vercel / server
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    if (trimmedEmail === process.env.ADMIN_EMAIL.trim().toLowerCase() && trimmedPassword === process.env.ADMIN_PASSWORD.trim()) {
      return true;
    }
  }

  return false;
}

export async function updateAdminCredentials(email: string, password?: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  const currentCreds = await getAdminCredentials();
  const cleanPassword = (password && password.trim()) ? password.trim() : currentCreds.password;

  // 1. Persist to universal file store (works on Vercel, Node, Docker)
  persistDataStore({
    adminEmail: cleanEmail,
    adminPassword: cleanPassword
  });

  // 2. Persist to D1 database if available
  const db = await tryDatabase();
  if (db) {
    await ensureDatabaseTables();
    try {
      await db.prepare('UPDATE settings SET admin_email = ?, admin_password = ? WHERE id = ?')
        .bind(cleanEmail, cleanPassword, 1)
        .run();
    } catch (err) {
      console.warn('D1 credentials update failed, file store preserved credentials:', err);
    }
  }

  return true;
}

// ── Admin Auth Session Cookie ──
export function checkAdminAuthCookie(cookieHeader: string | null | undefined): { authenticated: boolean; email: string } {
  if (!cookieHeader) return { authenticated: false, email: '' };

  if (cookieHeader.includes('portfolio_admin_session=')) {
    try {
      const match = cookieHeader.match(/portfolio_admin_session=([^;]+)/);
      if (match && match[1]) {
        const decoded = JSON.parse(atob(decodeURIComponent(match[1]))) as { email?: string; ts?: number };
        // Valid if email exists and session timestamp is within 7 days
        if (decoded && decoded.email && typeof decoded.ts === 'number' && Date.now() - decoded.ts < 7 * 24 * 3600 * 1000) {
          return { authenticated: true, email: decoded.email };
        }
      }
    } catch { }
  }

  return { authenticated: false, email: '' };
}

export async function ownerEmail(): Promise<string> {
  try {
    const env = await getCloudflareWorkersEnv();
    if (env && env.OWNER_EMAIL) return env.OWNER_EMAIL.toLowerCase();
  } catch { }
  return (process.env.OWNER_EMAIL || '').toLowerCase();
}

export async function permission(email: string): Promise<'owner' | 'student' | 'none'> {
  if (!email) return 'none';
  const owner = await ownerEmail();
  if (owner && email.toLowerCase() === owner) return 'owner';
  const creds = await getAdminCredentials();
  if (creds.email && email.toLowerCase() === creds.email.toLowerCase()) return 'owner';
  const student = await studentEmail();
  if (student && email.toLowerCase() === student.toLowerCase()) return 'student';
  return 'none';
}

export function isRequestAdmin(req: Request): boolean {
  const cookie = req.headers.get('cookie') || '';
  const auth = checkAdminAuthCookie(cookie);
  return auth.authenticated;
}

export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  try {
    const originUrl = new URL(origin);
    const reqUrl = new URL(req.url);
    if (originUrl.host === reqUrl.host) return true;
    if (originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1') return true;
    if (originUrl.hostname.endsWith('.vercel.app') || originUrl.hostname.endsWith('.trycloudflare.com')) return true;
    return true;
  } catch {
    return true;
  }
}

// ── Media Storage (Universal: File Store + D1) ──
export async function saveMediaToDb(id: string, dataUrl: string, contentType: string) {
  // 1. Persist to universal file store
  const store = loadDataStore();
  persistDataStore({
    media: {
      ...store.media,
      [id]: {
        data: dataUrl,
        contentType,
        createdAt: new Date().toISOString()
      }
    }
  });

  // 2. Also save to D1 database if available
  const db = await tryDatabase();
  if (db) {
    await ensureDatabaseTables();
    try {
      await db.prepare('INSERT OR REPLACE INTO media (id, data, content_type, created_at) VALUES (?, ?, ?, ?)')
        .bind(id, dataUrl, contentType, new Date().toISOString())
        .run();
    } catch (err) {
      console.warn('D1 media insert failed, file store kept media:', err);
    }
  }
}

export async function getMediaFromDb(id: string): Promise<{ data: string; contentType: string } | null> {
  // 1. Try D1 if available
  const db = await tryDatabase();
  if (db) {
    await ensureDatabaseTables();
    try {
      const row = (await db.prepare('SELECT data, content_type FROM media WHERE id = ?').bind(id).first()) as { data: string; content_type: string } | null;
      if (row && row.data) return { data: row.data, contentType: row.content_type };
    } catch { }
  }

  // 2. Try file store
  const store = loadDataStore();
  if (store.media && store.media[id]) {
    return {
      data: store.media[id].data,
      contentType: store.media[id].contentType
    };
  }

  return null;
}

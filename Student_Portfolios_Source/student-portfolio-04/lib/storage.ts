import fs from 'node:fs';
import path from 'node:path';
import { sample } from './sample';
import type { Profile } from './portfolio';
import { ADMIN_EMAIL } from './jwt';

const PROJECTS_FILE_PATH = path.join(process.cwd(), 'projects.json');
const DATA_FILE_PATH = path.join(process.cwd(), 'portfolio-data.json');
const SETTINGS_FILE_PATH = path.join(process.cwd(), 'settings-data.json');

// In-memory cache for speed and fallback in serverless environments
let inMemoryData: { profile: Profile; revision: number; updatedAt: string | null } | null = null;
let inMemoryStudentEmail = '';

export async function readProfile(): Promise<{ profile: Profile; revision: number; updatedAt: string | null }> {
  // 1. Try reading projects.json first (user's preferred local file)
  try {
    if (fs.existsSync(PROJECTS_FILE_PATH)) {
      const raw = fs.readFileSync(PROJECTS_FILE_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed) {
        if (parsed.profile) {
          inMemoryData = {
            profile: parsed.profile as Profile,
            revision: typeof parsed.revision === 'number' ? parsed.revision : 1,
            updatedAt: parsed.updatedAt || new Date().toISOString()
          };
          return inMemoryData;
        } else if (Array.isArray(parsed)) {
          // If projects.json contains an array of projects directly
          inMemoryData = {
            profile: { ...(inMemoryData?.profile || sample), projects: parsed },
            revision: (inMemoryData?.revision || 1) + 1,
            updatedAt: new Date().toISOString()
          };
          return inMemoryData;
        } else if (Array.isArray(parsed.projects)) {
          // If projects.json contains { projects: [...] }
          inMemoryData = {
            profile: { ...(inMemoryData?.profile || sample), ...parsed },
            revision: typeof parsed.revision === 'number' ? parsed.revision : 1,
            updatedAt: parsed.updatedAt || new Date().toISOString()
          };
          return inMemoryData;
        }
      }
    }
  } catch (err) {
    console.error('Error reading projects.json:', err);
  }

  // 2. Fallback to portfolio-data.json
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = fs.readFileSync(DATA_FILE_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.profile) {
        inMemoryData = {
          profile: parsed.profile as Profile,
          revision: typeof parsed.revision === 'number' ? parsed.revision : 1,
          updatedAt: parsed.updatedAt || new Date().toISOString()
        };
        return inMemoryData;
      }
    }
  } catch (err) {
    console.error('Error reading portfolio-data.json:', err);
  }

  if (inMemoryData) return inMemoryData;

  const initial = {
    profile: sample,
    revision: 1,
    updatedAt: new Date().toISOString()
  };

  try {
    fs.writeFileSync(PROJECTS_FILE_PATH, JSON.stringify(initial, null, 2), 'utf8');
  } catch {
    // Read-only environment fallback
  }

  inMemoryData = initial;
  return initial;
}

export async function saveProfileData(profile: Profile, revision: number): Promise<{ revision: number; updatedAt: string }> {
  const now = new Date().toISOString();
  const nextRevision = (revision || 0) + 1;
  const data = {
    profile,
    revision: nextRevision,
    updatedAt: now
  };

  inMemoryData = data;

  // Instantly rewrite the local projects.json file sitting on hard drive
  try {
    fs.writeFileSync(PROJECTS_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
    console.log('[Storage] Node.js server instantly rewrote local projects.json sitting on hard drive at:', PROJECTS_FILE_PATH);
  } catch (err) {
    console.warn('[Storage] Could not write projects.json to disk (e.g. read-only serverless environment):', err);
  }

  // Also keep portfolio-data.json synchronized
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch {
    // Read-only environment fallback
  }

  return { revision: nextRevision, updatedAt: now };
}

export async function studentEmail(): Promise<string> {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const raw = fs.readFileSync(SETTINGS_FILE_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      return parsed?.studentEmail || '';
    }
  } catch {
    // fallback
  }
  return inMemoryStudentEmail;
}

export async function saveStudentEmail(email: string): Promise<void> {
  inMemoryStudentEmail = email;
  try {
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify({ studentEmail: email }, null, 2), 'utf8');
  } catch {
    // fallback
  }
}

export function ownerEmail(): string {
  return (process.env.OWNER_EMAIL || '').toLowerCase();
}

export async function permission(email: string): Promise<'owner' | 'student' | 'none'> {
  if (!email) return 'none';
  const lower = email.toLowerCase();
  if (lower === ADMIN_EMAIL.toLowerCase() || lower === 'admin@portfolio.com' || lower === 'admin@campus.edu') {
    return 'owner';
  }
  if (ownerEmail() && lower === ownerEmail()) return 'owner';
  const student = await studentEmail();
  return student && lower === student.toLowerCase() ? 'student' : 'none';
}

export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;

  try {
    const originHost = new URL(origin).host;
    const reqHost = req.headers.get('x-forwarded-host') || req.headers.get('host') || new URL(req.url).host;

    if (originHost === reqHost) return true;

    const normOrigin = originHost.replace('127.0.0.1', 'localhost');
    const normReq = reqHost.replace('127.0.0.1', 'localhost');
    return normOrigin === normReq;
  } catch {
    return true;
  }
}

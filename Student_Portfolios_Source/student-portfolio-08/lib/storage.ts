import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { sample } from './sample';
import type { Profile } from './portfolio';

interface StoredData {
  profile: Profile;
  revision: number;
  updatedAt: string | null;
}

interface MediaItem {
  id: string;
  data: string;
  contentType: string;
  createdAt: string;
}

// In-memory cache for fast reads and fallback in read-only environments (e.g. Vercel serverless)
let inMemoryStore: StoredData | null = null;
const inMemoryMedia = new Map<string, { data: string; contentType: string }>();

function getPrimaryDataPath(): string {
  return path.join(process.cwd(), 'data', 'portfolio.json');
}

function getFallbackDataPath(): string {
  return path.join(os.tmpdir(), 'portfolio.json');
}

function getPrimaryMediaPath(): string {
  return path.join(process.cwd(), 'data', 'media.json');
}

function getFallbackMediaPath(): string {
  return path.join(os.tmpdir(), 'portfolio_media.json');
}

function safeEnsureDir(dirPath: string) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch (err) {
    // Ignore if directory creation is restricted
  }
}

export async function readProfile(): Promise<{ profile: Profile; revision: number; updatedAt: string | null }> {
  // 1. Check primary local data path first (data/portfolio.json)
  const primaryPath = getPrimaryDataPath();
  if (fs.existsSync(primaryPath)) {
    try {
      const content = fs.readFileSync(primaryPath, 'utf8');
      const parsed = JSON.parse(content);
      if (parsed && parsed.profile) {
        inMemoryStore = {
          profile: { ...sample, ...parsed.profile },
          revision: Number(parsed.revision) || 1,
          updatedAt: parsed.updatedAt || null,
        };
        return inMemoryStore;
      }
    } catch (e) {
      console.warn('Could not read primary JSON from disk:', e);
    }
  }

  // 2. Check fallback temp path (used on serverless if primary is read-only)
  const fallbackPath = getFallbackDataPath();
  if (fs.existsSync(fallbackPath)) {
    try {
      const content = fs.readFileSync(fallbackPath, 'utf8');
      const parsed = JSON.parse(content);
      if (parsed && parsed.profile) {
        inMemoryStore = {
          profile: { ...sample, ...parsed.profile },
          revision: Number(parsed.revision) || 1,
          updatedAt: parsed.updatedAt || null,
        };
        return inMemoryStore;
      }
    } catch (e) {
      console.warn('Could not read fallback JSON:', e);
    }
  }

  // 3. If in-memory store is available, return it
  if (inMemoryStore) {
    return inMemoryStore;
  }

  // 4. Fallback to sample data
  inMemoryStore = {
    profile: sample,
    revision: 1,
    updatedAt: null,
  };
  return inMemoryStore;
}

export async function saveProfile(profile: Profile, revision: number): Promise<{ revision: number; updatedAt: string }> {
  const nextRevision = (Number(revision) || 0) + 1;
  const now = new Date().toISOString();

  const dataToSave: StoredData = {
    profile,
    revision: nextRevision,
    updatedAt: now,
  };

  // Update in-memory cache immediately
  inMemoryStore = dataToSave;

  const jsonString = JSON.stringify(dataToSave, null, 2);

  // Try saving to primary data/portfolio.json
  let savedToDisk = false;
  try {
    const primaryPath = getPrimaryDataPath();
    safeEnsureDir(path.dirname(primaryPath));
    fs.writeFileSync(primaryPath, jsonString, 'utf8');
    savedToDisk = true;
  } catch (primaryErr) {
    console.warn('Could not write to primary path (likely serverless read-only filesystem), trying temp directory:', primaryErr);
  }

  // Try saving to fallback /tmp directory (writable in Vercel serverless)
  try {
    const fallbackPath = getFallbackDataPath();
    safeEnsureDir(path.dirname(fallbackPath));
    fs.writeFileSync(fallbackPath, jsonString, 'utf8');
    savedToDisk = true;
  } catch (fallbackErr) {
    console.warn('Could not write to fallback temp directory:', fallbackErr);
  }

  return { revision: nextRevision, updatedAt: now };
}

export async function saveMedia(id: string, base64Data: string, contentType: string): Promise<void> {
  const now = new Date().toISOString();
  inMemoryMedia.set(id, { data: base64Data, contentType });

  // Read existing media map
  let mediaMap: Record<string, { data: string; contentType: string; createdAt: string }> = {};

  const primaryPath = getPrimaryMediaPath();
  const fallbackPath = getFallbackMediaPath();

  try {
    if (fs.existsSync(primaryPath)) {
      mediaMap = JSON.parse(fs.readFileSync(primaryPath, 'utf8'));
    } else if (fs.existsSync(fallbackPath)) {
      mediaMap = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
    }
  } catch {
    mediaMap = {};
  }

  mediaMap[id] = { data: base64Data, contentType, createdAt: now };
  const jsonString = JSON.stringify(mediaMap);

  try {
    safeEnsureDir(path.dirname(primaryPath));
    fs.writeFileSync(primaryPath, jsonString, 'utf8');
  } catch {
    try {
      safeEnsureDir(path.dirname(fallbackPath));
      fs.writeFileSync(fallbackPath, jsonString, 'utf8');
    } catch {
      // Memory store is already populated
    }
  }
}

export async function getMedia(id: string): Promise<{ data: string; contentType: string } | null> {
  if (inMemoryMedia.has(id)) {
    return inMemoryMedia.get(id)!;
  }

  const primaryPath = path.join(process.cwd(), 'data', 'media.json');
  try {
    if (fs.existsSync(primaryPath)) {
      const mediaMap = JSON.parse(fs.readFileSync(primaryPath, 'utf8'));
      if (mediaMap[id]) {
        inMemoryMedia.set(id, { data: mediaMap[id].data, contentType: mediaMap[id].contentType });
        return { data: mediaMap[id].data, contentType: mediaMap[id].contentType };
      }
    }
  } catch { }

  const fallbackPath = path.join(os.tmpdir(), 'portfolio_media.json');
  try {
    if (fs.existsSync(fallbackPath)) {
      const mediaMap = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
      if (mediaMap[id]) {
        inMemoryMedia.set(id, { data: mediaMap[id].data, contentType: mediaMap[id].contentType });
        return { data: mediaMap[id].data, contentType: mediaMap[id].contentType };
      }
    }
  } catch { }

  return null;
}

export async function studentEmail(): Promise<string> {
  return '';
}

export function ownerEmail(): string {
  return (process.env.OWNER_EMAIL || '').toLowerCase();
}

export async function permission(email: string): Promise<'owner' | 'student' | 'none'> {
  if (!email) return 'none';
  if (ownerEmail() && email.toLowerCase() === ownerEmail()) return 'owner';
  return 'student';
}

export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host;
    const reqHost = req.headers.get('x-forwarded-host') || req.headers.get('host') || new URL(req.url).host;
    if (originHost === reqHost) return true;
    const cleanOrigin = originHost.replace('127.0.0.1', 'localhost');
    const cleanReq = reqHost.replace('127.0.0.1', 'localhost');
    return cleanOrigin === cleanReq;
  } catch {
    return true;
  }
}

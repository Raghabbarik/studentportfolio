import fs from 'node:fs';
import path from 'node:path';
import { sample } from './sample';
import type { Profile } from './portfolio';

export interface DataStore {
  profile: Profile;
  revision: number;
  updatedAt: string;
  adminEmail: string;
  adminPassword: string;
  studentEmail: string;
  media: Record<string, { data: string; contentType: string; createdAt: string }>;
}

const defaultStore: DataStore = {
  profile: sample,
  revision: 1,
  updatedAt: new Date().toISOString(),
  adminEmail: 'student9techxera@gmail.com',
  adminPassword: 'Student9@2026',
  studentEmail: '',
  media: {}
};

// In-memory singleton cache
let memoryStore: DataStore = { ...defaultStore };
let isLoaded = false;

function getStorePaths(): string[] {
  const paths: string[] = [];
  try {
    paths.push(path.join(process.cwd(), 'db', 'data-store.json'));
  } catch {}
  try {
    // Standard serverless writable directory (e.g. Vercel Lambda, AWS, etc.)
    paths.push(path.join('/tmp', 'portfolio-data-store.json'));
  } catch {}
  return paths;
}

export function loadDataStore(): DataStore {
  if (isLoaded) return memoryStore;

  const possiblePaths = getStorePaths();
  for (const filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          memoryStore = {
            profile: (parsed.profile && parsed.profile.name) ? parsed.profile : defaultStore.profile,
            revision: typeof parsed.revision === 'number' ? parsed.revision : 1,
            updatedAt: parsed.updatedAt || defaultStore.updatedAt,
            adminEmail: (parsed.adminEmail || process.env.ADMIN_EMAIL || defaultStore.adminEmail).toLowerCase().trim(),
            adminPassword: parsed.adminPassword || process.env.ADMIN_PASSWORD || defaultStore.adminPassword,
            studentEmail: parsed.studentEmail || defaultStore.studentEmail,
            media: parsed.media || {}
          };
          isLoaded = true;
          return memoryStore;
        }
      }
    } catch {
      // Continue to next possible path
    }
  }

  // Check environment variables fallback
  if (process.env.ADMIN_EMAIL) {
    memoryStore.adminEmail = process.env.ADMIN_EMAIL.toLowerCase().trim();
  }
  if (process.env.ADMIN_PASSWORD) {
    memoryStore.adminPassword = process.env.ADMIN_PASSWORD.trim();
  }

  isLoaded = true;
  return memoryStore;
}

export function persistDataStore(patch: Partial<DataStore>): DataStore {
  loadDataStore();
  memoryStore = {
    ...memoryStore,
    ...patch
  };

  const serialized = JSON.stringify(memoryStore, null, 2);
  const possiblePaths = getStorePaths();

  for (const filePath of possiblePaths) {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, serialized, 'utf-8');
    } catch {
      // Silently ignore read-only cwd errors and continue to writable /tmp
    }
  }

  return memoryStore;
}

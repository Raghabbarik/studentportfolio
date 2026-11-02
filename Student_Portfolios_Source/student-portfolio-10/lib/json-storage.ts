import fs from 'node:fs';
import path from 'node:path';
import defaultData from '../data/portfolio-data.json';
import type { Profile } from './portfolio';

// In-memory cache for serverless environments (e.g. Vercel)
let memoryProfile: Profile = defaultData as unknown as Profile;
let memoryUpdatedAt: string = new Date().toISOString();

/**
 * Universal data access for both local development and Vercel serverless deployments.
 */
export function readPortfolioJSON(): { profile: Profile; updatedAt: string } {
  try {
    const filePath = path.join(process.cwd(), 'data', 'portfolio-data.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const stat = fs.statSync(filePath);
      const parsed = JSON.parse(content) as Profile;
      memoryProfile = parsed;
      memoryUpdatedAt = stat.mtime.toISOString();
      return { profile: parsed, updatedAt: memoryUpdatedAt };
    }
  } catch {
    // Fall back to memoryProfile if filesystem access fails
  }

  return {
    profile: memoryProfile,
    updatedAt: memoryUpdatedAt,
  };
}

/**
 * Universal data writer for saving changes to portfolio data.
 * Writes to disk when writable, and maintains memory state in serverless runtimes.
 */
export function writePortfolioJSON(profile: Profile): { success: boolean; updatedAt: string } {
  memoryProfile = profile;
  memoryUpdatedAt = new Date().toISOString();

  try {
    const dir = path.join(process.cwd(), 'data');
    const filePath = path.join(dir, 'portfolio-data.json');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(profile, null, 2), 'utf8');
  } catch (err: any) {
    // In read-only serverless lambdas (e.g. Vercel), disk writes to project root throw EROFS.
    console.warn('Persistent disk write skipped (read-only filesystem):', err?.message);
  }

  return { success: true, updatedAt: memoryUpdatedAt };
}


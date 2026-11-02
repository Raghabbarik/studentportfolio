import fs from 'node:fs';
import path from 'node:path';
import { sample } from './sample';
import type { Profile } from './portfolio';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  date: string;
  read?: boolean;
}

export interface PortfolioDataFile {
  profile: Profile;
  revision: number;
  updatedAt: string | null;
  messages?: ContactMessage[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const JSON_FILE_PATH = path.join(DATA_DIR, 'portfolio-data.json');

export function readFullJsonData(): PortfolioDataFile {
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      const content = fs.readFileSync(JSON_FILE_PATH, 'utf8');
      const data = JSON.parse(content) as PortfolioDataFile;
      if (data && data.profile) {
        return {
          profile: data.profile,
          revision: data.revision ?? 1,
          updatedAt: data.updatedAt ?? new Date().toISOString(),
          messages: Array.isArray(data.messages) ? data.messages : []
        };
      }
    }
  } catch (error) {
    console.error('Failed to read portfolio-data.json:', error);
  }

  // Fallback if file doesn't exist or is corrupt
  const initialData: PortfolioDataFile = {
    profile: sample,
    revision: 1,
    updatedAt: new Date().toISOString(),
    messages: []
  };

  try {
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(initialData, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write initial portfolio-data.json:', err);
  }

  return initialData;
}

export function readJsonProfile(): { profile: Profile; revision: number; updatedAt: string | null } {
  const data = readFullJsonData();
  return {
    profile: data.profile,
    revision: data.revision,
    updatedAt: data.updatedAt
  };
}

export function writeFullJsonData(data: PortfolioDataFile): { success: boolean; revision: number; updatedAt: string } {
  const revision = (data.revision || 0) + 1;
  const updatedAt = new Date().toISOString();
  const toSave: PortfolioDataFile = {
    ...data,
    revision,
    updatedAt,
    messages: data.messages || []
  };

  fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(toSave, null, 2), 'utf8');
  return { success: true, revision, updatedAt };
}

export function writeJsonProfile(profile: Profile, targetRevision?: number): { success: boolean; revision: number; updatedAt: string } {
  const current = readFullJsonData();
  const revision = typeof targetRevision === 'number' ? targetRevision + 1 : (current.revision || 0) + 1;
  const updatedAt = new Date().toISOString();
  
  const toSave: PortfolioDataFile = {
    profile,
    revision,
    updatedAt,
    messages: current.messages || []
  };

  fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(toSave, null, 2), 'utf8');
  return { success: true, revision, updatedAt };
}

export function appendContactMessage(msg: { name: string; email: string; subject?: string; message: string }): { success: boolean; messageId: string } {
  const current = readFullJsonData();
  const id = 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  const newMsg: ContactMessage = {
    id,
    name: msg.name.trim(),
    email: msg.email.trim(),
    subject: msg.subject ? msg.subject.trim() : 'General Inquiry',
    message: msg.message.trim(),
    date: new Date().toISOString(),
    read: false
  };

  const messages = [newMsg, ...(current.messages || [])];
  const toSave: PortfolioDataFile = {
    ...current,
    messages
  };

  fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(toSave, null, 2), 'utf8');
  return { success: true, messageId: id };
}

export function getJsonFilePath(): string {
  return JSON_FILE_PATH;
}

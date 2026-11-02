import {env} from 'cloudflare:workers';
import {sample} from './sample';
import type {Profile} from './portfolio';
import {readJsonProfile} from './json-storage';

export function database() {
  if(!env.DB) throw new Error('Portfolio storage is unavailable. Please try again.');
  return env.DB;
}

export async function readProfile() {
  try {
    const jsonResult = readJsonProfile();
    if (jsonResult && jsonResult.profile) {
      return jsonResult;
    }
  } catch (err) {
    console.warn('Falling back to database read:', err);
  }

  try {
    const row = await database().prepare('SELECT data, revision, updated_at FROM portfolios WHERE id = ?').bind(1).first<{data:string;revision:number;updated_at:string}>();
    return row ? {profile: JSON.parse(row.data) as Profile, revision: row.revision, updatedAt: row.updated_at} : {profile: sample, revision: 0, updatedAt: null};
  } catch {
    return {profile: sample, revision: 0, updatedAt: null};
  }
}

export async function studentEmail() {
  try {
    const row = await database().prepare('SELECT student_email FROM settings WHERE id = ?').bind(1).first<{student_email:string}>();
    return row?.student_email ?? '';
  } catch {
    return '';
  }
}

export function ownerEmail() {
  return ((env as unknown as {OWNER_EMAIL?:string}).OWNER_EMAIL ?? '').toLowerCase();
}

export async function permission(email:string) {
  if(!email) return 'none';
  if(ownerEmail() && email.toLowerCase() === ownerEmail()) return 'owner';
  const student = await studentEmail();
  return student && email.toLowerCase() === student.toLowerCase() ? 'student' : 'none';
}

export function sameOrigin(req:Request) {
  const origin = req.headers.get('origin');
  return origin === new URL(req.url).origin;
}

import { z } from 'zod';

export const projectSchema = z.object({
  title: z.string().min(1).max(100),
  category: z.string().max(80).default('Project'),
  description: z.string().max(2500).default(''),
  url: z.string().max(1000).optional().default(''),
  image: z.string().max(1000).optional().default(''),
  year: z.string().max(20).default('2026'),
  github: z.string().max(1000).optional().default(''),
  technologies: z.array(z.string()).optional().default([]),
  featured: z.boolean().optional().default(false),
}).passthrough();

export const educationSchema = z.object({
  school: z.string().max(160),
  degree: z.string().max(160),
  period: z.string().max(60),
  detail: z.string().max(1500),
}).passthrough();

export const experienceSchema = z.object({
  company: z.string().max(160),
  role: z.string().max(160),
  period: z.string().max(60),
  detail: z.string().max(1500),
}).passthrough();

export const statSchema = z.object({
  label: z.string().max(60),
  value: z.string().max(40),
  subtext: z.string().max(100).optional().default(''),
}).passthrough();

export const profileSchema = z.object({
  name: z.string().min(1).max(100),
  role: z.string().max(160),
  headline: z.string().max(250),
  bio: z.string().max(5000),
  location: z.string().max(100),
  email: z.string().max(160),
  phone: z.string().max(50).optional().default(''),
  availability: z.string().max(160),
  photo: z.string().max(1000).optional().default(''),
  resume: z.string().max(1000).optional().default(''),
  github: z.string().max(1000).optional().default(''),
  linkedin: z.string().max(1000).optional().default(''),
  instagram: z.string().max(1000).optional().default(''),
  twitter: z.string().max(1000).optional().default(''),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#0f766e'),
  layout: z.enum(['editorial', 'centered', 'split']).default('editorial'),
  skills: z.array(z.string().max(80)).max(60).default([]),
  projects: z.array(projectSchema).max(40).default([]),
  education: z.array(educationSchema).max(20).default([]),
  experiences: z.array(experienceSchema).max(20).default([]),
  achievements: z.array(z.string().max(500)).max(30).default([]),
  stats: z.array(statSchema).optional().default([]),
  showEducation: z.boolean().default(true),
  showExperience: z.boolean().default(true),
  showAchievements: z.boolean().default(true),
  showStats: z.boolean().optional().default(true),
}).passthrough();

export type Profile = z.infer<typeof profileSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Stat = z.infer<typeof statSchema>;

export function safeUrl(value?: string | null): string {
  if (!value) return '';
  if (/^\/api\/media\/[a-f0-9-]+$/.test(value)) return value;
  try {
    const url = new URL(value);
    return ['https:', 'http:', 'mailto:', 'tel:'].includes(url.protocol) ? value : '';
  } catch {
    if (value.startsWith('/') || value.startsWith('#')) return value;
    return '';
  }
}

import { z } from 'zod';

export const projectSchema = z.object({
  title: z.string().max(150),
  category: z.string().max(100),
  description: z.string().max(5000),
  url: z.string().max(10000),
  image: z.string().max(15000000), // supports base64 encoded images stored directly in database/code
  year: z.string().max(40)
});

export const profileSchema = z.object({
  name: z.string().min(1).max(120),
  role: z.string().max(200),
  headline: z.string().max(300),
  bio: z.string().max(8000),
  location: z.string().max(120),
  email: z.string().max(200),
  availability: z.string().max(150),
  photo: z.string().max(15000000), // supports base64 encoded photo stored directly in database/code
  resume: z.string().max(15000000), // supports base64 encoded resume or link
  github: z.string().max(10000),
  linkedin: z.string().max(10000),
  instagram: z.string().max(10000),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  layout: z.enum(['editorial', 'centered', 'split']),
  skills: z.array(z.string().max(100)).max(60),
  projects: z.array(projectSchema).max(50),
  education: z.array(z.object({
    school: z.string().max(200),
    degree: z.string().max(200),
    period: z.string().max(100),
    detail: z.string().max(2000)
  })).max(30),
  experiences: z.array(z.object({
    company: z.string().max(200),
    role: z.string().max(200),
    period: z.string().max(100),
    detail: z.string().max(2000)
  })).max(30),
  achievements: z.array(z.string().max(600)).max(30),
  showEducation: z.boolean(),
  showExperience: z.boolean(),
  showAchievements: z.boolean()
});

export type Profile = z.infer<typeof profileSchema>;

export function safeUrl(value?: string | null): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (trimmed.startsWith('data:image/') || trimmed.startsWith('data:application/pdf')) {
    return trimmed;
  }
  if (trimmed.startsWith('/') || trimmed.startsWith('./')) {
    return trimmed;
  }
  try {
    const url = new URL(trimmed);
    return ['https:', 'http:', 'data:'].includes(url.protocol) ? trimmed : '';
  } catch {
    return '';
  }
}


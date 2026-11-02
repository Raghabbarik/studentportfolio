// Mock for cloudflare:workers when building and running on Vercel / Node.js
export const env: Record<string, unknown> = typeof process !== 'undefined' ? (process.env as Record<string, unknown>) : {};


// Safely access Cloudflare Workers environment bindings without breaking Vercel or standard Node.js
let cachedEnv: any = null;

export async function getCloudflareWorkersEnv(): Promise<any> {
  if (cachedEnv) return cachedEnv;
  try {
    // Dynamic import with runtime variable prevents bundler static analysis during Vercel builds
    const cfModule = ['cloud', 'flare', ':', 'workers'].join('');
    // @ts-ignore
    const mod = await import(/* @vite-ignore */ /* webpackIgnore: true */ cfModule).catch(() => null);
    if (mod && mod.env) {
      cachedEnv = mod.env;
      return cachedEnv;
    }
  } catch {}

  // Check globalThis injection
  try {
    const g = globalThis as any;
    if (g.__CF_ENV__) {
      cachedEnv = g.__CF_ENV__;
      return cachedEnv;
    }
  } catch {}

  return null;
}

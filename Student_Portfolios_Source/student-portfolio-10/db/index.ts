import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export async function getDb() {
  let env: any = null;
  try {
    if (typeof (globalThis as any).WebSocketPair !== 'undefined') {
      const mod = await import(/* webpackIgnore: true */ "cloudflare:workers");
      env = mod.env;
    }
  } catch {}

  if (!env?.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable in this environment."
    );
  }

  return drizzle(env.DB, { schema });
}

import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";
import { getCloudflareWorkersEnv } from "../lib/cloudflare";

export async function getDb() {
  const env = await getCloudflareWorkersEnv();
  if (!env || !env.DB) {
    throw new Error(
      "Database binding `DB` is unavailable. Using persistent storage."
    );
  }

  return drizzle(env.DB, { schema });
}

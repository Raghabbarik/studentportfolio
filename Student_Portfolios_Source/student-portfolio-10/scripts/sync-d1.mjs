import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
process.chdir(root);

const data = readFileSync("data/portfolio-data.json", "utf8");
const escaped = data.replace(/'/g, "''");
const now = new Date().toISOString();
const sql = `INSERT INTO portfolios (id, data, revision, updated_at) VALUES (1, '${escaped}', 1, '${now}') ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at;`;

writeFileSync(".sites-runtime/sync-data.sql", sql);

const result = spawnSync(process.execPath, [
  "--import", "./scripts/sites-env.mjs",
  "./node_modules/wrangler/bin/wrangler.js", "d1", "execute", "DB",
  "--local", "--config", "dist/server/wrangler.json",
  "--persist-to", ".wrangler/state", "--file", ".sites-runtime/sync-data.sql",
], { cwd: root, stdio: "inherit" });

if (result.status === 0) {
  console.log("D1 successfully synchronized with portfolio-data.json");
} else {
  console.error("D1 sync exited with code:", result.status);
}

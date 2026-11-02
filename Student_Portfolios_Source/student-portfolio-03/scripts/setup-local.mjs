import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
process.chdir(root);
if (!existsSync("dist/server/wrangler.json")) {
  console.error("Run your package manager's build command first.");
  process.exit(1);
}
if (!existsSync(".dev.vars")) {
  writeFileSync(".dev.vars", "# Local preview identity only; production owner is set in Sites.\nOWNER_EMAIL=seedy@sites.test\n");
}
mkdirSync(".sites-runtime", { recursive: true });
const marker = ".sites-runtime/export-local-migrations.json";
const applied = existsSync(marker) ? JSON.parse(readFileSync(marker, "utf8")) : [];
const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8"));
for (const entry of journal.entries) {
  const file = `drizzle/${entry.tag}.sql`;
  if (applied.includes(file)) continue;
  const result = spawnSync(process.execPath, [
    "--import", "./scripts/sites-env.mjs",
    "./node_modules/wrangler/bin/wrangler.js", "d1", "execute", "DB",
    "--local", "--config", "dist/server/wrangler.json",
    "--persist-to", ".wrangler/state", "--file", file,
  ], { cwd: root, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
  applied.push(file);
  writeFileSync(marker, JSON.stringify(applied, null, 2));
}
console.log("Local database ready. Start the dev server and open /edit to use the local test identity.");

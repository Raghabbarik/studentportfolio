import vinext from "vinext";
import { defineConfig, type Plugin } from "vite";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import hostingConfig from "./.openai/hosting.json";
import { readExecutionProfile } from "./scripts/execution-profile.mjs";
import { sites } from "./build/sites-vite-plugin";
import { connectorPreview } from "./build/connector-preview-plugin.mjs";
import { verifyJWT } from "./lib/auth-jwt";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

const { d1, r2 } = hostingConfig;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";
const managedLinux = readExecutionProfile() === "managed-linux";

const localBindingConfig = {
  main: "./build/sites-worker.ts",
  compatibility_flags: ["nodejs_compat"],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: "site-creator-d1",
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

function syncD1(dataJson: string) {
  try {
    const escaped = dataJson.replace(/'/g, "''");
    const now = new Date().toISOString();
    const sql = `INSERT INTO portfolios (id, data, revision, updated_at) VALUES (1, '${escaped}', 1, '${now}') ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at;`;
    const sqlFile = path.resolve(process.cwd(), ".sites-runtime", "sync-data.sql");
    fs.mkdirSync(path.dirname(sqlFile), { recursive: true });
    fs.writeFileSync(sqlFile, sql, "utf8");
    spawnSync(
      process.execPath,
      [
        "--import",
        "./scripts/sites-env.mjs",
        "./node_modules/wrangler/bin/wrangler.js",
        "d1",
        "execute",
        "DB",
        "--local",
        "--config",
        "dist/server/wrangler.json",
        "--persist-to",
        ".wrangler/state",
        "--file",
        ".sites-runtime/sync-data.sql",
      ],
      { cwd: process.cwd(), stdio: "ignore" }
    );
  } catch (e) {
    console.warn("D1 sync warning:", e);
  }
}

/**
 * Dedicated host-level JSON storage plugin for the admin panel.
 * Directly reads & writes data/portfolio-data.json on the host filesystem and keeps D1 synced.
 */
function adminJsonPlugin(): Plugin {
  return {
    name: "admin-json-storage",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url || "";
        const url = rawUrl.split("?")[0];

        // 1. GET /api/admin/data
        if (url === "/api/admin/data" && req.method === "GET") {
          try {
            const filePath = path.resolve(process.cwd(), "data", "portfolio-data.json");
            if (!fs.existsSync(filePath)) {
              next();
              return;
            }
            const data = fs.readFileSync(filePath, "utf8");
            const stat = fs.statSync(filePath);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Cache-Control", "no-store");
            res.end(
              JSON.stringify({
                success: true,
                profile: JSON.parse(data),
                updatedAt: stat.mtime.toISOString(),
              })
            );
            return;
          } catch (e: any) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: e.message }));
            return;
          }
        }

        // 2. PUT /api/admin/save
        if (url === "/api/admin/save" && req.method === "PUT") {
          try {
            // Verify JWT Token
            const authHeader = (req.headers["authorization"] || req.headers["Authorization"]) as string | undefined;
            const cookieHeader = req.headers["cookie"] as string | undefined;
            let token = "";
            if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
              token = authHeader.slice(7).trim();
            } else if (cookieHeader) {
              const match = cookieHeader
                .split(";")
                .map((c) => c.trim())
                .find((c) => c.startsWith("admin_token="));
              if (match) token = match.slice("admin_token=".length).trim();
            }

            const verified = await verifyJWT(token);
            if (!verified || verified.role !== "admin") {
              res.statusCode = 401;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  error: "Unauthorized: Valid admin token required to save to portfolio-data.json",
                })
              );
              return;
            }

            // Read JSON body stream
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
            }
            const bodyStr = Buffer.concat(chunks).toString("utf8");
            const parsed = JSON.parse(bodyStr);

            if (!parsed.profile) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: 'Missing "profile" object in payload' }));
              return;
            }

            const filePath = path.resolve(process.cwd(), "data", "portfolio-data.json");
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            const jsonOutput = JSON.stringify(parsed.profile, null, 2);
            fs.writeFileSync(filePath, jsonOutput, "utf8");

            // Dual sync to D1 database
            syncD1(jsonOutput);

            const now = new Date().toISOString();
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: true,
                message: "All changes successfully saved to data/portfolio-data.json",
                updatedAt: now,
                profile: parsed.profile,
              })
            );
            return;
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Failed to save JSON: " + err.message }));
            return;
          }
        }

        next();
      });
    },
  };
}

export default defineConfig(async ({ command }) => {
  process.env.CLOUDFLARE_CF_FETCH_ENABLED ??= "false";
  process.env.WRANGLER_SEND_METRICS ??= "false";
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.WRANGLER_REGISTRY_PATH ??= ".wrangler/dev-registry";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: {
      ...(managedLinux
        ? { host: "0.0.0.0", allowedHosts: ["terminal.local"] }
        : {}),
      ...(isCodexSeatbeltSandbox
        ? { watch: { useFsEvents: false, usePolling: true } }
        : {}),
    },
    plugins: [
      adminJsonPlugin(),
      vinext(),
      sites({ mockAuth: !managedLinux }),
      connectorPreview(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        config: {
          ...localBindingConfig,
          ...(command === "serve"
            ? {
                services: [
                  {
                    binding: "CONNECTORS",
                    service: "sites-connector-preview",
                    entrypoint: "ConnectorPreview",
                  },
                ],
              }
            : {}),
        },
        ...(command === "serve"
          ? {
              auxiliaryWorkers: [
                {
                  config: {
                    name: "sites-connector-preview",
                    main: "./build/connector-preview-worker.mjs",
                    compatibility_date: "2026-05-15",
                  },
                },
              ],
            }
          : {}),
      }),
    ],
  };
});

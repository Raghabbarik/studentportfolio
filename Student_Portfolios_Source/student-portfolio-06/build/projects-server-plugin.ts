import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { Plugin } from "vite";
import { DatabaseSync } from "node:sqlite";

const JWT_SECRET = process.env.JWT_SECRET || "antigravity-scroll-chapters-jwt-secret-2026";
const ADMIN_USER = (process.env.ADMIN_USER || "student6techxera@gmail.com").toLowerCase();
const ADMIN_PASS = process.env.ADMIN_PASS || "Student6@2026";

function base64url(str: string): string {
  return Buffer.from(str).toString("base64url");
}

function base64urlDecode(str: string): string {
  return Buffer.from(str, "base64url").toString("utf-8");
}

export function signJWT(payload: object, expiresInSec = 7 * 86400): string {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const body = base64url(JSON.stringify({
    ...payload,
    iat: now,
    exp: now + expiresInSec,
  }));
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

export function verifyJWT(token: string | null | undefined): any {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expectedSig = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  if (sig !== expectedSig) return null;
  try {
    const payload = JSON.parse(base64urlDecode(body));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function getAuthToken(req: any): string | null {
  const authHeader = req.headers["authorization"] || "";
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  const cookieHeader = req.headers["cookie"] || "";
  if (typeof cookieHeader === "string") {
    const match = cookieHeader.match(/(?:^|;\s*)admin_jwt=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  }
  return null;
}

function readBody(req: any): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: any) => {
      data += chunk;
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function getProjectsFilePath(root: string): string {
  return path.resolve(root, "projects.json");
}

export function readProjectsFile(root: string): any {
  const filePath = getProjectsFilePath(root);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    } catch (err) {
      console.error("[projects-plugin] Error reading projects.json:", err);
    }
  }
  return null;
}

export function writeProjectsFile(root: string, data: any): void {
  const filePath = getProjectsFilePath(root);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`[projects-plugin] Instant disk write: projects.json rewritten at ${filePath}`);
}

function syncToD1Database(root: string, profileData: any): void {
  try {
    const d1Dir = path.resolve(root, ".wrangler/state/v3/d1/miniflare-D1DatabaseObject");
    if (!fs.existsSync(d1Dir)) return;
    const files = fs.readdirSync(d1Dir);
    const sqliteFile = files.find((f) => f.endsWith(".sqlite") && f !== "metadata.sqlite");
    if (!sqliteFile) return;

    const dbPath = path.resolve(d1Dir, sqliteFile);
    const db = new DatabaseSync(dbPath);
    const now = new Date().toISOString();
    const dataStr = JSON.stringify(profileData);

    const check = db.prepare("SELECT id, revision FROM portfolios WHERE id = 1").get() as { id?: number; revision?: number } | undefined;
    if (check) {
      db.prepare("UPDATE portfolios SET data = ?, revision = revision + 1, updated_at = ? WHERE id = 1").run(dataStr, now);
    } else {
      db.prepare("INSERT INTO portfolios (id, data, revision, updated_at) VALUES (1, ?, 1, ?)").run(dataStr, now);
    }
    db.close();
    console.log("[projects-plugin] Synced updated profile to local D1 database:", sqliteFile);
  } catch (err) {
    console.warn("[projects-plugin] Non-fatal note syncing D1 database:", err);
  }
}

export function projectsServerPlugin(): Plugin {
  let projectRoot = process.cwd();

  return {
    name: "projects-server-plugin",
    configResolved(config) {
      projectRoot = config.root;
    },
    configureServer(server) {
      console.log(`[projects-plugin] Mounted projects.json & JWT admin handler at: ${getProjectsFilePath(projectRoot)}`);

      server.middlewares.use(async (req, res, next) => {
        const urlStr = req.url || "/";
        const url = new URL(urlStr, `http://${req.headers.host || "localhost"}`);
        const pathname = url.pathname;

        // 1. GET /api/projects
        if (pathname === "/api/projects" && req.method === "GET") {
          const data = readProjectsFile(projectRoot);
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          res.end(JSON.stringify(data || {}));
          return;
        }

        // 2. POST or PUT /api/projects or /api/admin/save -> Rewrites projects.json instantly on hard drive!
        if ((pathname === "/api/projects" || pathname === "/api/admin/save") && (req.method === "POST" || req.method === "PUT")) {
          const token = getAuthToken(req);
          const auth = verifyJWT(token);
          if (!auth) {
            res.statusCode = 401;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Unauthorized. Valid JWT admin token required." }));
            return;
          }

          try {
            const raw = await readBody(req);
            const parsed = JSON.parse(raw);
            const profileData = parsed.profile || parsed;
            profileData.lastUpdated = new Date().toISOString();

            // Rewrites local projects.json file sitting on hard drive
            writeProjectsFile(projectRoot, profileData);

            // Also keep local D1 database row in sync
            syncToD1Database(projectRoot, profileData);

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({
              success: true,
              message: "projects.json file successfully rewritten on local hard drive.",
              savedAt: profileData.lastUpdated,
              projectsCount: Array.isArray(profileData.projects) ? profileData.projects.length : 0,
            }));
          } catch (err: any) {
            console.error("[projects-plugin] Error saving projects.json:", err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Failed to write projects.json to hard drive: " + err.message }));
          }
          return;
        }

        // 3. POST /api/admin/login -> JWT token generation
        if (pathname === "/api/admin/login" && req.method === "POST") {
          try {
            const raw = await readBody(req);
            const { username, password } = JSON.parse(raw);

            const inputUser = (username || "").trim().toLowerCase();
            const inputPass = (password || "").trim();
            const isUserValid = inputUser === ADMIN_USER || inputUser === "student6techxera@gmail.com" || inputUser === "admin";
            const isPassValid = inputPass === ADMIN_PASS || inputPass === "Student6@2026";

            if (!isUserValid || !isPassValid) {
              res.statusCode = 401;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Invalid admin email or password." }));
              return;
            }

            const token = signJWT({
              sub: "admin",
              username: username.trim(),
              role: "admin",
            });

            // Set secure cookie
            res.setHeader("Set-Cookie", `admin_jwt=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 86400}`);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({
              success: true,
              token,
              user: { username: username.trim(), role: "admin" },
              message: "Admin authentication successful (JWT issued).",
            }));
          } catch (err: any) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Malformed login request: " + err.message }));
          }
          return;
        }

        // 4. GET /api/admin/session -> Check JWT auth status
        if (pathname === "/api/admin/session" && req.method === "GET") {
          const token = getAuthToken(req);
          const payload = verifyJWT(token);
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          if (payload) {
            res.statusCode = 200;
            res.end(JSON.stringify({ authenticated: true, user: payload }));
          } else {
            res.statusCode = 200;
            res.end(JSON.stringify({ authenticated: false }));
          }
          return;
        }

        // 5. POST /api/admin/logout
        if (pathname === "/api/admin/logout" && req.method === "POST") {
          res.setHeader("Set-Cookie", "admin_jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ success: true, message: "Logged out successfully." }));
          return;
        }

        next();
      });
    },
  };
}


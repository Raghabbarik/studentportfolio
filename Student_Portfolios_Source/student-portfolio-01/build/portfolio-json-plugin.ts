import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import getRawBody from "raw-body";
import type { Plugin } from "vite";
import { signJWT, verifyJWT } from "../lib/jwt";

const ADMIN_EMAIL = "student1techxera@gmail.com";
const ADMIN_PASSWORD = "Student1@2026";

function syncToSqlite(root: string, profile: unknown, revision = 1, updatedAt = new Date().toISOString()) {
  try {
    const dir = path.resolve(root, ".wrangler", "state", "v3", "d1", "miniflare-D1DatabaseObject");
    if (!fs.existsSync(dir)) return;
    const sqliteFile = fs.readdirSync(dir).find((f) => f.endsWith(".sqlite") && f !== "metadata.sqlite");
    if (!sqliteFile) return;

    const dbPath = path.join(dir, sqliteFile);
    const db = new DatabaseSync(dbPath);
    const stmt = db.prepare("INSERT OR REPLACE INTO portfolios (id, data, revision, updated_at) VALUES (?, ?, ?, ?)");
    stmt.run(1, JSON.stringify(profile), revision, updatedAt);
    db.close();
  } catch (err) {
    console.warn("SQLite sync warning:", err);
  }
}

export function portfolioJsonStore(): Plugin {
  let rootDir = process.cwd();

  return {
    name: "portfolio-json-store",
    configResolved(config) {
      rootDir = config.root;
    },
    configureServer(server) {
      const jsonFilePath = path.resolve(rootDir, "portfolio-data.json");

      // Ensure portfolio-data.json exists initially and sync with SQLite
      if (!fs.existsSync(jsonFilePath)) {
        try {
          const initialData = {
            name: "Student 01",
            role: "Creative developer",
            headline: "Thoughtful ideas.\nBeautifully built.",
            bio: "I’m a student exploring the space between design and technology.",
            location: "India",
            email: ADMIN_EMAIL,
            availability: "Open to internships & collaborations",
            photo: "",
            resume: "",
            github: "https://github.com",
            linkedin: "https://linkedin.com",
            instagram: "https://instagram.com",
            accent: "#3157eb",
            layout: "editorial",
            skills: ["React", "JavaScript", "TypeScript", "Next.js", "UI/UX Design"],
            projects: [],
            education: [],
            experiences: [],
            achievements: [],
            showEducation: true,
            showExperience: true,
            showAchievements: true,
          };
          fs.writeFileSync(jsonFilePath, JSON.stringify(initialData, null, 2), "utf-8");
          syncToSqlite(rootDir, initialData);
        } catch (e) {
          console.error("Error creating initial portfolio-data.json:", e);
        }
      } else {
        try {
          const existing = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));
          syncToSqlite(rootDir, existing);
        } catch (e) {
          console.error("Error syncing existing json to SQLite:", e);
        }
      }

      // Watch for external / manual changes to portfolio-data.json
      server.watcher.on("change", (changedPath) => {
        if (path.resolve(changedPath) === jsonFilePath) {
          try {
            const updated = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));
            syncToSqlite(rootDir, updated);
            const mod = server.moduleGraph.getModuleById(jsonFilePath);
            if (mod) server.moduleGraph.invalidateModule(mod);
          } catch (e) {
            console.error("Error syncing manual edit of portfolio-data.json:", e);
          }
        }
      });

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
        const pathname = url.pathname;

        // Helper to extract JWT token from Cookie or Authorization header
        function getJwtToken(): string | null {
          const authHeader = req.headers.authorization;
          if (authHeader && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
          }
          const cookieHeader = req.headers.cookie;
          if (cookieHeader) {
            const cookies = cookieHeader.split(";").map((c) => c.trim());
            for (const c of cookies) {
              if (c.startsWith("admin_jwt=")) {
                return decodeURIComponent(c.substring("admin_jwt=".length));
              }
            }
          }
          return null;
        }

        // 1. POST /api/admin/login
        if (pathname === "/api/admin/login" && req.method === "POST") {
          try {
            const raw = await getRawBody(req, { limit: 65536 });
            const body = JSON.parse(new TextDecoder("utf-8").decode(raw));
            const { email, password } = body;

            if (
              email &&
              password &&
              email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
              password.trim() === ADMIN_PASSWORD
            ) {
              const token = await signJWT({
                email: ADMIN_EMAIL,
                role: "admin",
              });

              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.setHeader(
                "Set-Cookie",
                `admin_jwt=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
              );
              res.end(
                JSON.stringify({
                  success: true,
                  token,
                  user: { email: ADMIN_EMAIL, role: "admin" },
                })
              );
              return;
            } else {
              res.statusCode = 401;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  success: false,
                  error: "Invalid admin email or password.",
                })
              );
              return;
            }
          } catch (err) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: false, error: "Malformed request" }));
            return;
          }
        }

        // 2. POST /api/admin/logout
        if (pathname === "/api/admin/logout" && req.method === "POST") {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.setHeader(
            "Set-Cookie",
            `admin_jwt=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
          );
          res.end(JSON.stringify({ success: true, message: "Logged out" }));
          return;
        }

        // 3. GET /api/admin/verify
        if (pathname === "/api/admin/verify" && req.method === "GET") {
          const token = getJwtToken();
          const verified = token ? await verifyJWT(token) : null;
          res.setHeader("Content-Type", "application/json");
          if (verified) {
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                authenticated: true,
                user: { email: verified.email, role: verified.role },
              })
            );
          } else {
            res.statusCode = 401;
            res.end(JSON.stringify({ authenticated: false }));
          }
          return;
        }

        // 4. GET /api/admin/data
        if (pathname === "/api/admin/data" && req.method === "GET") {
          try {
            if (fs.existsSync(jsonFilePath)) {
              const fileContent = fs.readFileSync(jsonFilePath, "utf-8");
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.setHeader("Cache-Control", "no-store");
              res.end(fileContent);
            } else {
              res.statusCode = 404;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "portfolio-data.json not found" }));
            }
          } catch (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Failed to read portfolio-data.json" }));
          }
          return;
        }

        // 5. POST /api/admin/save
        if (pathname === "/api/admin/save" && (req.method === "POST" || req.method === "PUT")) {
          const token = getJwtToken();
          const verified = token ? await verifyJWT(token) : null;
          if (!verified) {
            res.statusCode = 401;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: false, error: "Unauthorized. Valid JWT token required." }));
            return;
          }

          try {
            const raw = await getRawBody(req, { limit: 1048576 }); // 1MB limit
            const body = JSON.parse(new TextDecoder("utf-8").decode(raw));

            // Support either { profile: ... } or direct profile object
            const profileToSave = body.profile || body;

            // Ensure basic fields exist
            if (!profileToSave.name) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ success: false, error: "Name is required." }));
              return;
            }

            // 1. Write to portfolio-data.json on disk
            const tempFilePath = `${jsonFilePath}.tmp`;
            fs.writeFileSync(tempFilePath, JSON.stringify(profileToSave, null, 2), "utf-8");
            fs.renameSync(tempFilePath, jsonFilePath);

            // 2. Sync to D1 SQLite database immediately!
            const now = new Date().toISOString();
            syncToSqlite(rootDir, profileToSave, 1, now);

            // 3. Invalidate in Vite module graph so HMR/SSR picks up the updated JSON
            const mod = server.moduleGraph.getModuleById(jsonFilePath);
            if (mod) {
              server.moduleGraph.invalidateModule(mod);
            }

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: true,
                message: "All changes successfully saved to portfolio-data.json and synced live!",
                savedAt: now,
              })
            );
            return;
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: false, error: "Failed to save: " + msg }));
            return;
          }
        }

        next();
      });
    },
  };
}

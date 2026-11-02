import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { jwtVerify } from 'jose';
import type { Plugin } from 'vite';

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'student2techxera-jwt-secure-signing-key-2026-portfolio-bento'
);

function getJsonPaths(root: string) {
  const dataDir = path.resolve(root, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return {
    dataJson: path.join(dataDir, 'portfolio-data.json'),
    rootJson: path.resolve(root, 'portfolio-data.json'),
  };
}

function readJsonFile(root: string) {
  const { dataJson, rootJson } = getJsonPaths(root);
  const targetPath = fs.existsSync(dataJson) ? dataJson : rootJson;
  if (fs.existsSync(targetPath)) {
    try {
      return JSON.parse(fs.readFileSync(targetPath, 'utf8'));
    } catch (e) {
      console.error('Failed to parse json:', e);
    }
  }
  return null;
}

function writeJsonFile(root: string, content: any) {
  const { dataJson, rootJson } = getJsonPaths(root);
  const formatted = JSON.stringify(content, null, 2);
  fs.writeFileSync(dataJson, formatted, 'utf8');
  fs.writeFileSync(rootJson, formatted, 'utf8');
}

function syncToSqlite(root: string, profile: any, revision: number, updatedAt: string) {
  try {
    const dir = path.resolve(root, '.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');
    if (!fs.existsSync(dir)) return;
    const sqliteFile = fs.readdirSync(dir).find(f => f.endsWith('.sqlite') && f !== 'metadata.sqlite');
    if (!sqliteFile) return;

    const dbPath = path.join(dir, sqliteFile);
    const db = new DatabaseSync(dbPath);
    const stmt = db.prepare('INSERT OR REPLACE INTO portfolios (id, data, revision, updated_at) VALUES (?, ?, ?, ?)');
    stmt.run(1, JSON.stringify(profile), revision, updatedAt);
  } catch (err) {
    console.warn('SQLite sync warning (JSON write succeeded):', err);
  }
}

async function verifyToken(req: any) {
  let token = '';
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else {
    const cookieHeader = req.headers['cookie'] || '';
    const match = cookieHeader.match(/admin_jwt=([^;]+)/);
    if (match) token = decodeURIComponent(match[1]);
  }

  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload && payload.role === 'admin') return payload;
    return null;
  } catch {
    return null;
  }
}

export function adminJsonSyncPlugin(): Plugin {
  let projectRoot = process.cwd();

  return {
    name: 'admin-json-sync-plugin',
    configResolved(config) {
      projectRoot = config.root;
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';

        // 1. GET /api/admin/data
        if (url === '/api/admin/data' && req.method === 'GET') {
          const admin = await verifyToken(req);
          if (!admin) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Unauthorized. Admin JWT token required.' }));
            return;
          }

          const data = readJsonFile(projectRoot);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, data, admin: { email: admin.email, role: admin.role } }));
          return;
        }

        // 2. PUT /api/admin/data (SAVE TO JSON FILE)
        if (url === '/api/admin/data' && req.method === 'PUT') {
          const admin = await verifyToken(req);
          if (!admin) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Unauthorized. Admin JWT token required.' }));
            return;
          }

          let bodyStr = '';
          req.on('data', chunk => { bodyStr += chunk; });
          req.on('end', () => {
            try {
              const body = JSON.parse(bodyStr);
              const currentData = readJsonFile(projectRoot) || {};
              const profile = body.profile || body;
              const revision = (currentData.revision || 0) + 1;
              const updatedAt = new Date().toISOString();
              const messages = Array.isArray(body.messages) ? body.messages : (currentData.messages || []);

              const finalData = {
                profile,
                revision,
                updatedAt,
                messages
              };

              // Write directly to both JSON locations
              writeJsonFile(projectRoot, finalData);

              // Sync to SQLite so public UI refreshes immediately
              syncToSqlite(projectRoot, profile, revision, updatedAt);

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                message: 'All changes saved to portfolio-data.json successfully!',
                revision,
                updatedAt,
                data: finalData
              }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Failed to write JSON file: ' + err.message }));
            }
          });
          return;
        }

        // 3. POST /api/contact (CONTACT FORM SUBMISSION TO JSON)
        if (url === '/api/contact' && req.method === 'POST') {
          let bodyStr = '';
          req.on('data', chunk => { bodyStr += chunk; });
          req.on('end', () => {
            try {
              const body = JSON.parse(bodyStr);
              const name = (body.name || '').trim();
              const email = (body.email || '').trim();
              const subject = (body.subject || '').trim() || 'General Inquiry';
              const message = (body.message || '').trim();

              if (!name || name.length < 2) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Please provide your name.' }));
                return;
              }

              if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Please provide a valid email address.' }));
                return;
              }

              if (!message || message.length < 5) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Please enter a message (at least 5 characters).' }));
                return;
              }

              const currentData = readJsonFile(projectRoot) || {};
              const id = 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
              const newMsg = {
                id,
                name,
                email,
                subject,
                message,
                date: new Date().toISOString(),
                read: false
              };

              currentData.messages = [newMsg, ...(currentData.messages || [])];
              writeJsonFile(projectRoot, currentData);

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                message: 'Thank you! Your message has been sent to the student and saved in the inbox.',
                messageId: id
              }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Failed to record message: ' + err.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}


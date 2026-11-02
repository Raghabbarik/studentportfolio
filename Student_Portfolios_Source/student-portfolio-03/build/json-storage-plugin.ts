import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';

export function jsonStoragePlugin(): Plugin {
  const jsonPath = resolve(process.cwd(), 'data', 'portfolio-data.json');

  return {
    name: 'json-storage-plugin',
    configureServer(server) {
      // Ensure data directory and file exist
      try {
        const dir = resolve(process.cwd(), 'data');
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }
      } catch (err) {
        console.error('Error ensuring data directory:', err);
      }

      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];

        if (url === '/__api/json-store') {
          if (req.method === 'GET') {
            try {
              if (existsSync(jsonPath)) {
                const data = readFileSync(jsonPath, 'utf8');
                res.writeHead(200, {
                  'Content-Type': 'application/json',
                  'Cache-Control': 'no-store'
                });
                res.end(data);
              } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'File not found' }));
              }
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: String(err) }));
            }
            return;
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body);
                const dataToSave = parsed.profile || parsed;
                const formatted = JSON.stringify(dataToSave, null, 2);
                writeFileSync(jsonPath, formatted, 'utf8');

                res.writeHead(200, {
                  'Content-Type': 'application/json'
                });
                res.end(
                  JSON.stringify({
                    success: true,
                    path: 'data/portfolio-data.json',
                    savedAt: new Date().toISOString()
                  })
                );
              } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(
                  JSON.stringify({
                    success: false,
                    error: 'Failed to write JSON: ' + String(err)
                  })
                );
              }
            });
            return;
          }
        }

        next();
      });
    }
  };
}


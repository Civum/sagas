import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import * as path from 'node:path';

import { buildSite } from '../src/build';

// Builds, then serves dist/ on http://localhost:4321 for a local look.
// Local only: nothing here is published.
const dist = path.join(import.meta.dirname, '..', 'dist');
await buildSite(dist);

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

createServer((req, res) => {
  const name = req.url === '/' || !req.url ? 'index.html' : path.basename(req.url);
  readFile(path.join(dist, name))
    .then((body) => {
      res.writeHead(200, {
        'content-type': TYPES[path.extname(name)] ?? 'application/octet-stream',
      });
      res.end(body);
    })
    .catch(() => {
      res.writeHead(404);
      res.end('Not found');
    });
}).listen(4321, '127.0.0.1', () => {
  console.log('Landing page preview: http://localhost:4321');
});

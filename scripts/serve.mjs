import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const dev = process.argv.includes('--dev');
const root = path.resolve(import.meta.dirname, dev ? '..' : '../dist');
const port = Number(process.env.PORT || (dev ? 5173 : 4173));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ttf': 'font/ttf', '.txt': 'text/plain' };
createServer(async (req, res) => {
  try {
    let route = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (route.endsWith('/')) route += 'index.html';
    let filename = path.resolve(root, '.' + route);
    if (!filename.startsWith(root + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
    if (dev && !route.startsWith('/src/') && route !== '/index.html') filename = path.join(root, 'public', route);
    if (!(await stat(filename)).isFile()) throw new Error('Not found');
    const data = await readFile(filename); res.writeHead(200, { 'Content-Type': mime[path.extname(filename)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, '0.0.0.0', () => console.log(`CW 小站: http://localhost:${port}`));

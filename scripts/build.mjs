import { cp, mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
await rm(dist, { recursive: true, force: true }); await mkdir(dist, { recursive: true });
await cp(path.join(root, 'index.html'), path.join(dist, 'index.html'));
await cp(path.join(root, 'src'), path.join(dist, 'src'), { recursive: true });
await cp(path.join(root, 'public'), dist, { recursive: true });
async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const name = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(name)); else files.push(name);
  }
  return files.sort();
}
const files = await walk(dist); const hash = createHash('sha256');
for (const file of files) hash.update(await readFile(file));
const assets = ['./', ...files.map(file => './' + path.relative(dist, file))];
await writeFile(path.join(dist, 'sw.js'), `const PREFIX = 'cw-station-';\nconst CACHE = PREFIX + '${hash.digest('hex').slice(0, 12)}';\nconst ASSETS = ${JSON.stringify(assets)};\nself.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))));\nself.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));\nself.addEventListener('fetch', event => {\n  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;\n  event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(event.request)) || (event.request.mode === 'navigate' ? await cache.match('./index.html') : null) || fetch(event.request)));\n});\n`);
console.log(`Built ${files.length} assets with versioned offline cache → dist/`);

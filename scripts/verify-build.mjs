import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { posts } from '../src/lib/posts.mjs';
const files = readdirSync('_posts').filter((file) => file.endsWith('.md'));
assert.equal(posts.length, files.length);
assert.equal(new Set(posts.map((post) => post.url)).size, posts.length, 'Every dated URL must be unique');
for (const post of posts) {
  const file = `dist/${post.path}/index.html`;
  assert(existsSync(file), `Missing original URL: ${post.url}`);
  const html = readFileSync(file, 'utf8');
  assert(!/{%\s*(?:end)?highlight/.test(html), `Unconverted Liquid block: ${post.file}`);
}
for (const path of ['index.html', 'archive/index.html', 'about/index.html', '404.html', 'atom.xml', 'sitemap.xml', 'robots.txt']) assert(existsSync(`dist/${path}`), `Missing output: ${path}`);
const assets = JSON.parse(readFileSync('scripts/assets.json', 'utf8'));
for (const asset of assets) assert.deepEqual(readFileSync(`dist/${asset}`), readFileSync(asset), `Asset bytes changed: ${asset}`);
console.log(`Verified ${posts.length} preserved article routes, ${assets.length} byte-identical assets, feed and error page.`);

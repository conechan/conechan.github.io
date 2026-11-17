import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { posts } from '../src/lib/posts.mjs';
import { codeLanguage } from '../src/lib/code-languages.mjs';
const decodeCode = (html) => html.replace(/<[^>]*>/g, '').replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, entity) => {
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
  return entity.startsWith('#') ? String.fromCodePoint(entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10)) : named[entity];
});
const files = readdirSync('_posts').filter((file) => file.endsWith('.md'));
assert.equal(posts.length, files.length);
assert.equal(new Set(posts.map((post) => post.url)).size, posts.length, 'Every dated URL must be unique');
for (const post of posts) {
  const file = `dist/${post.path}/index.html`;
  assert(existsSync(file), `Missing original URL: ${post.url}`);
  const html = readFileSync(file, 'utf8');
  assert(!/{%\s*(?:end)?highlight/.test(html), `Unconverted Liquid block: ${post.file}`);
  const expectedCode = post.parts.filter((part) => part.type === 'code');
  const renderedCode = [...html.matchAll(/<pre\b[^>]*>\s*<code\b[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/g)];
  assert.equal(renderedCode.length, expectedCode.length, `Missing server-rendered code: ${post.file}`);
  assert.equal((html.match(/aria-label="复制代码"/g) || []).length, expectedCode.length, `Missing copy control: ${post.file}`);
  expectedCode.forEach((part, index) => {
    assert.equal(decodeCode(renderedCode[index][1]), part.code, `Code content changed: ${post.file} #${index + 1}`);
    if (codeLanguage(part.language, part.code) !== 'text') assert(/class="token\b/.test(renderedCode[index][1]), `Code highlighting missing: ${post.file} #${index + 1}`);
  });
  for (const [, , value] of post.html.matchAll(/\b(href|src)="([^"]+)"/g)) {
    assert(!value.startsWith('file:'), `Local computer reference in ${post.file}: ${value}`);
    const url = new URL(value, `https://cone.cc${post.url}/`);
    if (url.origin !== 'https://cone.cc') continue;
    const output = `dist${decodeURIComponent(url.pathname)}`;
    assert((existsSync(output) && statSync(output).isFile()) || existsSync(`${output}/index.html`), `Broken internal resource in ${post.file}: ${value}`);
  }
}
for (const path of ['index.html', 'archive/index.html', 'about/index.html', '404.html', 'atom.xml', 'sitemap.xml', 'robots.txt']) assert(existsSync(`dist/${path}`), `Missing output: ${path}`);
const assets = JSON.parse(readFileSync('scripts/assets.json', 'utf8'));
for (const asset of assets) assert.deepEqual(readFileSync(`dist/${asset}`), readFileSync(asset), `Asset bytes changed: ${asset}`);
assert.deepEqual(readFileSync('dist/_redirects'), readFileSync('public/_redirects'), 'Legacy redirects must be published');
console.log(`Verified ${posts.length} preserved article routes, ${assets.length} byte-identical assets, feed and error page.`);

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PrismLight } from 'react-syntax-highlighter';
import { codeLanguage } from '../src/lib/code-languages.mjs';
import { postIdentity, normalizeLegacyMarkdown, renderMarkdown, posts } from '../src/lib/posts.mjs';
test('original dated URLs preserve spelling, including historical typos', () => {
  assert.equal(postIdentity('2015-10-20-charest-trivial.md').url, '/2015/10/20/charest-trivial');
  assert.throws(() => postIdentity('undated.md'));
});
test('Liquid highlighting becomes fenced code without interpreting source HTML', () => {
  const source = '{% highlight php %}\n<?php echo "<hello>"; ?>\n{% endhighlight %}';
  assert(normalizeLegacyMarkdown(source).includes('```php'));
  const { html } = renderMarkdown(source);
  assert(!html.includes('{%'));
  assert(/&lt;|&#x3C;/i.test(html));
});
test('legacy images, links and named heading anchors survive rendering', () => {
  const { html, headings } = renderMarkdown('## 编码的故事\n\n[照片](/img/site_avatar.jpg)\n\n<img src="/img/site_avatar.jpg" alt="avatar">');
  assert(html.includes('href="/img/site_avatar.jpg"'));
  assert(html.includes('src="/img/site_avatar.jpg"'));
  assert.equal(headings[0].slug, '编码的故事');
});
test('every original article has renderable content and a unique permalink', () => {
  assert.equal(posts.length, 213);
  assert.equal(new Set(posts.map((p) => p.url)).size, 213);
  for (const post of posts) { assert(post.title); assert(post.html.length > 0); }
});
test('legacy headings without spaces render with heading anchors', () => {
  const post = posts.find((post) => post.path === '2014/01/01/my-2013');
  assert.match(post.html, /<h2\b[^>]*id="吐"[^>]*>吐<\/h2>/);
  assert.match(post.html, /<h2\b[^>]*id="lte"[^>]*>LTE<\/h2>/);
  assert(post.headings.some((heading) => heading.text === '2014展望'));
});
test('legacy heading compatibility preserves code blocks and modern heading markup', () => {
  const { html, headings } = renderMarkdown('##旧标题\n\n## 现代 **标题**\n\n```c\n#include <stdio.h>\n##not-a-heading\n```\n\n    ##indented-code\n\n#######not-a-heading');
  assert.equal(headings.length, 2);
  assert(html.includes('<strong>标题</strong>'));
  assert(!html.includes('id="not-a-heading"'));
  assert(!html.includes('id="indented-code"'));
  assert(html.includes('#######not-a-heading'));
});
test('legacy Chinese bold labels survive punctuation and closing whitespace', () => {
  const speed = posts.find((post) => post.file === '2009-05-18-zz-speed.md');
  assert(speed.html.includes('<strong>概念：</strong>在此之前'));
  assert(speed.html.includes('<strong>速度瓶頸：</strong>這種速度'));
  const singles = posts.find((post) => post.file === '2006-11-14-11-11.md');
  assert.match(singles.html, /<strong>在当今中国青年中[^<]+<\/strong>/);
});
test('legacy bold compatibility leaves code and modern nested emphasis intact', () => {
  const { html } = renderMarkdown('**中文：**紧接正文\n\n**中文。 **\n\n**modern _nested_ text**\n\n`**代码：**保持原样`\n\n```text\n**代码：**保持原样\n```');
  assert(html.includes('<strong>中文：</strong>紧接正文'));
  assert(html.includes('<strong>modern <em>nested</em> text</strong>'));
  assert(html.includes('<code>**代码：**保持原样</code>'));
  assert.equal((html.match(/<strong>/g) || []).length, 3);
});
test('Ruby fences are handed to the official code component without altering source', () => {
  const post = posts.find((post) => post.path === '2015/07/15/gitlab-summary');
  assert.equal(post.parts.filter((part) => part.type === 'code' && part.language === 'ruby').length, 3);
  const code = 'def greet\n  puts "hello"\nend\n';
  const { parts } = renderMarkdown(`\`\`\`ruby\n${code}\`\`\``);
  assert.deepEqual(parts, [{ type: 'code', language: 'ruby', code }]);
});
test('unknown and unlabeled fence languages still render safely as plain text', () => {
  for (const language of ['', 'unknown-language']) {
    const { html } = renderMarkdown(`\`\`\`${language}\n<hello>\n\`\`\``);
    assert(html.includes('<pre'));
    assert(/&lt;hello&gt;|&#x3C;hello>/i.test(html));
  }
});
test('photo caption dates stay plain text while real URLs remain linked', () => {
  const post = posts.find((post) => post.file === '2012-07-07-qinghai.md');
  assert.equal((post.html.match(/\/\/2012\.06\.27/g) || []).length, 3);
  assert(!post.html.includes('href="//2012.06.27"'), 'Caption dates must not become links');
  const { html } = renderMarkdown('照片 //2012.06.27\n\nhttps://example.com //example.com/photo //192.168.1.1/photo');
  assert(html.includes('照片 //2012.06.27'));
  for (const url of ['https://example.com', '//example.com/photo', '//192.168.1.1/photo']) {
    assert(html.includes(`href="${url}"`), `Real URL must remain linked: ${url}`);
  }
});
test('legacy article aliases redirect to existing article routes', () => {
  const urls = new Set(posts.map((post) => post.url));
  const redirects = readFileSync('public/_redirects', 'utf8').trim().split('\n');
  assert.equal(redirects.length, 4);
  for (const line of redirects) {
    const [source, target, status] = line.trim().split(/\s+/);
    assert.equal(status, '301');
    assert(urls.has(target), `Redirect destination must exist: ${target}`);
    for (const post of posts) assert(!post.html.includes(`href="${source}"`), `Update legacy article link in ${post.file}`);
  }
});
test('lost temporary images are explained and restored posters use local assets', () => {
  const thanksgiving = posts.find((post) => post.file === '2006-11-23-thanksgiving.md');
  assert(thanksgiving.html.includes('原始文件未能找回'));
  assert(!thanksgiving.html.includes('file:///'));
  const assets = JSON.parse(readFileSync('scripts/assets.json', 'utf8'));
  for (const slug of ['2010-08-18-kj-music-life', '2009-10-18-king', '2009-08-10-home']) {
    const asset = `img/post/${slug}/poster.jpg`;
    assert(assets.includes(asset));
    assert(posts.find((post) => post.file === `${slug}.md`).html.includes(`src="/${asset}"`));
    assert.equal(readFileSync(asset).subarray(0, 2).toString('hex'), 'ffd8');
  }
});
test('code islands preserve surrounding list/quote markup and literal marker comments', () => {
  const source = '<!--cone-code-block:0-->\n\n> 引用\n>\n> ```js\n> const text = "</script>";\n> ```\n\n- 列表\n\n    ```shell\n    echo "hello"\n    ```';
  const { html, parts } = renderMarkdown(source);
  assert(html.includes('<!--cone-code-block:0-->'));
  assert(html.includes('<blockquote>'));
  assert(html.includes('<ul>'));
  assert(!html.includes('<script>'));
  assert.equal((html.match(/<pre\b/g) || []).length, 2);
  assert.deepEqual(parts.filter((part) => part.type === 'code'), [
    { type: 'code', language: 'js', code: 'const text = "</script>";\n' },
    { type: 'code', language: 'shell', code: 'echo "hello"\n' },
  ]);
  assert(parts[0].type === 'html' && parts[0].html.includes('<blockquote>'));
  assert(parts.at(-1).type === 'html' && parts.at(-1).html.includes('</ul>'));
});
test('language aliases and prompt detection use supported SDK/Prism grammars', () => {
  for (const [input, expected] of Object.entries({ shell: 'bash', console: 'bash', html: 'markup', asm: 'nasm', nasm: 'nasm', apache: 'apacheconf', shellsession: 'shell-session', js: 'javascript', ruby: 'ruby' })) {
    assert.equal(codeLanguage(input), expected);
  }
  assert.equal(codeLanguage('shell', 'root@mkt-git-01:~# service gitlab\n'), 'shell-session');
  assert.equal(codeLanguage('shell', '# comment\necho hi\n'), 'bash');
  assert.equal(codeLanguage('unknown-language'), 'text');
  assert.equal(codeLanguage(), 'text');
});
test('legacy assembly, Apache and terminal sessions produce syntax tokens', () => {
  for (const [language, code] of [['nasm', 'MOV AX, 10H\n'], ['apache', 'AddType application/x-httpd-php .php\n'], ['shellsession', '# ./configure --prefix=/usr/local/mysql\n']]) {
    const html = renderToStaticMarkup(createElement(PrismLight, { language: codeLanguage(language), useInlineStyles: false }, code));
    assert(/class="token\b/.test(html), `${language} must retain syntax tokens`);
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
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

import { readdirSync, readFileSync } from 'node:fs';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';

// Astro bundles this module into dist/.prerender; source paths stay project-relative.
const root = process.cwd();
const postSources = readdirSync(`${root}/_posts`).filter((file) => file.endsWith('.md')).map((file) => {
  const { data, content } = matter(readFileSync(`${root}/_posts/${file}`, 'utf8'));
  return { file, data, content };
});
const categoryNames = { Tech: '技术', Travel: '旅行', Music: '音乐', Life: '生活', Old: '旧时光' };
export const categoryLabel = (name) => categoryNames[name] || name;
const list = (value) => Array.isArray(value) ? value.map(String) : String(value || '').split(/\s+/).filter(Boolean);

/** Jekyll's filename is the permalink authority, including original spelling. */
export function postIdentity(filename) {
  const match = /^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/.exec(filename);
  if (!match) throw new Error(`Invalid post filename: ${filename}`);
  const [, year, month, day, slug] = match;
  return { year, date: `${year}-${month}-${day}`, path: `${year}/${month}/${day}/${slug}`, url: `/${year}/${month}/${day}/${slug}` };
}

export function normalizeLegacyMarkdown(content) {
  return content.replace(/{%\s*highlight\s+([^\s%]+)(?:\s+[^%]*)?\s*%}\s*\r?\n/g, (_, lang) => `\n\n\`\`\`${lang === 'console' ? 'shell' : lang}\n`)
    .replace(/{%\s*endhighlight\s*%}/g, '\n```\n');
}

const md = new MarkdownIt({ html: true, linkify: true, typographer: false })
  .use(anchor, { slugify: (s) => s.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\p{L}\p{N}_-]/gu, '') });

// Keep Markdown's surrounding HTML intact, including nested lists/quotes, while
// handing code blocks to Astro's server-rendered, independently hydrated islands.
for (const type of ['fence', 'code_block']) {
  const renderCode = md.renderer.rules[type];
  md.renderer.rules[type] = (tokens, index, options, env, renderer) => {
    const token = tokens[index];
    const marker = `${env.codeMarker}${env.codeBlocks.length}-->`;
    env.codeBlocks.push({
      marker,
      html: renderCode(tokens, index, options, env, renderer),
      part: { type: 'code', code: token.content, language: type === 'fence' ? token.info.trim().split(/\s+/)[0] : '' },
    });
    return marker;
  };
}

// Photo captions use //YYYY.MM.DD as a separator, not a protocol-relative URL.
const validateLink = md.validateLink;
md.validateLink = (url) => !/^\/\/\d{4}\.\d{1,2}\.\d{1,2}$/.test(url) && validateLink(url);

// Redcarpet accepted ATX headings without a space after '#'. Keep that
// historical syntax in the block parser so fenced/indented code stays intact.
md.block.ruler.before('heading', 'legacy_heading', (state, startLine, _endLine, silent) => {
  if (state.sCount[startLine] - state.blkIndent >= 4) return false;
  const start = state.bMarks[startLine] + state.tShift[startLine];
  const match = /^(#{1,6})(?!#)(\S.*)$/.exec(state.src.slice(start, state.eMarks[startLine]));
  if (!match) return false;
  if (silent) return true;
  const markup = match[1];
  state.line = startLine + 1;
  const opening = state.push('heading_open', `h${markup.length}`, 1);
  opening.markup = markup;
  opening.map = [startLine, state.line];
  const inline = state.push('inline', '', 0);
  inline.content = match[2].replace(/[\t ]+#+[\t ]*$/, '').trim();
  inline.map = [startLine, state.line];
  inline.children = [];
  const closing = state.push('heading_close', `h${markup.length}`, -1);
  closing.markup = markup;
  return true;
}, { alt: ['paragraph', 'reference', 'blockquote'] });

// Older Chinese posts use **标点：**正文 and a space before the closing **.
// Relax only those plain-text cases; leave nested markup to the standard rule.
md.inline.ruler.before('emphasis', 'legacy_chinese_strong', (state, silent) => {
  const match = /^\*\*([^\s*][^*\n]*?)\*\*/.exec(state.src.slice(state.pos));
  if (!match) return false;
  const content = match[1];
  const following = state.src[state.pos + match[0].length] || '';
  if (!/\p{Script=Han}/u.test(content) || /[\\`_<>\[\]]/.test(content)) return false;
  const legacyClosingSpace = /[\t ]+$/.test(content);
  const legacyPunctuation = /\p{P}$/u.test(content) && /[\p{L}\p{N}]/u.test(following);
  if (!legacyClosingSpace && !legacyPunctuation) return false;
  if (!silent) {
    const opening = state.push('strong_open', 'strong', 1);
    opening.markup = '**';
    const text = state.push('text', '', 0);
    text.content = content;
    const closing = state.push('strong_close', 'strong', -1);
    closing.markup = '**';
  }
  state.pos += match[0].length;
  return true;
});

export function renderMarkdown(content) {
  const normalized = normalizeLegacyMarkdown(content);
  let codeMarker = '<!--cone-code-block:';
  while (normalized.includes(codeMarker)) codeMarker += ':';
  const env = { codeMarker, codeBlocks: [] };
  const tokens = md.parse(normalized, env);
  const headings = [];
  tokens.forEach((token, index) => {
    if (token.type === 'heading_open' && ['h2', 'h3'].includes(token.tag)) {
      headings.push({ depth: Number(token.tag[1]), slug: token.attrGet('id'), text: tokens[index + 1].content });
    }
  });
  const rendered = md.renderer.render(tokens, md.options, env);
  const parts = [];
  let html = '';
  let cursor = 0;
  for (const block of env.codeBlocks) {
    const index = rendered.indexOf(block.marker, cursor);
    if (index < 0) throw new Error('Missing rendered code block');
    const before = rendered.slice(cursor, index);
    if (before) parts.push({ type: 'html', html: before });
    parts.push(block.part);
    html += before + block.html;
    cursor = index + block.marker.length;
  }
  const after = rendered.slice(cursor);
  if (after) parts.push({ type: 'html', html: after });
  html += after;
  return { html, headings, parts };
}

const strip = (s) => s.replace(/<[^>]*>/g, ' ').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[`#*_>{}]/g, '').replace(/\s+/g, ' ').trim();

export const posts = postSources.map(({ file, data, content }) => {
  const identity = postIdentity(file);
  const text = strip(normalizeLegacyMarkdown(content));
  const { html, headings, parts } = renderMarkdown(content);
  return { ...identity, file, title: md.utils.unescapeAll(String(data.title)), description: strip(String(data.description || text)).slice(0, 126), categories: list(data.categories), html, headings, parts };
}).sort((a, b) => b.date.localeCompare(a.date) || a.file.localeCompare(b.file));

export const categories = [...new Set(posts.flatMap((post) => post.categories))].sort((a, b) => {
  const order = ['Tech', 'Travel', 'Music', 'Life', 'Old'];
  return order.indexOf(a) - order.indexOf(b);
});
export const formatDate = (date) => date.replaceAll('-', '.');
const aboutContent = renderMarkdown(matter(readFileSync(`${root}/about.md`, 'utf8')).content);
export const about = aboutContent.html;
export const aboutParts = aboutContent.parts;

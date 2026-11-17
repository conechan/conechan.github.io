import { readdirSync, readFileSync } from 'node:fs';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import { bundledLanguages, bundledLanguagesAlias, createHighlighter } from 'shiki';

// Astro bundles this module into dist/.prerender; source paths stay project-relative.
const root = process.cwd();
const postFiles = readdirSync(`${root}/_posts`).filter((file) => file.endsWith('.md'));
export const categoryNames = { Tech: '技术', Travel: '旅行', Music: '音乐', Life: '生活', Old: '旧时光' };
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

const languageAliases = { nasm: 'asm', console: 'shell' };
const resolveLanguage = (language) => languageAliases[language] || language;
const languageScanner = new MarkdownIt({ html: true });
const languages = new Set(['text']);
for (const file of postFiles) {
  const { content } = matter(readFileSync(`${root}/_posts/${file}`, 'utf8'));
  for (const token of languageScanner.parse(normalizeLegacyMarkdown(content), {})) {
    if (token.type !== 'fence') continue;
    const language = resolveLanguage(token.info.trim().split(/\s+/)[0]);
    if (Object.hasOwn(bundledLanguages, language) || Object.hasOwn(bundledLanguagesAlias, language)) languages.add(language);
  }
}
const highlighter = await createHighlighter({ themes: ['github-light', 'github-dark'], langs: [...languages] });
const md = new MarkdownIt({ html: true, linkify: true, typographer: false, highlight(code, language) {
  const lang = resolveLanguage(language);
  return highlighter.codeToHtml(code, { lang: highlighter.getLoadedLanguages().includes(lang) ? lang : 'text', themes: { light: 'github-light', dark: 'github-dark' } });
} }).use(anchor, { slugify: (s) => s.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\p{L}\p{N}_-]/gu, '') });

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
  const tokens = md.parse(normalizeLegacyMarkdown(content), {});
  const headings = [];
  tokens.forEach((token, index) => {
    if (token.type === 'heading_open' && ['h2', 'h3'].includes(token.tag)) {
      headings.push({ depth: Number(token.tag[1]), slug: token.attrGet('id'), text: tokens[index + 1].content });
    }
  });
  return { html: md.renderer.render(tokens, md.options, {}), headings };
}

const strip = (s) => s.replace(/<[^>]*>/g, ' ').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[`#*_>{}]/g, '').replace(/\s+/g, ' ').trim();

export const posts = postFiles.map((file) => {
  const raw = readFileSync(`${root}/_posts/${file}`, 'utf8');
  const { data, content } = matter(raw);
  const identity = postIdentity(file);
  const text = strip(normalizeLegacyMarkdown(content));
  const { html, headings } = renderMarkdown(content);
  return { ...identity, file, title: md.utils.unescapeAll(String(data.title)), description: strip(String(data.description || text)).slice(0, 126), categories: list(data.categories), tags: list(data.tags), minutes: Math.max(1, Math.ceil(text.length / 450)), html, headings };
}).sort((a, b) => b.date.localeCompare(a.date) || a.file.localeCompare(b.file));

export const categories = [...new Set(posts.flatMap((post) => post.categories))].sort((a, b) => {
  const order = ['Tech', 'Travel', 'Music', 'Life', 'Old'];
  return order.indexOf(a) - order.indexOf(b);
});
export const formatDate = (date) => date.replaceAll('-', '.');
export const about = renderMarkdown(matter(readFileSync(`${root}/about.md`, 'utf8')).content).html;

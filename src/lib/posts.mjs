import { readdirSync, readFileSync } from 'node:fs';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import { createHighlighter } from 'shiki';

// Astro bundles this module into dist/.prerender; source paths stay project-relative.
const root = process.cwd();
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

const highlighter = await createHighlighter({ themes: ['github-light', 'github-dark'], langs: ['javascript', 'typescript', 'html', 'css', 'json', 'shell', 'php', 'c', 'asm', 'yaml', 'text'] });
const md = new MarkdownIt({ html: true, linkify: true, typographer: false, highlight(code, language) {
  const lang = language === 'nasm' ? 'asm' : language;
  return highlighter.codeToHtml(code, { lang: highlighter.getLoadedLanguages().includes(lang) ? lang : 'text', themes: { light: 'github-light', dark: 'github-dark' } });
} }).use(anchor, { slugify: (s) => s.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\p{L}\p{N}_-]/gu, '') });

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

export const posts = readdirSync(`${root}/_posts`).filter((f) => f.endsWith('.md')).map((file) => {
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

export interface Heading { depth: number; slug: string; text: string }
export interface Post {
  year: string; date: string; path: string; url: string; file: string;
  title: string; description: string; categories: string[];
  html: string; headings: Heading[];
}
export const posts: Post[];
export const categories: string[];
export const about: string;
export function categoryLabel(name: string): string;
export function formatDate(date: string): string;
export function normalizeLegacyMarkdown(content: string): string;
export function renderMarkdown(content: string): { html: string; headings: Heading[] };
export function postIdentity(filename: string): Pick<Post, 'year' | 'date' | 'path' | 'url'>;

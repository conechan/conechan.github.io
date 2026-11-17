export interface Heading { depth: number; slug: string; text: string }
export type MarkdownPart = { type: 'html'; html: string } | { type: 'code'; code: string; language: string };
export interface Post {
  year: string; date: string; path: string; url: string; file: string;
  title: string; description: string; categories: string[];
  html: string; headings: Heading[]; parts: MarkdownPart[];
}
export const posts: Post[];
export const categories: string[];
export const about: string;
export const aboutParts: MarkdownPart[];
export function categoryLabel(name: string): string;
export function formatDate(date: string): string;
export function normalizeLegacyMarkdown(content: string): string;
export function renderMarkdown(content: string): { html: string; headings: Heading[]; parts: MarkdownPart[] };
export function postIdentity(filename: string): Pick<Post, 'year' | 'date' | 'path' | 'url'>;

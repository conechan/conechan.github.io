import { posts } from '../lib/posts.mjs';
import type { APIRoute } from 'astro';
const escape = (value: string) => value.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]!));
export const GET: APIRoute = ({ site }) => {
  const base = site || new URL('https://cone.cc');
  // Keep historical Atom IDs stable so existing readers do not duplicate entries.
  return new Response(`<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>cone.cc</title><id>http://cone.cc/</id><link href="${base}"/><link href="${new URL('/atom.xml', base)}" rel="self"/><updated>${posts[0].date}T00:00:00Z</updated><author><name>cone</name></author>${posts.map((post) => `<entry><title>${escape(post.title)}</title><id>http://cone.cc${post.url}</id><link href="${new URL(post.url, base)}"/><updated>${post.date}T00:00:00Z</updated><summary>${escape(post.description)}</summary></entry>`).join('')}</feed>`, { headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' } });
};

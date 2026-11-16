import type { APIRoute } from 'astro';
import { posts, categories } from '../lib/posts.mjs';
export const GET: APIRoute = ({ site }) => new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/', '/archive/', '/about/', ...categories.map((category) => `/category/${category.toLowerCase()}/`), ...posts.map((post) => post.url)].map((path) => `<url><loc>${new URL(path, site)}</loc></url>`).join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml' } });

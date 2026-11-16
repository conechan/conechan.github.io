import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';

function localSearchIndex() {
  return {
    name: 'local-pagefind-index',
    configureServer(server) {
      server.middlewares.use('/pagefind', async (req, res, next) => {
        const directory = resolve('dist/pagefind');
        const path = resolve(directory, `.${decodeURIComponent((req.url || '/').split('?')[0])}`);
        if (!path.startsWith(directory + sep)) return next();
        try {
          const data = await readFile(path);
          const type = path.endsWith('.js') ? 'application/javascript' : path.endsWith('.json') ? 'application/json' : 'application/octet-stream';
          res.setHeader('Content-Type', type);
          res.end(data);
        } catch { next(); }
      });
    },
  };
}

export default defineConfig({
  site: 'https://conechan.pages.dev',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss(), localSearchIndex()],
    // Apps SDK UI publishes extensionless ESM imports. Let Vite resolve them
    // while prerendering rather than asking Node's stricter ESM resolver.
    environments: {
      ssr: { resolve: { noExternal: ['@openai/apps-sdk-ui'] } },
      prerender: { resolve: { noExternal: ['@openai/apps-sdk-ui'] } },
    },
  },
  build: { format: 'directory' },
});

import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

function watchArticleSources() {
  return {
    name: 'watch-article-sources',
    configureServer(server) {
      server.watcher.add([resolve('_posts'), resolve('about.md')]);
      server.watcher.on('all', (event, file) => {
        if (!['add', 'change', 'unlink'].includes(event)) return;
        if (!file.startsWith(resolve('_posts') + '/') && file !== resolve('about.md')) return;
        // The legacy loader reads Markdown with fs, outside Vite's import graph.
        for (const environment of Object.values(server.environments)) {
          const modules = environment.moduleGraph.getModulesByFile(resolve('src/lib/posts.mjs'));
          for (const module of modules || []) environment.moduleGraph.invalidateModule(module);
        }
        server.ws.send({ type: 'full-reload' });
      });
    },
  };
}
export default defineConfig({
  site: 'https://cone.cc',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss(), watchArticleSources()],
    // Apps SDK UI publishes extensionless ESM imports. Let Vite resolve them
    // while prerendering rather than asking Node's stricter ESM resolver.
    environments: {
      ssr: { resolve: { noExternal: ['@openai/apps-sdk-ui'] } },
      prerender: { resolve: { noExternal: ['@openai/apps-sdk-ui'] } },
    },
  },
  build: { format: 'directory' },
});

import { defineConfig } from 'vite';
import { createMetaApiHandler } from './server/api.js';

export default defineConfig({
  plugins: [{
    name: 'takeapart-meta-api',
    configureServer(server) {
      server.middlewares.use(createMetaApiHandler());
    },
  }],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
  },
});

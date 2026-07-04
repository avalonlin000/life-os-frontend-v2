import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const nakedRoutes = new Set(['/know', '/act', '/reflect', '/way', '/dao']);

function jieyiNakedRouteFallback() {
  return {
    name: 'jieyi-naked-route-fallback',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url && nakedRoutes.has(req.url.split('?')[0])) {
          req.url = `/jieyi${req.url}`;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url && nakedRoutes.has(req.url.split('?')[0])) {
          req.url = `/jieyi${req.url}`;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  base: '/jieyi/',
  plugins: [react(), jieyiNakedRouteFallback()],
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('../../shared', import.meta.url)),
    },
  },
  server: {
    port: 3001,
    strictPort: true,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8881',
        changeOrigin: true,
      },
    },
  },
});

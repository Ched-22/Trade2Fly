import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import type { ProxyOptions } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const apiTarget = env.VITE_DEV_API_URL || 'http://localhost:3000';

  const apiProxy: ProxyOptions = {
    target: apiTarget,
    changeOrigin: true,
    secure: false,
  };

  const wsProxy: ProxyOptions = {
    target: apiTarget,
    changeOrigin: true,
    secure: false,
    ws: true,
    configure: (proxy) => {
      proxy.on('error', (err, _req, res) => {
        if ('writeHead' in res && typeof res.writeHead === 'function' && !res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'text/plain' });
          res.end('Backend indisponível. Inicie o servidor em backend/ (npm run start:dev).');
        }
        if (process.env.DEBUG?.includes('vite:proxy')) {
          console.warn('[vite] ws proxy:', err.message);
        }
      });
    },
  };

  return {
    base: '/',
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      strictPort: false,
      proxy: {
        '/api': apiProxy,
        '/socket.io': wsProxy,
      },
    },
  };
});

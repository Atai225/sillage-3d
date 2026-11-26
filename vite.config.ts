import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import aiHandler from './api/ai';

/**
 * В продакшене (Vercel) запрос /api/ai обрабатывает serverless-функция из папки /api.
 * Этот плагин делает то же самое при `npm run dev`, чтобы ИИ работал и локально
 * (ключ берётся из файла .env, в браузер он не попадает).
 */
function localApiPlugin(): Plugin {
  return {
    name: 'sillage-local-api',
    configureServer(server) {
      server.middlewares.use('/api/ai', async (req, res) => {
        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const body = chunks.length ? Buffer.concat(chunks).toString('utf8') : undefined;
          const request = new Request('http://localhost/api/ai', {
            method: req.method,
            headers: { 'content-type': req.headers['content-type'] ?? 'application/json' },
            body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
          });
          const response = await aiHandler(request);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(await response.text());
        } catch (e) {
          res.statusCode = 500;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ error: String(e) }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Загружаем ВСЕ переменные из .env (без префикса VITE_) только для серверной части.
  const env = loadEnv(mode, process.cwd(), '');
  for (const [k, v] of Object.entries(env)) {
    if (process.env[k] === undefined) process.env[k] = v;
  }
  return {
    plugins: [react(), tailwindcss(), localApiPlugin()],
    build: {
      chunkSizeWarningLimit: 900,
      rollupOptions: { output: { manualChunks: { three: ['three'] } } },
    },
  };
});

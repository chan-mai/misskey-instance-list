import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { loadConfig } from './config.js';
import { createTasksRouter } from './routes/tasks.js';

// 設定不備は起動時に落とす, 実行時に誤ったURLへenqueueされるより早く気付ける
const config = loadConfig();

const app = new Hono();
app.route('/', createTasksRouter(config));

const server = serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`[agent] listening on :${info.port}`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[agent] port ${config.port} is already in use. Set PORT to use another port.`);
    process.exit(1);
  }
  throw err;
});

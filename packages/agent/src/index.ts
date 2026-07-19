import { Hono } from 'hono';
import { buildTaskContext, CRON_TASKS, type Env } from './config.js';
import { createTasksRouter } from './routes/tasks.js';
import { TASKS } from './tasks/registry.js';
import type { TaskMessage } from './tasks/define.js';
import { processStatsChunk } from './tasks/sync/stats.js';

const app = new Hono<{ Bindings: Env }>();
app.route('/', createTasksRouter());

export default {
  fetch: app.fetch,

  /**
   * Cron TriggersCloud Scheduler + Cloud Tasksの置き換え
   * 実処理はconsumer側に回し, ここではキューに積むだけに留める
   */
  async scheduled(controller, env, ctx) {
    const names = CRON_TASKS[controller.cron];
    if (!names) {
      console.error(`[cron] no task mapped for: ${controller.cron}`);
      return;
    }
    console.log(`[cron] ${controller.cron} -> ${names.join(', ')}`);
    ctx.waitUntil(
      buildTaskContext(env).enqueue(names.map((name) => ({ kind: 'task', name }))),
    );
  },

  /**
   * キューconsumer
   * ack/retryはメッセージ単位なので, 1件の失敗が他を巻き込まない
   */
  async queue(batch, env) {
    const ctx = buildTaskContext(env);

    for (const message of batch.messages) {
      const body = message.body;
      const label = body.kind === 'task' ? body.name : `stats-chunk(${body.hosts.length})`;
      const startTime = Date.now();

      try {
        if (body.kind === 'task') {
          await TASKS[body.name].run(ctx);
        } else {
          const processed = await processStatsChunk(ctx, body.hosts);
          console.log(`[queue] stats-chunk processed ${processed}/${body.hosts.length}`);
        }
        console.log(`[queue] ${label} completed in ${Date.now() - startTime}ms`);
        message.ack();
      } catch (error) {
        console.error(`[queue] ${label} failed after ${Date.now() - startTime}ms:`, error);
        message.retry();
      }
    }
  },
} satisfies ExportedHandler<Env, TaskMessage>;

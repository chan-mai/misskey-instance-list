import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { sql } from 'drizzle-orm';
import { buildTaskContext, type Env } from '../config.js';
import { isValidTask } from '../tasks/registry.js';

export const createTasksRouter = () => {
  const app = new Hono<{ Bindings: Env }>();

  /**
   * タスク手動実行API
   *
   * 定期実行はCron Triggersが担うため, ここは運用時の手動キック専用
   * 同期実行せずキューに積み, タイムアウトと競合を避ける
   *
   * POST /api/tasks/:name
   * Authorization: Bearer <TASK_SECRET>
   */
  app.post('/api/tasks/:name', async(c) => {
    const authHeader = c.req.header('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }
    const secret = c.env.TASK_SECRET?.trim();
    if (!secret || authHeader.slice(7) !== secret) {
      throw new HTTPException(403, { message: 'Forbidden' });
    }

    const taskName = c.req.param('name');
    if (!isValidTask(taskName)) {
      throw new HTTPException(404, { message: `Task not found: ${taskName}` });
    }

    try {
      console.log(`[TaskAPI] Enqueuing task: ${taskName}`);
      await buildTaskContext(c.env).enqueue([{ kind: 'task', name: taskName }]);

      // 202 Accepted: リクエストは受理されたが、処理は完了していない
      return c.json({
        success: true,
        message: 'Task queued',
        task: taskName,
      }, 202);
    } catch (error) {
      console.error(`Failed to enqueue task ${taskName}:`, error);
      throw new HTTPException(500, {
        message: `Task enqueue failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  });

  app.get('/api/health', async(c) => {
    try {
      await buildTaskContext(c.env).db.run(sql`select 1`);
      return c.json({ status: 'ok', time: new Date().toISOString() });
    } catch {
      return c.json({ status: 'error', time: new Date().toISOString() }, 503);
    }
  });

  return app;
};

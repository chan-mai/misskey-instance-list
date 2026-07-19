import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { prisma } from '@mil/core/db';
import type { AgentConfig } from '../config.js';
import { createCrawlContext, assertEnqueueable } from '../config.js';
import { enqueueTask } from '../cloud-tasks.js';
import { TASKS, isValidTask, type TaskContext, type TaskName } from '../tasks/registry.js';

export const createTasksRouter = (config: AgentConfig) => {
  const app = new Hono();

  const buildTaskContext = (): TaskContext => ({
    ...createCrawlContext(config),
    runTask: (name: TaskName) => TASKS[name].run(buildTaskContext()),
  });

  /**
   * タスク実行API
   * Cloud Schedulerから呼び出されるエンドポイント
   *
   * POST /api/tasks/:name
   * Authorization: Bearer <TASK_SECRET>
   *
   * タスクを同期実行せずCloud Tasksにキューイングし, タイムアウトと競合を避ける
   */
  app.post('/api/tasks/:name', async(c) => {
    const authHeader = c.req.header('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }
    // config.taskSecretはloadConfigでtrim済み
    if (authHeader.slice(7) !== config.taskSecret) {
      throw new HTTPException(403, { message: 'Forbidden' });
    }

    const taskName = c.req.param('name');
    if (!isValidTask(taskName)) {
      throw new HTTPException(404, { message: `Task not found: ${taskName}` });
    }

    try {
      console.log(`[TaskAPI] Enqueuing task: ${taskName}`);
      const result = await enqueueTask(assertEnqueueable(config), taskName);

      // 202 Accepted: リクエストは受理されたが、処理は完了していない
      return c.json({
        success: true,
        message: result.status === 'already_exists' ? 'Task already exists' : 'Task queued',
        task: taskName,
        status: result.status,
      }, 202);
    } catch (error) {
      console.error(`Failed to enqueue task ${taskName}:`, error);
      throw new HTTPException(500, {
        message: `Task enqueue failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  });

  /**
   * Cloud Tasks ワーカーエンドポイント
   * POST /api/tasks/workers/:name
   *
   * 認証はCloud RunのIAMが担う。Cloud Tasksキューはサービスアカウントが署名した
   * OIDCトークンを送るよう設定されており, リクエストがここに届く前に検証される。
   *
   * IAM設定については Terraform 構成を参照:
   * - Cloud Tasksサービスアカウントは `roles/run.invoker` を持つ
   * - Cloud RunサービスがOIDCトークンを検証する
   */
  app.post('/api/tasks/workers/:name', async(c) => {
    const taskName = c.req.param('name');

    if (!isValidTask(taskName)) {
      // Cloud Tasksは429を除く4xxをリトライしない, 無効な名前でリトライさせないため404を返す
      console.error(`Invalid task name requested: ${taskName}`);
      throw new HTTPException(404, { message: 'Invalid task name' });
    }

    const startTime = Date.now();
    console.log(`[Worker] Starting task: ${taskName}`);

    try {
      const result = await TASKS[taskName].run(buildTaskContext());

      const duration = Date.now() - startTime;
      console.log(`[Worker] Task ${taskName} completed successfully in ${duration}ms`);

      return c.json({ success: true, task: taskName, result });
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      console.error(`[Worker] Task ${taskName} failed after ${duration}ms:`, error);

      // 500を返してCloud Tasksのリトライをトリガーする, 機密情報は載せない
      throw new HTTPException(500, { message: 'Internal Server Error' });
    }
  });

  app.get('/api/health', async(c) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return c.json({ status: 'ok', time: new Date().toISOString() });
    } catch {
      return c.json({ status: 'error', time: new Date().toISOString() }, 503);
    }
  });

  return app;
};

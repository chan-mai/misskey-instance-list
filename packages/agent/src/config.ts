import { createDb } from '@mil/core/db';
import { TASKS, type TaskName } from './tasks/registry.js';
import type { TaskContext, TaskMessage } from './tasks/define.js';

export interface Env {
  DB: D1Database;
  TASK_QUEUE: Queue<TaskMessage>;
  /** 手動トリガー用の共有シークレット, wrangler secret putで設定する */
  TASK_SECRET: string;
  /** GitHub APIのレート制限緩和用トークン */
  GITHUB_TOKEN?: string;
}

/** Queues sendBatchの1回あたり上限 */
const SEND_BATCH_LIMIT = 100;

// scheduledハンドラはcontroller.cronで式しか渡さないため式ごとに配列で持つ
export const CRON_TASKS: Record<string, TaskName[]> = {
  '0 0 * * *': ['discovery', 'sync:exclusions'],
  '0 */6 * * *': ['sync:stats'],
  '0 */12 * * *': ['sync:recommendation-scores', 'update'],
};

// D1バインディングはenvにしか無いためイベント毎に組み立てる
export const buildTaskContext = (env: Env): TaskContext => {
  const db = createDb(env.DB);

  const enqueue = async(messages: TaskMessage[]): Promise<void> => {
    for (let i = 0; i < messages.length; i += SEND_BATCH_LIMIT) {
      const slice = messages.slice(i, i + SEND_BATCH_LIMIT);
      await env.TASK_QUEUE.sendBatch(slice.map((body) => ({ body })));
    }
  };

  const ctx: TaskContext = {
    db,
    githubToken: env.GITHUB_TOKEN,
    runTask: (name: TaskName) => TASKS[name].run(ctx),
    enqueue,
  };

  return ctx;
};

import type { CrawlContext } from '@mil/core/crawl';
// 型のみのimportは実行時に消えるため, registry.tsとの循環は起きない
import type { TaskName } from './registry.js';

export interface TaskContext extends CrawlContext {
  /** 他タスクを同一プロセス内で呼び出す, updateの初回シードからsync:statsを起動する等 */
  runTask: (name: TaskName) => Promise<unknown>;
}

export interface TaskDefinition {
  meta: { name: string; description: string };
  run: (ctx: TaskContext) => Promise<unknown>;
}

export const defineTask = (task: TaskDefinition): TaskDefinition => task;

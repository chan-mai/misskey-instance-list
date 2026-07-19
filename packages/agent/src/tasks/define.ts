import type { CrawlContext } from '@mil/core/crawl';
// 型のみのimportは実行時に消えるため, registry.tsとの循環は起きない
import type { TaskName } from './registry.js';

/**
 * キューに載せるメッセージ
 * sync:statsは対象が数千件あり1回の実行に収まらないため, プランナ(task)と
 * 実処理(stats-chunk)に分けてチャンク単位でリトライできるようにしている
 */
export type TaskMessage =
  | { kind: 'task'; name: TaskName }
  | { kind: 'stats-chunk'; hosts: string[] };

export interface TaskContext extends CrawlContext {
  /** 他タスクを同一プロセス内で呼び出す, updateの初回シードからsync:statsを起動する等 */
  runTask: (name: TaskName) => Promise<unknown>;
  /** 後続処理をキューへ積む, 1回の実行に収まらない作業の分割に使う */
  enqueue: (messages: TaskMessage[]) => Promise<void>;
}

export interface TaskDefinition {
  meta: { name: string; description: string };
  run: (ctx: TaskContext) => Promise<unknown>;
}

export const defineTask = (task: TaskDefinition): TaskDefinition => task;

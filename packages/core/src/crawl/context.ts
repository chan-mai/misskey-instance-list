import type { Database } from '../db/index.js';

/**
 * クロール処理に必要な依存の受け渡し
 *
 * Nitroの`useRuntimeConfig()`のようなフレームワーク固有のグローバルに依存させないため,
 * 呼び出し側が明示的に組み立てて渡す
 */
export interface CrawlContext {
  db: Database;
  /** GitHub APIのレート制限緩和用トークン, 未設定なら未認証で叩く */
  githubToken?: string;
}

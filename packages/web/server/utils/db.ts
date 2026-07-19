import { createDb, type Database } from '@mil/core/db';
import type { H3Event } from 'h3';

/** createDbが受けるD1バインディングの型, @cloudflare/workers-typesの版ずれを避けるため実装から導出する */
type D1Binding = Parameters<typeof createDb>[0];

/**
 * リクエストごとにD1接続を組み立てる
 *
 * D1バインディングはWorkerのenvにしか存在せず, モジュールスコープのsingletonにできない。
 * cloudflare_moduleプリセットがevent.context.cloudflare.envに載せる。
 * envはwrangler types未生成だと`{}`になるため, バインディング型を明示する
 */
export const useDb = (event: H3Event): Database => {
  const env = event.context.cloudflare?.env as { DB?: D1Binding } | undefined;
  const binding = env?.DB;
  if (!binding) {
    throw createError({ statusCode: 500, statusMessage: 'D1 binding "DB" unavailable' });
  }
  return createDb(binding);
};

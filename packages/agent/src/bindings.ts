import { createClient, type BindingConfig } from 'tsumugi/client';
import type { Env } from './env.js';

// binding単位の分割数と流量制御
export const BINDINGS = {
  SyncInstance: {
    shards: 1,
    policy: {
      concurrency: 24,
      // 同一インスタンスへ同時に2本以上のリクエストを送らない
      perKeyConcurrency: 1,
      // 同時実行の空きが出た直後の集中を抑える
      rate: { tokens: 240, intervalMs: 60_000 },
      // 一括投入なので優先度の昇格に意味がない
      agingIntervalMs: null,
      // Queues配送の遅れと外向き接続の待ちを見込む
      reaperGraceMs: 60_000,
    },
    // 明細はD1へ投影済みなのでDOに残す理由がない
    sweepAfterMs: 60_000,
    failedRetentionMs: 2 * 24 * 60 * 60 * 1000,
  },

  // 前回が終わる前に次が始まらないよう同時実行を1に制限する
  PlanStatsSync: { policy: { concurrency: 1 } },
  PlanInstanceUpdate: { policy: { concurrency: 1 } },
  DiscoverInstances: { policy: { concurrency: 1 } },
  SyncExclusions: { policy: { concurrency: 1 } },
  SyncRecommendationScores: { policy: { concurrency: 1 } },
} satisfies Record<string, BindingConfig>;

// tsumugi.enqueueを使うとsrc/index.tsとの循環importになる
const client = createClient<Env>(BINDINGS);

export const enqueueSyncInstance = (
  env: Env,
  hosts: readonly string[],
  scheduledAt: number,
  withLanguage: boolean,
  keyPrefix: 'stats' | 'update',
): Promise<string[]> => client.enqueueMany(env, hosts.map((host) => ({
  binding: 'SyncInstance',
  payload: { host, scheduledAt, withLanguage },
  concurrencyKey: host,
  // プランナがリトライされても同じホストのジョブが重複しない
  uniqueKey: `${keyPrefix}:${scheduledAt}:${host}`,
  // 次サイクルまでに予約が切れるよう発火間隔より短くする
  uniqueForMs: keyPrefix === 'stats' ? 5 * 60 * 60 * 1000 : 11 * 60 * 60 * 1000,
})));

export const enqueuePlanStatsSync =(env: Env, scheduledAt: number): Promise<string> =>
  client.enqueue(env, {
    binding: 'PlanStatsSync',
    payload: { scheduledAt },
    uniqueKey: 'plan-stats-sync:seed',
    uniqueForMs: 60 * 60 * 1000,
    timeoutMs: 300_000,
  });

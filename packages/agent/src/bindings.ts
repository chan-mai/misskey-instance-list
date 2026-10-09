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

  SyncInstanceBatch: {
    shards: 1,
    // NOTE: 実行間隔はrunAtで調整
    policy: { concurrency: 24, agingIntervalMs: null, reaperGraceMs: 60_000 },
    sweepAfterMs: 60_000,
    failedRetentionMs: 2 * 24 * 60 * 60 * 1000,
  },

  // 前回が終わる前に次が始まらないよう同時実行を1に制限する
  PlanStatsSync: { policy: { concurrency: 1 } },
  ListUpdateTargets: { policy: { concurrency: 1 } },
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
): Promise<string[]> => client.enqueueMany(env, hosts.map((host) => ({
  binding: 'SyncInstance',
  payload: { host, scheduledAt, withLanguage: true },
  concurrencyKey: host,
  // プランナがリトライされても同じホストのジョブが重複しない
  uniqueKey: `stats:${scheduledAt}:${host}`,
  // 次サイクルまでに予約が切れるよう発火間隔より短くする
  uniqueForMs: 5 * 60 * 60 * 1000,
})));

// 1ジョブあたりのホスト数
export const SYNC_BATCH_SIZE = 10;
// バッチの実行開始間隔, ホスト換算で240件/分
const SYNC_BATCH_INTERVAL_MS = 2_500;

export const enqueueSyncInstanceBatches = async(
  env: Env,
  batches: readonly (readonly string[])[],
  scheduledAt: number,
  startAt: number,
  offset: number,
): Promise<string[]> => {
  const keys = await Promise.all(batches.map(hashHosts));
  return client.enqueueMany(env, batches.map((hosts, i) => ({
    binding: 'SyncInstanceBatch',
    payload: { hosts, scheduledAt },
    // 構成ホスト全体で識別
    uniqueKey: `stats:${scheduledAt}:${keys[i]}`,
    uniqueForMs: 5 * 60 * 60 * 1000,
    // 実行可能ジョブの滞留防止
    runAt: startAt + (offset + i) * SYNC_BATCH_INTERVAL_MS,
    // 1ホスト最大90秒程度の逐次処理
    timeoutMs: 600_000,
  })));
};

const hashHosts = async(hosts: readonly string[]): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(hosts.join('\n')));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
};

export const enqueuePlanStatsSync =(env: Env, scheduledAt: number): Promise<string> =>
  client.enqueue(env, {
    binding: 'PlanStatsSync',
    payload: { scheduledAt, force: true },
    uniqueKey: 'plan-stats-sync:seed',
    uniqueForMs: 60 * 60 * 1000,
    timeoutMs: 300_000,
  });

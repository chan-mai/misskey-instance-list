import { Performer } from 'tsumugi/performer';
import { enqueueSyncInstance } from '../bindings.js';
import { syncInstance } from './sync-instance.js';
import type { Env } from '../env.js';

export interface SyncInstanceBatchPayload {
  hosts: string[];
  // サイクルの基準時刻
  scheduledAt: number;
}

export interface SyncInstanceBatchResult {
  synced: number;
  // 単体ジョブで再試行するホスト
  retried: string[];
}

// 同時接続数上限の回避で逐次処理
export class SyncInstanceBatch extends Performer<
  SyncInstanceBatchPayload,
  SyncInstanceBatchResult,
  object,
  Env
> {
  async perform({ hosts, scheduledAt }: SyncInstanceBatchPayload): Promise<SyncInstanceBatchResult> {
    const failed: string[] = [];
    for (const host of hosts) {
      try {
        await syncInstance(this.env, host, scheduledAt, true);
      } catch (e) {
        console.warn(`Sync failed for ${host}:`, e);
        failed.push(host);
      }
    }

    if (failed.length > 0) {
      await enqueueSyncInstance(this.env, failed, scheduledAt);
    }

    return { synced: hosts.length - failed.length, retried: failed };
  }
}

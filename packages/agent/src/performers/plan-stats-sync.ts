import { Performer, type JobContext } from 'tsumugi/performer';
import { and, asc, eq, isNull, ne } from 'drizzle-orm';
import { createDb, instances, excludedHosts } from '@mil/core/db';
import { SYNC_BATCH_SIZE, enqueueSyncInstanceBatches } from '../bindings.js';
import type { Env } from '../env.js';

// 1回のenqueueManyで送るバッチ数
const ENQUEUE_CHUNK = 100;

export interface PlanStatsSyncPayload {
  scheduledAt: number;
  // 実行間隔の設定を無視
  force?: boolean;
}

export interface PlanStatsSyncResult {
  enqueued: number;
}

// 全インスタンスの統計同期を複数ホスト単位のジョブへ分割
export class PlanStatsSync extends Performer<PlanStatsSyncPayload, PlanStatsSyncResult, object, Env> {
  async perform({ scheduledAt, force }: PlanStatsSyncPayload, ctx: JobContext): Promise<PlanStatsSyncResult> {
    const intervalHours = Number(this.env.STATS_SYNC_INTERVAL_HOURS ?? 0);
    if (!force && intervalHours > 0 && Math.floor(scheduledAt / 3_600_000) % intervalHours !== 0) {
      return { enqueued: 0 };
    }

    const db = createDb(this.env.DB);

    // プランナ再試行時もバッチ構成とuniqueKeyを同一に保つ
    const candidates = await db
      .select({ id: instances.id })
      .from(instances)
      .leftJoin(excludedHosts, eq(instances.id, excludedHosts.domain))
      .where(and(ne(instances.suspension_state, 'gone'), isNull(excludedHosts.domain)))
      .orderBy(asc(instances.id));

    const hosts = candidates.map((row) => row.id);
    const batches: string[][] = [];
    for (let i = 0; i < hosts.length; i += SYNC_BATCH_SIZE) {
      batches.push(hosts.slice(i, i + SYNC_BATCH_SIZE));
    }

    const startAt = Date.now();
    for (let i = 0; i < batches.length; i += ENQUEUE_CHUNK) {
      // timeoutMsの起点を最後の報告時刻へ移す
      await ctx.heartbeat(i / batches.length);
      await enqueueSyncInstanceBatches(this.env, batches.slice(i, i + ENQUEUE_CHUNK), scheduledAt, startAt, i);
    }

    console.log(`Enqueued ${hosts.length} stats jobs in ${batches.length} batches.`);
    return { enqueued: hosts.length };
  }
}

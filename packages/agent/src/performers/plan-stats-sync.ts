import { Performer, type JobContext } from 'tsumugi/performer';
import { and, asc, eq, isNull, ne } from 'drizzle-orm';
import { createDb, instances, excludedHosts } from '@mil/core/db';
import { enqueueSyncInstance } from '../bindings.js';
import type { Env } from '../env.js';

const ENQUEUE_CHUNK = 1000;

export interface PlanStatsSyncPayload {
  scheduledAt: number;
}

export interface PlanStatsSyncResult {
  enqueued: number;
}

// 全インスタンスの統計同期をホスト単位のジョブへ分割
export class PlanStatsSync extends Performer<PlanStatsSyncPayload, PlanStatsSyncResult, object, Env> {
  async perform({ scheduledAt }: PlanStatsSyncPayload, ctx: JobContext): Promise<PlanStatsSyncResult> {
    const db = createDb(this.env.DB);

    const candidates = await db
      .select({ id: instances.id })
      .from(instances)
      .leftJoin(excludedHosts, eq(instances.id, excludedHosts.domain))
      .where(and(ne(instances.suspension_state, 'gone'), isNull(excludedHosts.domain)))
      .orderBy(asc(instances.last_check_at));

    const hosts = candidates.map((row) => row.id);

    for (let i = 0; i < hosts.length; i += ENQUEUE_CHUNK) {
      // timeoutMsの起点を最後の報告時刻へ移す
      await ctx.heartbeat(i / hosts.length);
      await enqueueSyncInstance(this.env, hosts.slice(i, i + ENQUEUE_CHUNK), scheduledAt);
    }

    console.log(`Enqueued ${hosts.length} stats jobs.`);
    return { enqueued: hosts.length };
  }
}

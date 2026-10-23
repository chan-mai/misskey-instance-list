import { Performer } from 'tsumugi/performer';
import { createDb } from '@mil/core/db';
import { countInstances, listStaleSyncTargetIds } from '@mil/core/repository';
import { seedInstances } from '@mil/core/domain';
import { enqueuePlanStatsSync } from '../bindings.js';
import type { Env } from '../env.js';

const DEFAULT_LIMIT = 100;

export interface ListUpdateTargetsPayload {
  scheduledAt: number;
  limit?: number;
}

export interface ListUpdateTargetsResult {
  hosts: string[];
  seeded: number;
}

// 更新の古い順に再取得対象を返す, DBが空ならシードして統計同期を起こす
export class ListUpdateTargets extends Performer<
  ListUpdateTargetsPayload,
  ListUpdateTargetsResult,
  object,
  Env
> {
  async perform({ scheduledAt, limit = DEFAULT_LIMIT }: ListUpdateTargetsPayload): Promise<ListUpdateTargetsResult> {
    const db = createDb(this.env.DB);

    if (await countInstances(db) === 0) {
      const seeded = await seedInstances(db);
      await enqueuePlanStatsSync(this.env, scheduledAt);
      return { hosts: [], seeded };
    }

    return { hosts: await listStaleSyncTargetIds(db, limit), seeded: 0 };
  }
}

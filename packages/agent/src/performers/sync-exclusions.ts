import { Performer } from 'tsumugi/performer';
import { createDb } from '@mil/core/db';
import { syncJoinMisskeyExclusions } from '@mil/core/domain';
import type { Env } from '../env.js';

export interface SyncExclusionsResult {
  additions: number;
  deletions: number;
}

export class SyncExclusions extends Performer<Record<string, never>, SyncExclusionsResult, object, Env> {
  async perform(): Promise<SyncExclusionsResult> {
    // web側の/api/v1/exclusionsキャッシュはmaxAge切れを待つ
    return syncJoinMisskeyExclusions(createDb(this.env.DB));
  }
}

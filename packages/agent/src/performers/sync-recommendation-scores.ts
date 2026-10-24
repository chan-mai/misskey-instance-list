import { Performer } from 'tsumugi/performer';
import { createDb } from '@mil/core/db';
import { syncRecommendationScores } from '@mil/core/domain';
import type { Env } from '../env.js';

export interface SyncRecommendationScoresResult {
  updated: number;
  latestVersion: string | null;
}

export class SyncRecommendationScores extends Performer<
  Record<string, never>,
  SyncRecommendationScoresResult,
  object,
  Env
> {
  async perform(): Promise<SyncRecommendationScoresResult> {
    return syncRecommendationScores(createDb(this.env.DB));
  }
}

import { listAliveScoreInputs, updateRecommendationScores } from '../repository/instances.js';
import type { Database } from '../db/index.js';
import { calculateRecommendationScore } from './score.js';
import { resolveLatestStableVersion } from './version.js';

const BATCH_SIZE = 50;

// アクティブなインスタンスのスコアを再計算
export async function syncRecommendationScores(
  db: Database,
): Promise<{ updated: number; latestVersion: string | null }> {
  const latestVersion = await resolveLatestStableVersion(db);
  if (latestVersion === null) {
    console.warn('Latest version unavailable, version score will be 0 for all instances');
  }
  console.log(`Latest Misskey version: ${latestVersion}`);

  let updated = 0;
  let cursor: string | undefined;

  for (;;) {
    const rows = await listAliveScoreInputs(db, BATCH_SIZE, cursor);
    if (rows.length === 0) break;

    await updateRecommendationScores(db, rows.map((row) => ({
      id: row.id,
      score: calculateRecommendationScore(row, latestVersion),
    })));

    updated += rows.length;
    cursor = rows.at(-1)!.id;
    console.log(`Processed ${updated} instances...`);
  }

  return { updated, latestVersion };
}

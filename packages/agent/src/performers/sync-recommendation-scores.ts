import { Performer } from 'tsumugi/performer';
import { and, asc, eq, gt } from 'drizzle-orm';
import type { BatchItem } from 'drizzle-orm/batch';
import { createDb, instances } from '@mil/core/db';
import { calculateRecommendationScore } from '@mil/core/crawl';
import type { Env } from '../env.js';

const BATCH_SIZE = 50;

export interface SyncRecommendationScoresResult {
  updated: number;
  latestVersion: string | null;
}

interface ReleaseItem {
  tag_name?: string;
}

// アクティブなインスタンスのスコアを再計算
export class SyncRecommendationScores extends Performer<
  Record<string, never>,
  SyncRecommendationScoresResult,
  object,
  Env
> {
  async perform(): Promise<SyncRecommendationScoresResult> {
    const db = createDb(this.env.DB);
    const latestVersion = await fetchLatestStableVersion();
    console.log(`Latest Misskey version: ${latestVersion}`);

    let updated = 0;
    let cursor: string | undefined;

    for (;;) {
      // Prismaのcursor+skip:1はidが一意なのでキーセット(gt)と等価
      const rows = await db
        .select({
          id: instances.id,
          users_count: instances.users_count,
          notes_count: instances.notes_count,
          created_at: instances.created_at,
          version: instances.version,
        })
        .from(instances)
        .where(
          cursor === undefined
            ? eq(instances.is_alive, true)
            : and(eq(instances.is_alive, true), gt(instances.id, cursor)),
        )
        .orderBy(asc(instances.id))
        .limit(BATCH_SIZE);

      if (rows.length === 0) break;

      // D1のbatchは暗黙のトランザクション1文2パラメータ x 50文で上限内
      const updates: BatchItem<'sqlite'>[] = rows.map((row) =>
        db
          .update(instances)
          .set({ recommendation_score: calculateRecommendationScore(row, latestVersion) })
          .where(eq(instances.id, row.id)),
      );
      await db.batch(updates as [BatchItem<'sqlite'>, ...BatchItem<'sqlite'>[]]);

      updated += rows.length;
      cursor = rows.at(-1)!.id;
      console.log(`Processed ${updated} instances...`);
    }

    return { updated, latestVersion };
  }
}

// 取得失敗はnullで続行
async function fetchLatestStableVersion(): Promise<string | null> {
  try {
    const res = await fetch('https://api.github.com/repos/misskey-dev/misskey/releases/latest', {
      headers: {
        'User-Agent': 'MisskeyInstanceList/1.0',
        'Accept': 'application/vnd.github+json',
      },
    });
    if (!res.ok) return null;

    const release = await res.json() as ReleaseItem;
    return release.tag_name ?? null;
  } catch (e) {
    console.error('Failed to fetch latest version:', e);
    return null;
  }
}

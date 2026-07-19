import { and, asc, eq, gt } from 'drizzle-orm';
import type { BatchItem } from 'drizzle-orm/batch';
import { instances } from '@mil/core/db';
import { calculateRecommendationScore } from '@mil/core/crawl';
import { defineTask } from '../define.js';
/**
 * 全てのアクティブなインスタンスのおすすめスコアを更新
 */
/**
 * タスク: sync:recommendation-scores
 * 説明: インスタンスのおすすめスコアを更新する
 * 冪等性: 冪等安全にリトライ可能スコアを再計算して更新します
 */
export default defineTask({
  meta: {
    name: 'sync:recommendation-scores',
    description: 'Update recommendation scores for all active instances',
  },
  async run(ctx) {
    console.log('[Task] Starting recommendation score update...');

    // 最新バージョンを取得
    let latestVersion: string | null = null;
    try {
      // リストから確実に安定版を探す
      const releases = await fetch('https://api.github.com/repos/misskey-dev/misskey/releases?per_page=10', {
        headers: {
          'User-Agent': 'MisskeyInstanceList/1.0'
        }
      }).then(res => res.json() as Promise<unknown[]>);

      if (Array.isArray(releases)) {
        interface ReleaseItem {
          prerelease: boolean;
          tag_name?: string;
        }
        const stableRelease = releases.find((r: unknown) => {
          const release = r as ReleaseItem;
          return !release.prerelease &&
            release.tag_name &&
            !release.tag_name.includes('-');
        }) as ReleaseItem | undefined;

        if (stableRelease && stableRelease.tag_name) {
          latestVersion = stableRelease.tag_name;
        }
      }
      console.log(`[Task] Latest Misskey version: ${latestVersion}`);
    } catch (e) {
      console.error('[Task] Failed to fetch latest version:', e);
    }

    const BATCH_SIZE = 50;
    let processed = 0;
    let updated = 0;
    let cursor: string | undefined;

    try {
      let hasMore = true;

      while (hasMore) {
        // アクティブなインスタンスをバッチで取得
        // Prismaのcursor+skip:1はidが一意なのでキーセット(gt)と等価
        const rows = await ctx.db
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

        if (rows.length === 0) {
          hasMore = false;
          continue;
        }

        // D1のbatchは暗黙のトランザクション1文2パラメータ x 50文で上限内
        const updates: BatchItem<'sqlite'>[] = rows.map((row) =>
          ctx.db
            .update(instances)
            .set({ recommendation_score: calculateRecommendationScore(row, latestVersion) })
            .where(eq(instances.id, row.id)),
        );

        await ctx.db.batch(updates as [BatchItem<'sqlite'>, ...BatchItem<'sqlite'>[]]);

        processed += rows.length;
        updated += updates.length;
        cursor = rows.at(-1)!.id;

        console.log(`[Task] Processed ${processed} instances...`);
      }

      console.log(`[Task] Completed. Updated scores for ${updated} instances.`);
      return { result: 'Success', updated };
    } catch (error) {
      console.error('[Task] Failed to update recommendation scores:', error);
      throw error;
    }
  },
});

import { prisma } from '../../utils/prisma';
import { calculateRecommendationScore } from '../../utils/calculate-score';
/**
 * 全てのアクティブなインスタンスのおすすめスコアを更新
 */
export default defineTask({
  meta: {
    name: 'sync:recommendation-scores',
    description: 'Update recommendation scores for all active instances',
  },
  async run() {
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
        const instances = await prisma.instance.findMany({
          where: {
            is_alive: true,
          },
          select: {
            id: true,
            users_count: true,
            notes_count: true,
            created_at: true,
            version: true,
          },
          take: BATCH_SIZE,
          ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
          orderBy: { id: 'asc' },
        });

        if (instances.length === 0) {
          hasMore = false;
          continue;
        }

        // バッチ処理
        const updates = instances.map((instance) => {
          const score = calculateRecommendationScore(instance, latestVersion);
          return prisma.instance.update({
            where: { id: instance.id },
            data: { recommendation_score: score },
          });
        });

        await prisma.$transaction(updates);

        processed += instances.length;
        updated += updates.length;
        cursor = instances[instances.length - 1].id;

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

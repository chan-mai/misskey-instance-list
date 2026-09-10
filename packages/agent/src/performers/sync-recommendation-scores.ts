import { Performer } from 'tsumugi/performer';
import { and, asc, eq, gt } from 'drizzle-orm';
import type { BatchItem } from 'drizzle-orm/batch';
import { createDb, instances, type Database } from '@mil/core/db';
import { calculateRecommendationScore, parseVersionToMonths } from '@mil/core/crawl';
import type { Env } from '../env.js';

const BATCH_SIZE = 50;
const OFFICIAL_REPOSITORY_URL = 'https://github.com/misskey-dev/misskey';
// 安定版のみ (プレリリース接尾辞なし)
const RELEASE_VERSION_PATTERN = /^\d{4}\.\d{1,2}\.\d+$/;

export interface SyncRecommendationScoresResult {
  updated: number;
  latestVersion: string | null;
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
    const latestVersion = (await fetchLatestStableVersion()) ?? (await findLatestVersionFromDb(db));
    if (latestVersion === null) {
      console.warn('Latest version unavailable, version score will be 0 for all instances');
    }
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
          version: instances.version,
          ip_stack: instances.ip_stack,
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

// releases/latestのリダイレクト先URLからタグ取得, REST APIのレート制限回避
async function fetchLatestStableVersion(): Promise<string | null> {
  try {
    const res = await fetch(`${OFFICIAL_REPOSITORY_URL}/releases/latest`, {
      redirect: 'manual',
      headers: { 'User-Agent': 'MisskeyInstanceList/1.0' },
    });
    const location = res.headers.get('location');
    const tag = location?.match(/\/releases\/tag\/([^/?#]+)$/)?.[1];
    if (!tag) {
      console.warn(`Failed to resolve latest release tag: status=${res.status}`);
      return null;
    }
    return decodeURIComponent(tag);
  } catch (e) {
    console.error('Failed to fetch latest version:', e);
    return null;
  }
}

// 取得失敗時の代替, 公式レポジトリ稼働中インスタンスの最大CalVer
async function findLatestVersionFromDb(db: Database): Promise<string | null> {
  const rows = await db
    .selectDistinct({ version: instances.version })
    .from(instances)
    .where(and(eq(instances.is_alive, true), eq(instances.repository_url, OFFICIAL_REPOSITORY_URL)));

  let latest: { version: string; months: number } | null = null;
  for (const { version } of rows) {
    if (!version || !RELEASE_VERSION_PATTERN.test(version)) continue;
    const months = parseVersionToMonths(version);
    if (months !== null && (latest === null || months > latest.months)) {
      latest = { version, months };
    }
  }
  if (latest !== null) {
    console.warn(`Using latest version from database: ${latest.version}`);
  }
  return latest?.version ?? null;
}

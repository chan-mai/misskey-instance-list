import { and, asc, count, desc, eq, isNotNull, sum } from 'drizzle-orm';
import { instances, repositories as repositoriesTable, excludedHosts } from '@mil/core/db';

/**
 * GET /api/v1/stats
 *
 * ネットワーク全体の統計情報を取得します。
 * - 既知のインスタンス数
 * - アクティブなインスタンス数
 * - 除外されたインスタンス数
 * - 総ユーザー数 (アクティブなインスタンスのみ)
 * - リポジトリ使用状況 (アクティブなインスタンスのみ)
 * - 言語使用状況 (アクティブなインスタンスのみ)
 *
 * @returns {Promise<StatsResponse>} 統計情報オブジェクト
 */
export default defineCachedEventHandler(async(event): Promise<StatsResponse> => {
  const db = useDb(event);

  // スカラー4件は1回のbatchにまとめて往復を削減する
  const [knownRows, activeRows, exclusionRows, usersRows] = await db.batch([
    // 関知済みインスタンス数をカウント (停止中・消滅したものも含む)
    db.select({ value: count() }).from(instances),
    // アクティブなインスタンス数をカウント
    db.select({ value: count() }).from(instances).where(eq(instances.is_alive, true)),
    // 除外リストのカウント
    db.select({ value: count() }).from(excludedHosts),
    // ユーザー総数をカウント
    db
      .select({ value: sum(instances.users_count).mapWith(Number) })
      .from(instances)
      .where(eq(instances.is_alive, true)),
  ]);

  // アクティブなインスタンスのリポジトリ使用状況を取得
  const repoStats = await db
    .select({
      url: instances.repository_url,
      name: repositoriesTable.name,
      description: repositoriesTable.description,
      count: count(instances.repository_url),
    })
    .from(instances)
    .leftJoin(repositoriesTable, eq(instances.repository_url, repositoriesTable.url))
    .where(and(eq(instances.is_alive, true), isNotNull(instances.repository_url)))
    .groupBy(instances.repository_url, repositoriesTable.name, repositoriesTable.description)
    // 同数時の順序を固定
    .orderBy(desc(count(instances.repository_url)), asc(instances.repository_url));

  const repositories = repoStats.map(stat => ({
    url: stat.url as string,
    // 旧実装に合わせ空文字はnullへ寄せる
    name: stat.name || null,
    description: stat.description || null,
    count: stat.count,
  }));

  // 言語の使用状況を取得
  const langStats = await db
    .select({ code: instances.language, count: count(instances.language) })
    .from(instances)
    .where(and(eq(instances.is_alive, true), isNotNull(instances.language)))
    .groupBy(instances.language)
    .orderBy(desc(count(instances.language)), asc(instances.language));

  const languages = langStats.map(stat => ({
    code: stat.code as string,
    count: stat.count,
  }));

  return {
    counts: {
      known: knownRows[0]?.value ?? 0,
      active: activeRows[0]?.value ?? 0,
      exclusions: exclusionRows[0]?.value ?? 0,
      // sumは0行でNULLを返す
      users: usersRows[0]?.value ?? 0,
    },
    repositories,
    languages
  };
}, {
  maxAge: 60 * 60
});

import {
  getNetworkCounts,
  listIpStackUsage,
  listLanguageUsage,
  listRepositoryUsage,
} from '@mil/core/repository';

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
 * - IPスタック種別ごとの件数とユーザー数 (アクティブなインスタンスのみ)
 *
 * @returns {Promise<StatsResponse>} 統計情報オブジェクト
 */
export default defineCachedEventHandler(async(event): Promise<StatsResponse> => {
  const db = useDb(event);

  const counts = await getNetworkCounts(db);
  const repoStats = await listRepositoryUsage(db);

  const repositories = repoStats.map(stat => ({
    url: stat.url as string,
    // 旧実装に合わせ空文字はnullへ寄せる
    name: stat.name || null,
    description: stat.description || null,
    count: stat.count,
  }));

  const langStats = await listLanguageUsage(db);

  const languages = langStats.map(stat => ({
    code: stat.code as string,
    count: stat.count,
  }));

  const ipStackStats = await listIpStackUsage(db);

  const ipStacks: StatsResponse['ip_stacks'] = {
    dual: { count: 0, users: 0 },
    v6: { count: 0, users: 0 },
    v4: { count: 0, users: 0 },
    unknown: { count: 0, users: 0 },
  };
  for (const stat of ipStackStats) {
    ipStacks[stat.stack ?? 'unknown'] = { count: stat.count, users: stat.users ?? 0 };
  }

  return {
    counts,
    repositories,
    languages,
    ip_stacks: ipStacks,
  };
}, {
  maxAge: 60 * 60
});

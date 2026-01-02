import { prisma } from '~~/server/utils/prisma';
import { ExcludedHostSource } from '~~/generated/prisma/enums';

/**
 * 除外ホスト一覧取得API (管理者用)
 *
 * 管理者が除外リストを確認するためのエンドポイントです。
 * ページネーション、検索、ソースによるフィルタリングをサポートします。
 *
 * クエリパラメータ:
 * - page: ページ番号 (デフォルト: 1)
 * - limit: 1ページあたりの件数 (デフォルト: 20)
 * - search: ドメインまたは理由の部分一致検索
 * - source: 除外ソース ('manual' | 'system' | 'joinmisskey' | 'all') (デフォルト: 'manual')
 *
 * @returns {Promise<Object>} 除外ホスト一覧とページネーション情報
 */
export default defineEventHandler(async(event) => {
  const query = getQuery(event);
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  // フィルタ設定
  const source = query.source as string || 'all';
  
  // 'all' の場合はソースによる絞り込みを行わない
  const where = source === 'all' ? {} : { source: source as ExcludedHostSource };
  
  // 検索条件の追加 (ドメイン名 または 理由)
  if (query.search) {
    Object.assign(where, {
      OR: [
        { domain: { contains: String(query.search), mode: 'insensitive' } },
        { reason: { contains: String(query.search), mode: 'insensitive' } },
      ]
    });
  }

  // データ取得と総数カウントを並列実行
  const [total, exclusions] = await Promise.all([
    prisma.excludedHost.count({ where }),
    prisma.excludedHost.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
    }),
  ]);

  return {
    total,
    page,
    limit,
    exclusions,
  };
});

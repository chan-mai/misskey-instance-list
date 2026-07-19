import { and, count, desc, eq, like, or, type SQL } from 'drizzle-orm';
import { excludedHosts, clampLikeTerm, isExcludedHostSource } from '@mil/core/db';
import { useDb } from '~~/server/utils/db';

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
 * - source: 除外ソース ('manual' | 'system' | 'joinmisskey' | 'all') (デフォルト: 'all')
 *
 * @returns {Promise<Object>} 除外ホスト一覧とページネーション情報
 */
export default defineEventHandler(async(event) => {
  const db = useDb(event);
  const query = getQuery(event);
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  // フィルタ設定
  const source = query.source as string || 'all';

  const conditions: (SQL | undefined)[] = [];

  // 'all' の場合はソースによる絞り込みを行わない
  if (source !== 'all') {
    // 不正なenum値をアプリ層で検証
    if (!isExcludedHostSource(source)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid source' });
    }
    conditions.push(eq(excludedHosts.source, source));
  }

  // 検索条件の追加 (ドメイン名 または 理由)
  if (query.search) {
    // D1のLIKEパターン長上限(50バイト)に収まるよう切り詰め, ワイルドカードを除去する
    const term = clampLikeTerm(String(query.search));
    conditions.push(
      or(like(excludedHosts.domain, `%${term}%`), like(excludedHosts.reason, `%${term}%`)),
    );
  }

  // and()は引数0件でundefinedを返す, 無条件時はWHERE句を出さない
  const where = and(...conditions);

  // データ取得と総数カウントを並列実行
  const [total, exclusions] = await Promise.all([
    db.select({ value: count() }).from(excludedHosts).where(where),
    db
      .select()
      .from(excludedHosts)
      .where(where)
      .orderBy(desc(excludedHosts.created_at))
      .limit(limit)
      .offset(skip),
  ]);

  return {
    // count()は常に1行返る
    total: total[0]!.value,
    page,
    limit,
    exclusions,
  };
});

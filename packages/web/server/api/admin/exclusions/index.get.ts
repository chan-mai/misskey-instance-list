import { and, count, desc, eq, like, or, type SQL } from 'drizzle-orm';
import { excludedHosts } from '@mil/core/db';
import { adminExclusionsQuerySchema } from '@mil/core/validation';
import { useDb } from '~~/server/utils/db';
import { parseOrThrow } from '~~/server/utils/validate';

/**
 * 除外ホスト一覧取得API (管理者用)
 *
 * 管理者が除外リストを確認するためのエンドポイントです。
 * ページネーション、検索、ソースによるフィルタリングをサポートします。
 *
 * クエリパラメータ:
 * - page: ページ番号 (1以上) (デフォルト: 1)
 * - limit: 1ページあたりの件数 (1-100) (デフォルト: 20)
 * - search: ドメインまたは理由の部分一致検索
 * - source: 除外ソース ('manual' | 'system' | 'joinmisskey' | 'all') (デフォルト: 'all')
 *
 * @throws 400 Bad Request (パラメータが許容値の範囲外)
 * @returns {Promise<Object>} 除外ホスト一覧とページネーション情報
 */
export default defineEventHandler(async(event) => {
  const db = useDb(event);
  const { page, limit, search, source } = parseOrThrow(adminExclusionsQuerySchema, getQuery(event));
  const skip = (page - 1) * limit;

  const conditions: (SQL | undefined)[] = [];

  // 'all' の場合はソースによる絞り込みを行わない
  if (source !== 'all') {
    conditions.push(eq(excludedHosts.source, source));
  }

  // 検索条件の追加 (ドメイン名 または 理由)
  // 切り詰め後に空になる検索語はフィルタしない
  if (search) {
    conditions.push(
      or(like(excludedHosts.domain, `%${search}%`), like(excludedHosts.reason, `%${search}%`)),
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

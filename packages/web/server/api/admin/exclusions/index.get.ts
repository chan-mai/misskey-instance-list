import { searchExclusions } from '@mil/core/repository';
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
  const { total, exclusions } = await searchExclusions(db, { page, limit, search, source });

  return {
    total,
    page,
    limit,
    exclusions,
  };
});

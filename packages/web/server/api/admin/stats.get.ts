import { getAdminCounts } from '@mil/core/repository';
import { useDb } from '~~/server/utils/db';

/**
 * GET /api/admin/stats
 *
 * 管理者ダッシュボード用の統計情報を取得します。
 * キャッシュは行いません。
 */
export default defineEventHandler(async(event) => {
  return getAdminCounts(useDb(event));
});

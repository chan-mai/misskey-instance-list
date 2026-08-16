import { eq } from 'drizzle-orm';
import { excludedHosts } from '@mil/core/db';
import { domainParamSchema } from '@mil/core/validation';
import { useDb } from '~~/server/utils/db';
import { parseOrThrow } from '~~/server/utils/validate';

/**
 * 除外解除API (管理者用)
 *
 * 除外リストからホストを削除します。
 * これにより、次回のクロール時に再びインスタンスとして認識される可能性が出てきます。
 *
 * パスパラメータ:
 * - domain: 対象ドメイン
 *
 * @throws 400 Bad Request
 * @throws 401 Unauthorized
 * @throws 404 Not Found
 */
export default defineEventHandler(async(event) => {
  const db = useDb(event);
  const { domain } = parseOrThrow(domainParamSchema, getRouterParams(event));

  // 削除実行
  // レコード不在でも死なないためreturning件数で判定
  const [exclusion] = await db
    .delete(excludedHosts)
    .where(eq(excludedHosts.domain, domain))
    .returning();

  if (!exclusion) {
    throw createError({ statusCode: 404, statusMessage: 'Exclusion not found' });
  }

  return exclusion;
});

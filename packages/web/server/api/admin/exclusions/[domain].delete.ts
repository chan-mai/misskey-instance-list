import { eq } from 'drizzle-orm';
import { excludedHosts } from '@mil/core/db';
import { validateDomain } from '@mil/core/net';
import { useDb } from '~~/server/utils/db';

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
  const domain = getRouterParam(event, 'domain');

  if (!domain) {
    throw createError({ statusCode: 400, statusMessage: 'Domain is required' });
  }

  const validation = validateDomain(domain);
  if (!validation.valid) {
    throw createError({ statusCode: 400, statusMessage: validation.error });
  }
  const normalizedDomain = validation.normalized!;

  // 削除実行
  // レコード不在でも例外は出ないため, returningの件数で判定する
  const [exclusion] = await db
    .delete(excludedHosts)
    .where(eq(excludedHosts.domain, normalizedDomain))
    .returning();

  if (!exclusion) {
    throw createError({ statusCode: 404, statusMessage: 'Exclusion not found' });
  }

  return exclusion;
});

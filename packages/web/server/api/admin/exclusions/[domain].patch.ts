import { eq } from 'drizzle-orm';
import { excludedHosts } from '@mil/core/db';
import { useDb } from '~~/server/utils/db';

/**
 * 除外理由更新API (管理者用)
 *
 * 既存の除外ホストの理由のみを更新します。
 *
 * パスパラメータ:
 * - domain: 対象ドメイン
 *
 * リクエストボディ:
 * - reason: 新しい除外理由
 *
 * @throws 400 Bad Request
 * @throws 401 Unauthorized
 * @throws 404 Not Found
 */
export default defineEventHandler(async(event) => {
  const db = useDb(event);
  const domain = getRouterParam(event, 'domain');
  const body = await readBody(event);

  if (!domain) {
    throw createError({ statusCode: 400, statusMessage: 'Domain is required' });
  }

  if (typeof body.reason !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Reason must be a string' });
  }

  const reason = body.reason.trim();

  if (reason.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Reason cannot be empty' });
  }

  if (reason.length > 500) {
    throw createError({ statusCode: 400, statusMessage: 'Reason is too long (max 500 chars)' });
  }

  // 理由の更新実行
  // レコード不在でも例外は出ないため, returningの件数で判定する
  const [exclusion] = await db
    .update(excludedHosts)
    .set({ reason })
    .where(eq(excludedHosts.domain, domain))
    .returning();

  if (!exclusion) {
    throw createError({ statusCode: 404, statusMessage: 'Exclusion not found' });
  }

  return exclusion;
});

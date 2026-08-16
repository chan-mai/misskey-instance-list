import { eq } from 'drizzle-orm';
import { instances, excludedHosts } from '@mil/core/db';
import { exclusionCreateBodySchema } from '@mil/core/validation';
import { useDb } from '~~/server/utils/db';
import { parseOrThrow } from '~~/server/utils/validate';

/**
 * 除外ホスト追加API (管理者用)
 *
 * 新しいホストを除外リストに追加します。
 * 追加されたホストは、instancesテーブルからも削除されます。
 *
 * リクエストボディ:
 * - domain: 除外対象ドメイン
 * - reason: 除外理由 (任意)
 * - source: 除外ソース ('manual' | 'system' | 'joinmisskey') (デフォルト: 'manual')
 *
 * @throws 400 Bad Request (ドメイン不正など)
 * @throws 401 Unauthorized
 * @throws 409 Conflict (登録済みの場合)
 */
export default defineEventHandler(async(event) => {
  const db = useDb(event);
  // SQLiteは暗黙変換するため型もアプリ層で
  const { domain, reason, source } = parseOrThrow(exclusionCreateBodySchema, await readBody(event));

  // 除外リストへ登録
  const [exclusion] = await db
    .insert(excludedHosts)
    .values({ domain, reason, source })
    .onConflictDoNothing({ target: excludedHosts.domain })
    .returning();

  if (!exclusion) {
    throw createError({ statusCode: 409, statusMessage: 'Domain is already excluded' });
  }

  // 既存のインスタンスデータがあれば削除
  await db.delete(instances).where(eq(instances.id, domain));

  return exclusion;
});

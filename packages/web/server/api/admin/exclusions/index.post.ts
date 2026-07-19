import { eq } from 'drizzle-orm';
import { instances, excludedHosts, isExcludedHostSource } from '@mil/core/db';
import { validateDomain } from '@mil/core/net';
import { useDb } from '~~/server/utils/db';

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
  const body = await readBody(event);

  // ドメインのバリデーション
  const { valid, normalized, error } = validateDomain(body.domain);
  if (!valid) {
    throw createError({ statusCode: 400, statusMessage: error });
  }

  // SQLiteはTEXT affinityで数値等を暗黙に文字列化するため, 型もアプリ層で見る
  if (body.reason !== undefined && body.reason !== null && typeof body.reason !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid parameters (reason must be a string)' });
  }

  const source = body.source || 'manual';

  // 不正なenum値をアプリ層で検証
  if (!isExcludedHostSource(source)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid parameters (e.g. invalid source)',
    });
  }

  // 除外リストへ登録
  // 一意制約違反は例外ではなく0行で返るため, returningの件数で判定する
  const [exclusion] = await db
    .insert(excludedHosts)
    .values({
      domain: normalized!, // バリデーション済み
      reason: body.reason,
      source,
    })
    .onConflictDoNothing({ target: excludedHosts.domain })
    .returning();

  if (!exclusion) {
    throw createError({ statusCode: 409, statusMessage: 'Domain is already excluded' });
  }

  // 既存のインスタンスデータがあれば削除
  // (除外されたホストはリストに表示すべきではないため)
  await db.delete(instances).where(eq(instances.id, normalized!));

  return exclusion;
});

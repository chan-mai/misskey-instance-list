import { findExclusion, findInstanceSummary, insertInstanceIfAbsent } from '@mil/core/repository';
import { validateInstance, saveInstance } from '@mil/core/domain';
import { isPubliclyResolvable } from '@mil/core/net';
import { crawlBodySchema } from '@mil/core/validation';
import { useDb } from '~~/server/utils/db';
import { parseOrThrow } from '~~/server/utils/validate';
import { createCrawlContext } from '~~/server/utils/crawl-context';

/**
 * インスタンス指名クロールAPI (管理者用)
 *
 * 指定したインスタンスを1件だけ同期的にクロールし, 結果を返します。
 * 定期実行のupdateタスクを待たずに反映したい場合に使います。
 * 未登録ドメインの場合はレコードを作成してからクロールします。
 *
 * リクエストボディ:
 * - domain: クロール対象ドメイン
 *
 * @throws 400 Bad Request (ドメイン不正, 名前解決不可, 非パブリックIP)
 * @throws 409 Conflict (除外済みホスト)
 */
export default defineEventHandler(async(event) => {
  const db = useDb(event);
  const { domain } = parseOrThrow(crawlBodySchema, await readBody(event));

  // 除外ホストはクロール対象にしない
  const excluded = await findExclusion(db, domain);
  if (excluded) {
    throw createError({
      statusCode: 409,
      statusMessage: `Host is excluded (source: ${excluded.source})`,
    });
  }

  // 接続前にSSRF検査
  if (!await isPubliclyResolvable(domain)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Domain does not resolve to a public address',
    });
  }

  // 未登録ドメインはレコードを作ってからクロールす
  const created = await insertInstanceIfAbsent(db, domain);

  const ctx = createCrawlContext(event);
  const result = await validateInstance(ctx, domain);
  await saveInstance(ctx, domain, result, new Date());

  const instance = await findInstanceSummary(db, domain);

  return {
    domain,
    ok: !!result.info,
    error: result.error ?? null,
    created,
    instance: instance ?? null,
  };
});

import { eq } from 'drizzle-orm';
import { instances, excludedHosts } from '@mil/core/db';
import { validateInstance, saveInstance } from '@mil/core/crawl';
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
  const [excluded] = await db
    .select({ source: excludedHosts.source })
    .from(excludedHosts)
    .where(eq(excludedHosts.domain, domain))
    .limit(1);
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
  const created = await db
    .insert(instances)
    .values({ id: domain })
    .onConflictDoNothing({ target: instances.id })
    .returning({ id: instances.id });

  const ctx = createCrawlContext(event);
  const result = await validateInstance(ctx, domain);
  await saveInstance(ctx, domain, result, new Date());

  const [instance] = await db
    .select({
      id: instances.id,
      node_name: instances.node_name,
      version: instances.version,
      users_count: instances.users_count,
      notes_count: instances.notes_count,
      is_alive: instances.is_alive,
      suspension_state: instances.suspension_state,
      language: instances.language,
      repository_url: instances.repository_url,
      last_check_at: instances.last_check_at,
    })
    .from(instances)
    .where(eq(instances.id, domain))
    .limit(1);

  return {
    domain,
    ok: !!result.info,
    error: result.error ?? null,
    created: created.length > 0,
    instance: instance ?? null,
  };
});

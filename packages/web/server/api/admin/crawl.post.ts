import { prisma } from '@mil/core/db';
import { validateInstance, saveInstance } from '@mil/core/crawl';
import { validateDomain, isPubliclyResolvable } from '@mil/core/net';
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
  const body = await readBody(event);

  const { valid, normalized, error } = validateDomain(body?.domain);
  if (!valid) {
    throw createError({ statusCode: 400, statusMessage: error });
  }
  const domain = normalized!; // バリデーション済み

  // 除外ホストはクロール対象にしない
  const excluded = await prisma.excludedHost.findUnique({ where: { domain } });
  if (excluded) {
    throw createError({
      statusCode: 409,
      statusMessage: `Host is excluded (source: ${excluded.source})`,
    });
  }

  // validateDomainは生IPや内部名も通すため, 接続前にSSRF検査を行う
  if (!await isPubliclyResolvable(domain)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Domain does not resolve to a public address',
    });
  }

  // 未登録ドメインはレコードを作ってからクロールする
  const created = await prisma.instance.createMany({
    data: [{ id: domain }],
    skipDuplicates: true,
  });

  const ctx = createCrawlContext();
  const result = await validateInstance(ctx, domain);
  await saveInstance(ctx, domain, result, new Date());

  const instance = await prisma.instance.findUnique({
    where: { id: domain },
    select: {
      id: true,
      node_name: true,
      version: true,
      users_count: true,
      notes_count: true,
      is_alive: true,
      suspension_state: true,
      language: true,
      repository_url: true,
      last_check_at: true,
    },
  });

  return {
    domain,
    ok: !!result.info,
    error: result.error ?? null,
    created: created.count > 0,
    instance,
  };
});

import { defineEventHandler, getQuery } from 'h3';
import { eq } from 'drizzle-orm';
import { instances, excludedHosts } from '@mil/core/db';
import { evaluateInstance } from '@mil/core/crawl';
import { checkQuerySchema } from '@mil/core/validation';

export default defineEventHandler(async(event): Promise<CheckResponse> => {
  const { domain } = parseOrThrow(checkQuerySchema, getQuery(event));

  const db = useDb(event);

  // 既知のインスタンスを確認
  const [existingInstance] = await db
    .select()
    .from(instances)
    .where(eq(instances.id, domain))
    .limit(1);

  if (existingInstance && existingInstance.is_alive && existingInstance.suspension_state === 'none') {
    return {
      is_misskey: true,
      data: {
        name: existingInstance.node_name,
        version: existingInstance.version,
        icon: existingInstance.icon_url,
        banner: existingInstance.banner_url,
        softwareName: 'misskey',
        description: null,
      },
      is_embeddable: await checkEmbeddable(domain),
      source: 'database',
    };
  }

  // 除外ホストを確認
  const [excludedHost] = await db
    .select()
    .from(excludedHosts)
    .where(eq(excludedHosts.domain, domain))
    .limit(1);

  if (excludedHost) {
    const reason = excludedHost.reason?.toLowerCase() || '';
    // Misskeyでないことが確実な場合 (例: システムが検出したフォークや他のソフトウェア)
    // 即座にfalseを返す
    // 手動で除外された場合、ユーザーのコメントを考慮すると技術的にはまだMisskeyである可能性があるため、
    // "Not Misskey" や既知のシステムによる除外理由の場合のみ取得をスキップする
    if (
      reason.includes('not misskey') ||
      reason.includes('fork repository') ||
      reason.includes('spoofing')
    ) {
      return {
        is_misskey: false,
        data: null,
        reason: excludedHost.reason,
        is_embeddable: false, // 除外されている場合は、埋め込み不可とする
        source: 'database',
      };
    }
    // その他の理由(手動)で除外されている場合は、技術的に生存/Misskeyかどうかを確認するためにフォールスルーする
  }

  // 外部情報を取得
  // 認証なしの公開エンドポイントのため, 除外リスト登録やインスタンス削除を伴わない
  // evaluateInstanceを使う(SSRF検査も内部で行われる)
  try {
    const result = await evaluateInstance(domain);

    if (result.info) {
      // Note: evaluateInstance はすでに 'mastodon' のような非Misskeyソフトウェア名を除外している
      // また、フォークも拒否リスト判定で除外済み
      return {
        is_misskey: true,
        data: {
          name: result.info.name,
          version: result.info.version,
          icon: result.info.icon,
          banner: result.info.banner,
          softwareName: result.info.softwareName,
          description: result.info.description ?? null,
        },
        is_embeddable: await checkEmbeddable(domain),
        source: 'fetch',
      };
    } else {
      // 検証に失敗したか、明示的に拒否された
      return {
        is_misskey: false,
        data: null,
        reason: result.rejection?.reason || result.error || 'Unknown error or not a Misskey instance',
        source: 'fetch',
      };
    }
  } catch (e: any) {
    console.error(`Check API Error for ${domain}:`, e);
    return {
      is_misskey: false,
      data: null,
      reason: 'Internal Server Error during check',
      source: 'error',
      error: e.message,
    };
  }
});

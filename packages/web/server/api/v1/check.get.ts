import { defineEventHandler, getQuery, createError } from 'h3';
import { eq } from 'drizzle-orm';
import { instances, excludedHosts } from '@mil/core/db';
import { evaluateInstance } from '@mil/core/crawl';

export default defineEventHandler(async(event): Promise<CheckResponse> => {
  const query = getQuery(event);
  let domain = query.domain;

  if (Array.isArray(domain)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Multiple domain parameters are not allowed',
    });
  }

  if (!domain || typeof domain !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Domain parameter is required',
    });
  }

  domain = domain.trim().toLowerCase();

  // URLが入力された場合、ホスト名を抽出する
  if (domain.includes('://') || domain.startsWith('http://') || domain.startsWith('https://')) {
    try {
      const url = new URL(domain);
      domain = url.hostname;
    } catch {
       throw createError({
          statusCode: 400,
          statusMessage: 'Invalid URL format',
       });
    }
  }

  if (!/^[a-z0-9.-]+$/.test(domain)) {
     throw createError({
      statusCode: 400,
      statusMessage: 'Domain parameter contains invalid characters',
    });
  }

  const loopbackList = ['localhost', '127.0.0.1', '::1'];
  if (loopbackList.includes(domain)) {
     throw createError({
      statusCode: 400,
      statusMessage: 'Localhost addresses are not allowed',
    });
  }

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


import { isPubliclyResolvable } from '@mil/core/net';

async function checkEmbeddable(domain: string): Promise<boolean> {
  const timeout = 5000;

  // 1. IP検証
  if (!await isPubliclyResolvable(domain)) {
    console.warn(`Blocked access to unsafe or unresolvable host: ${domain}`);
    return false;
  }

  // 2. ユーザーIDの取得
  let userId: string;
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(`https://${domain}/api/users/show`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'MisskeyInstanceList/1.0 (EmbedCheck)'
        },
        body: JSON.stringify({ username: 'instance.actor' }),
        signal: controller.signal
      });

      if (res.status !== 200) return false;
      const data = await res.json() as any;
      if (!data || typeof data.id !== 'string') return false;
      userId = data.id;
    } finally {
      clearTimeout(id);
    }
  } catch (e) {
    return false;
  }

  // 3. 埋め込みURLの確認
  const embedUrl = `https://${domain}/embed/user-timeline/${userId}`;

  async function checkUrl(url: string, method: 'HEAD' | 'GET', redirectCount = 0): Promise<boolean> {
    if (redirectCount >= 5) return false;

    let parsed: URL;
    try {
       parsed = new URL(url);
    } catch { return false; }

    // リダイレクト先が別ホストへ逃げるのを防ぐため, 同一ドメインを強制
    if (parsed.hostname !== domain) return false;

    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      try {
        const res = await fetch(url, {
          method,
          redirect: 'manual',
          signal: controller.signal,
          headers: method === 'GET' ? {
             'User-Agent': 'MisskeyInstanceList/1.0 (EmbedCheck)',
          } : undefined,
        });

        if (res.status >= 200 && res.status < 300) {
          return true;
        } else if (res.status >= 300 && res.status < 400) {
          const location = res.headers.get('location');
          if (!location) return false;
          // 相対URLを解決
          const nextUrl = new URL(location, url).toString();
          return checkUrl(nextUrl, method, redirectCount + 1);
        }
        return false;
      } finally {
        clearTimeout(id);
      }
    } catch {
      return false;
    }
  }

  // Fallback HEAD -> GET
  if (await checkUrl(embedUrl, 'HEAD')) return true;
  return await checkUrl(embedUrl, 'GET');
}

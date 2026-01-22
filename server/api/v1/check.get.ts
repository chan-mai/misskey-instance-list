import { defineEventHandler, getQuery, createError } from 'h3';
import { prisma } from '~~/server/utils/prisma';
import { validateInstance } from '~~/server/utils/misskey';

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

  // 既知のインスタンスを確認
  const existingInstance = await prisma.instance.findUnique({
    where: { id: domain },
  });

  if (existingInstance && existingInstance.is_alive && existingInstance.suspension_state === 'none') {
    return {
      isMisskey: true,
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
  const excludedHost = await prisma.excludedHost.findUnique({
    where: { domain },
  });

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
        isMisskey: false,
        data: null,
        reason: excludedHost.reason,
        is_embeddable: false, // 除外されている場合は、埋め込み不可とする
        source: 'database',
      };
    }
    // その他の理由(手動)で除外されている場合は、技術的に生存/Misskeyかどうかを確認するためにフォールスルーする
  }

  // 外部情報を取得
  try {
    const result = await validateInstance(prisma, domain);

    if (result.info) {
      // Note: validateInstance はすでに 'mastodon' のような非Misskeyソフトウェア名を除外している
      // また、フォークも拒否リスト判定で除外済み
      return {
        isMisskey: true,
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
        isMisskey: false,
        data: null,
        reason: result.error || 'Unknown error or not a Misskey instance',
        source: 'fetch',
      };
    }
  } catch (e: any) {
    console.error(`Check API Error for ${domain}:`, e);
    return {
      isMisskey: false,
      data: null,
      reason: 'Internal Server Error during check',
      source: 'error',
      error: e.message,
    };
  }
});


import dns from 'node:dns/promises';
import { isValidPublicIp } from '~~/server/utils/ip';

async function checkEmbeddable(initialHost: string): Promise<boolean> {
  const timeout = 5000;
  const maxRedirects = 5;

  async function safeFetch(url: string, method: 'HEAD' | 'GET', redirectCount = 0): Promise<boolean> {
    if (redirectCount > maxRedirects) return false;

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return false;
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') return false;

    // ホスト名 / IP の検証
    try {
      const addresses = await dns.lookup(parsedUrl.hostname, { all: true });
      if (addresses.length === 0) return false;
      
      // 解決されたIPのいずれかが有効なパブリックIPでない場合、リクエストを拒否する
      const isSafe = addresses.every(addr => isValidPublicIp(addr.address));
      if (!isSafe) {
        console.warn(`Blocked access to unsafe IP for host: ${parsedUrl.hostname}`);
        return false;
      }
    } catch {
      return false;
    }

    // Fetchの実行
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      try {
        const res = await fetch(url, {
          method,
          signal: controller.signal,
          redirect: 'manual', // リダイレクトを手動で処理する
          headers: method === 'GET' ? {
             'User-Agent': 'MisskeyInstanceList/1.0 (EmbedCheck)',
          } : undefined,
        });

        if (res.status >= 200 && res.status < 300) {
          return true;
        } else if (res.status >= 300 && res.status < 400) {
          const location = res.headers.get('location');
          if (!location) return false;
          
          // 相対URLを解決する
          const nextUrl = new URL(location, url).toString();
          return safeFetch(nextUrl, method, redirectCount + 1);
        }
        return false;
      } finally {
        clearTimeout(id);
      }
    } catch {
      return false;
    }
  }

  // HEAD -> GET の順でフォールバック
  if (await safeFetch(`https://${initialHost}`, 'HEAD')) return true;
  return await safeFetch(`https://${initialHost}`, 'GET');
}


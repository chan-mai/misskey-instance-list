import type { PrismaClient, SuspensionState } from './prisma';

export interface InstanceInfo {
  name: string;
  users: number;
  notes: number;
  version: string;
  softwareName: string;
  banner: string | null;
  icon: string | null;
}

export type FetchError = 'TIMEOUT' | 'GONE' | 'UNKNOWN';

export type InstanceResult = {
  info: InstanceInfo | null;
  error?: FetchError;
};

export async function getInstanceInfo(
  host: string,
  userAgent = 'MisskeyInstanceList/0.1.0'
): Promise<InstanceResult> {
  const headers = { 'User-Agent': userAgent };
  const RETRY_LIMIT = 3;
  const TIMEOUT_MS = 10000;

  // .well-known/nodeinfo retry logic
  let wkRes: Response | null = null;
  for (let i = 0; i < RETRY_LIMIT; i++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      wkRes = await fetch(`https://${host}/.well-known/nodeinfo`, {
        signal: controller.signal,
        redirect: 'follow',
        headers,
      });
      clearTimeout(id);
      
      // 成功 or 4xx/5xx (ネットワークエラー以外) なのでループ終了
      break;
    } catch (e: any) {
      clearTimeout(id);
      // 最後の試行でなければ次へ
      if (i < RETRY_LIMIT - 1) {
        const isAbort = e.name === 'AbortError' || e.message?.includes('aborted');
        // タイムアウトまたはネットワークエラーなら再試行
        if (isAbort || e.name === 'FetchError' || e.code === 'ECONNRESET') {
           // 少し待つ
           await new Promise(r => setTimeout(r, 1000 * (i + 1)));
           continue;
        }
      }
      // 再試行しないエラー、または再試行上限
      console.warn(`Failed to fetch nodeinfo for ${host} (Attempt ${i + 1}/${RETRY_LIMIT}):`, e.message);
      return { info: null, error: 'TIMEOUT' };
    }
  }

  if (!wkRes || !wkRes.ok) {
    if (wkRes && wkRes.status === 410) return { info: null, error: 'GONE' };
    // 404等はよくあるので単なる失敗扱い
    return { info: null, error: 'TIMEOUT' }; // TIMEOUTというか接続不可全般
  }

    const wkJson = (await wkRes.json()) as any;
    const links = wkJson.links || [];

    const link =
      links.find(
        (l: any) => l.rel === 'http://nodeinfo.diaspora.software/ns/schema/2.1'
      ) ||
      links.find(
        (l: any) => l.rel === 'http://nodeinfo.diaspora.software/ns/schema/2.0'
      );

    if (!link || !link.href) return { info: null, error: 'UNKNOWN' }; // 正しくないフォーマット

    // NodeInfo取得とメタデータ取得のための新しいAbortController
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const niRes = await fetch(link.href, {
        signal: controller.signal,
        headers,
      });

      if (!niRes.ok) {
          if (niRes.status === 410) return { info: null, error: 'GONE' };
          return { info: null, error: 'TIMEOUT' };
      }

      const ni = (await niRes.json()) as any;

      const metadata = ni.metadata || {};
      const usage = ni.usage || {};
      const users = usage.users || {};

      let name = metadata.nodeName || metadata.name || host;
      let description = metadata.nodeDescription || metadata.description || '';
      let version = ni.software?.version || '';
      let banner = metadata.bannerUrl || null;
      let icon = metadata.iconUrl || null;

      // POST /api/metaを試行
      if (!banner || !icon || !name || !description || !version) {
        try {
          // api/meta用のリトライロジック(接続エラーのみ)
          const fetchWithRetry = async(url: string, options: RequestInit, retries = 3) => {
            for (let i = 0; i < retries; i++) {
              if (options.signal?.aborted) throw new Error('Aborted');
              try {
                const res = await fetch(url, options);
                if (res.ok) return res;
                if (res.status >= 500 && i < retries - 1) continue;
                return res;
              } catch (e: any) {
                if (i === retries - 1 || options.signal?.aborted || e.name === 'AbortError') throw e;
                await new Promise(r => setTimeout(r, 1000 * (i + 1))); 
              }
            }
            throw new Error('Failed to fetch after retries');
          };

          const metaRes = await fetchWithRetry(`https://${host}/api/meta`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers },
            body: JSON.stringify({ detail: true }),
            signal: controller.signal,
          });

          if (metaRes.ok) {
            const meta = (await metaRes.json()) as any;
            if (meta.bannerUrl) banner = meta.bannerUrl;
            if (meta.iconUrl) icon = meta.iconUrl;
            if (meta.name) name = meta.name;
            if (meta.description) description = meta.description;
            if (meta.version) version = meta.version;
          }
        } catch (e: any) {
          if (e.name !== 'AbortError') {
             // ログは状況によるが、すでにfetchWithRetryなどでwarnしているのでここは静かにするか、warnするか
            console.warn(`Failed to fetch meta for ${host}:`, e.message);
          }
        }
      }

      return {
        info: {
          name,
          users: typeof users.total === 'number' ? users.total : 0,
          notes: typeof usage.localPosts === 'number' ? usage.localPosts : 0,
          version,
          softwareName: ni.software?.name || '',
          banner,
          icon,
        },
      };

    } catch (e) {
      // ネットワークエラー、タイムアウト等
      return { info: null, error: 'TIMEOUT' };
    } finally {
      clearTimeout(id);
    }
  }

/**
 * インスタンスの検証を行う
 * スプーフィングを検知した場合、DenyListに追加してInstancesから削除する。
 * CherryPick対策 https://github.com/yunfie-twitter/cherrypick/commit/98ae8b5d869bac470aad2b8f025318f2c222e432
 */
export async function validateInstance(
  prisma: PrismaClient,
  host: string
): Promise<InstanceResult> {
  const botRes = await getInstanceInfo(host, 'JoinMisskey');

  // Botで既にGONEならBrowserチェックするまでもなくGONE
  if (botRes.error === 'GONE') return botRes;

  // Botでタイムアウトなら、とりあえずタイムアウトとして返す（ブラウザチェック不要）
  // NOTE: ブラウザだと通るケースも考えられるが、クローラーがアクセスできなければ意味がないので
  if (!botRes.info) return botRes;

  const browserRes = await getInstanceInfo(
    host,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  const botInfo = botRes.info;
  const browserInfo = browserRes.info; // nullでもOK

  if (botInfo) {
    const botSoftware = botInfo.softwareName?.toLowerCase() || '';

    // Misskey以外は除外
    if (botSoftware !== 'misskey' && botSoftware !== '') {
      console.log(`Detected non-misskey software for ${host}: ${botSoftware}`);
      await prisma.denylist.upsert({
          where: { domain: host },
          update: { reason: `Not Misskey: ${botSoftware}` },
          create: { domain: host, reason: `Not Misskey: ${botSoftware}` }
      });
      await prisma.instance.deleteMany({ where: { id: host } });
      return { info: null, error: 'UNKNOWN' };
    }
  }

  if (botInfo && browserInfo) {
    const botSoftware = botInfo.softwareName?.toLowerCase() || '';
    const browserSoftware = browserInfo.softwareName?.toLowerCase() || '';

    // JoinMisskey相手にはMisskeyを返すが、ブラウザにはそれ以外（かつEmptyでない）を返す場合
    if (
      botSoftware === 'misskey' &&
      browserSoftware !== 'misskey' &&
      browserSoftware !== ''
    ) {
      console.log(
        `Detected spoofing/fork behavior for ${host}: Bot=${botSoftware}, Browser=${browserSoftware}`
      );

      await prisma.denylist.upsert({
          where: { domain: host },
          update: { reason: `Spoofing: JoinMisskey=${botSoftware}, Browser=${browserSoftware}` },
          create: { domain: host, reason: `Spoofing: JoinMisskey=${botSoftware}, Browser=${browserSoftware}` }
      });
      await prisma.instance.deleteMany({ where: { id: host } });
      return { info: null, error: 'UNKNOWN' };
    }
  }

  // 問題なければBotの情報を返す
  return botRes;
}

export async function saveInstance(
  prisma: PrismaClient,
  id: string,
  res: InstanceResult,
  now: Date
) {
  const info = res.info;

  if (info) {
      await prisma.instance.updateMany({
          where: { id },
          data: {
              node_name: info.name,
              users_count: info.users,
              notes_count: info.notes,
              version: info.version,
              is_alive: true,
              last_check_at: now,
              banner_url: info.banner,
              icon_url: info.icon,
              suspension_state: 'none' as SuspensionState
          }
      });
  } else {
    // 410 -> gone (Permanent)
    // TIMEOUT/OTHER -> suspended (Temporary)
    const state: SuspensionState = res.error === 'GONE' ? 'gone' : 'suspended';
    await prisma.instance.updateMany({
        where: { id },
        data: {
            is_alive: false,
            last_check_at: now,
            suspension_state: state
        }
    });
  }
}

import type { PrismaClient, SuspensionState } from './prisma';

export interface InstanceInfo {
  name: string;
  users: number;
  notes: number;
  version: string;
  softwareName: string;
  banner: string | null;
  icon: string | null;
  repositoryUrl: string | null;
}

export type FetchError = 'TIMEOUT' | 'GONE' | 'UNKNOWN';

export type InstanceResult = {
  info: InstanceInfo | null;
  error?: FetchError;
};

/**
   * Fetches instance metadata by querying .well-known/nodeinfo and, if needed, the instance's /api/meta.
   *
   * @param host - The instance host (hostname, without protocol), e.g. "example.com"
   * @param userAgent - User-Agent header to send with requests
   * @returns An InstanceResult containing either:
   *          - `info`: populated instance data (`name`, `users`, `notes`, `version`, `softwareName`, `banner`, `icon`, `repositoryUrl`) when retrieval succeeds; or
   *          - `info: null` and `error`: one of `'TIMEOUT'` (network/connection failures or other fetch problems), `'GONE'` (HTTP 410 responses), or `'UNKNOWN'` (missing/unsupported nodeinfo format)
   */
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
      let repositoryUrl: string | null = null;

      // POST /api/metaを試行
      if (!banner || !icon || !name || !description || !version || !repositoryUrl) {
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
            if (meta.repositoryUrl) repositoryUrl = meta.repositoryUrl;
          }
        } catch (e: any) {
          if (e.name !== 'AbortError') {
             // ログは状況によるが、すでにfetchWithRetryなどでwarnしているのでここは静かにするか、warnするか
            console.warn(`Failed to fetch meta for ${host}:`, e.message);
          }
        }
      }
    
    // NodeInfoからrepositoryUrl取得の試行 (metadata内にある場合が多い)
    if (!repositoryUrl && metadata.repositoryUrl) {
      repositoryUrl = metadata.repositoryUrl;
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
          repositoryUrl
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
 * Validate an instance's identity and integrity, and remove it if it is not a valid Misskey instance.
 *
 * Performs checks using both a bot-like and a browser-like user agent to detect non-Misskey software, repository forks, or spoofing. When a problematic condition is detected the function records the domain in the denylist with an explanatory reason and deletes the instance record.
 *
 * @param prisma - Prisma client used to update denylist and instances
 * @param host - Instance host (domain) to validate
 * @returns An InstanceResult containing the discovered InstanceInfo on success, or `info: null` with `error` set to `TIMEOUT`, `GONE`, or `UNKNOWN` when the instance is unreachable, gone, or rejected due to validation (non-Misskey, fork, or spoofing)
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

  const FORK_PATTERNS = ['type4ny', 'firefish', 'calckey', 'foundkey', 'cherrypick', 'sharkey', 'rumisskey', 'iceshrimp', 'catodon'];

  if (botInfo) {
    const botSoftware = botInfo.softwareName?.toLowerCase() || '';
    const repoUrl = botInfo.repositoryUrl?.toLowerCase() || '';

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

    // リポジトリURLによるフォーク判定
    if (repoUrl) {
      const isFork = FORK_PATTERNS.some(pattern => repoUrl.includes(pattern));
      if (isFork) {
        console.log(`Detected fork repository for ${host}: ${repoUrl}`);
        await prisma.denylist.upsert({
            where: { domain: host },
            update: { reason: `Fork Repository: ${repoUrl}` },
            create: { domain: host, reason: `Fork Repository: ${repoUrl}` }
        });
        await prisma.instance.deleteMany({ where: { id: host } });
        return { info: null, error: 'UNKNOWN' };
      }
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

/**
 * Persist instance health and metadata into the database for the specified instance id.
 *
 * When `res.info` is present, updates the instance record with metadata (name, counts, version,
 * banner/icon URLs, repository URL), marks the instance alive, clears suspension state, and sets
 * `last_check_at` to `now`. When `res.info` is null, marks the instance not alive, sets
 * `last_check_at` to `now`, and sets `suspension_state` to `gone` if `res.error === 'GONE'` or
 * `suspended` otherwise.
 *
 * @param res - The fetched instance result containing `info` (metadata) or an `error` code
 * @param now - Timestamp to record as the last check time
 */
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
              repository_url: info.repositoryUrl,
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
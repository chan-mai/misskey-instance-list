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
  nodeinfoRepositoryUrl?: string | null;
  metaRepositoryUrl?: string | null;
  description?: string;
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
      const nodeinfoRepositoryUrl: string | null = metadata.repositoryUrl || null;
      let metaRepositoryUrl: string | null = null;

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

          // api/meta用の独立したAbortController (前の残り時間でタイムアウトしないように)
          const metaController = new AbortController();
          const metaTimeoutId = setTimeout(() => metaController.abort(), 10000);
          
          try {
            const metaRes = await fetchWithRetry(`https://${host}/api/meta`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...headers },
              body: JSON.stringify({ detail: true }),
              signal: metaController.signal,
            });

            if (metaRes.ok) {
              const meta = (await metaRes.json()) as any;
              clearTimeout(metaTimeoutId); // 成功したらタイマー解除
              
              if (meta.bannerUrl) banner = meta.bannerUrl;
              if (meta.iconUrl) icon = meta.iconUrl;
              if (meta.name) name = meta.name;
              if (meta.description) description = meta.description;
              if (meta.version) version = meta.version;
              // api/metaの情報を優先して採用する
              if (meta.repositoryUrl) {
                repositoryUrl = meta.repositoryUrl;
                metaRepositoryUrl = meta.repositoryUrl;
              }
            }
          } finally {
            clearTimeout(metaTimeoutId);
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
          repositoryUrl,
          nodeinfoRepositoryUrl,
          metaRepositoryUrl,
          description
        },
      };

    } catch {
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

  // Botでタイムアウトなら、とりあえずタイムアウトとして返す (ブラウザチェック不要)
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
    // MetaとNodeInfo両方のURLをチェックする
    const urlsToCheck = [
      repoUrl,
      botInfo.nodeinfoRepositoryUrl?.toLowerCase(),
      botInfo.metaRepositoryUrl?.toLowerCase(),
      browserInfo?.nodeinfoRepositoryUrl?.toLowerCase(),
      browserInfo?.metaRepositoryUrl?.toLowerCase()
    ].filter(Boolean) as string[];

    if (urlsToCheck.length > 0) {
      const detectedForkUrl = urlsToCheck.find(url => FORK_PATTERNS.some(pattern => url.includes(pattern)));
      if (detectedForkUrl) {
        console.log(`Detected fork repository for ${host}: ${detectedForkUrl}`);
        await prisma.denylist.upsert({
            where: { domain: host },
            update: { reason: `Fork Repository: ${detectedForkUrl}` },
            create: { domain: host, reason: `Fork Repository: ${detectedForkUrl}` }
        });
        await prisma.instance.deleteMany({ where: { id: host } });
        return { info: null, error: 'UNKNOWN' };
      }
    }
  }

  if (botInfo && browserInfo) {
    const botSoftware = botInfo.softwareName?.toLowerCase() || '';
    const browserSoftware = browserInfo.softwareName?.toLowerCase() || '';

    // JoinMisskey相手にはMisskeyを返すが、ブラウザにはそれ以外 (かつEmptyでない)を返す場合
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

// Simple in-memory cache to avoid hitting GitHub API excessively during sync
type GitHubRepository = {
    description: string | null;
    cachedAt: number;
}
const repositoryCache = new Map<string, GitHubRepository | null>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCachedRepository(name: string): GitHubRepository | null | undefined {
    const cached = repositoryCache.get(name);
    if (cached && Date.now() - cached.cachedAt > CACHE_TTL_MS) {
        repositoryCache.delete(name);
        return undefined;
    }
    return cached;
}


async function resolveRepositoryInfo(repositoryUrl: string) {
    let repositoryName: string | null = null;
    let repository: GitHubRepository | null = null;

    try {
        const urlObj = new URL(repositoryUrl);
        // GitHubのみ対応
        if (urlObj.hostname === 'github.com') {
            const pathParts = urlObj.pathname.split('/').filter(p => p);
            if (pathParts.length >= 2) {
                repositoryName = `${pathParts[0]}/${pathParts[1]}`;
                repositoryName = repositoryName.replace(/\.git$/, '');

                if (repositoryName) {
                    const cached = getCachedRepository(repositoryName);
                    if (cached !== undefined) {
                        repository = cached;
                    } else {
                        try {
                            const headers: Record<string, string> = {
                                'User-Agent': 'MisskeyInstanceList/1.0',
                            };
                            const config = useRuntimeConfig();
                            if (config.githubToken) {
                                headers['Authorization'] = `token ${config.githubToken}`;
                            }

                            const ghRes = await fetch(`https://api.github.com/repos/${repositoryName}`, { headers });

                            // レート制限の確認
                            const remaining = ghRes.headers.get('x-ratelimit-remaining');
                            const limit = ghRes.headers.get('x-ratelimit-limit');
                            const reset = ghRes.headers.get('x-ratelimit-reset');

                            if (ghRes.status === 403 || ghRes.status === 429) {
                                console.warn(`GitHub API Rate Limit Exceeded for ${repositoryName}: Status=${ghRes.status}, Remaining=${remaining}/${limit}, Reset=${reset}`);
                                // 失敗(null)としてキャッシュせず、次回再試行できるように早期リターンする
                                // ここでnullをキャッシュすると、キャッシュ有効期限切れや再起動まで説明文が失われるため
                                // repository変数の設定をスキップし、nullのままにするがキャッシュには保存しない
                            } else if (ghRes.ok) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const ghData = await ghRes.json() as any;
                                repository = {
                                    description: ghData.description || null,
                                    cachedAt: Date.now()
                                };
                                // 成功した場合のみキャッシュする
                                repositoryCache.set(repositoryName, repository);
                            } else {
                                // その他のエラー (404, 500等)
                                console.warn(`GitHub API Error for ${repositoryName}: ${ghRes.status}`);
                                // 404の場合は、繰り返しの404を防ぐためにnullをキャッシュする
                                // それ以外はスキップする
                                if (ghRes.status === 404) {
                                    repositoryCache.set(repositoryName, null);
                                }
                            }
                        } catch (e: any) {
                            console.warn(`GitHub API Fetch Error for ${repositoryName}:`, e.message);
                        }
                    }
                }
            }
        } else if (urlObj.pathname.split('/').filter(p => p).length >= 2) {
            // GitHub以外でも user/repo 形式だけ抽出しておく
            const pathParts = urlObj.pathname.split('/').filter(p => p);
            repositoryName = `${pathParts[0]}/${pathParts[1]}`;
            repositoryName = repositoryName.replace(/\.git$/, '');
        }
    } catch {
        // console.warn(`Failed to parse repository URL: ${repositoryUrl}`);
    }

    return { repositoryName, repository };
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
 * @param language - Optional language detected from instance description
 */
export async function saveInstance(
  prisma: PrismaClient,
  id: string,
  res: InstanceResult,
  now: Date,
  language?: string | null
) {
  const info = res.info;

  if (info) {
      const repoInfo = info.repositoryUrl ? await resolveRepositoryInfo(info.repositoryUrl) : null;

      const MAX_RETRIES = 3;
      let lastError: any;

      for (let i = 0; i < MAX_RETRIES; i++) {
        try {
          await prisma.$transaction(async(tx) => {
              await tx.instance.updateMany({
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
                      suspension_state: 'none' as SuspensionState,
                      language: language
                  }
              });
    
              // リポジトリのリレーションを更新 (connectOrCreate/upsertロジックを使用)
              if (info.repositoryUrl && repoInfo) {
                  const { repositoryName, repository } = repoInfo;
    
                  await tx.repository.upsert({
                      where: { url: info.repositoryUrl },
                      update: {
                          ...(repositoryName ? { name: repositoryName } : {}),
                          ...(repository?.description ? { description: repository.description } : {})
                      },
                      create: { 
                          url: info.repositoryUrl,
                          name: repositoryName,
                          description: repository?.description || null
                      }
                  });
    
                  await tx.instance.updateMany({
                      where: { id },
                      data: {
                          repository_url: info.repositoryUrl
                      }
                  });
              } else {
                  // repositoryUrlがnullの場合、リレーションを解除する (nullを設定)
                  await tx.instance.updateMany({
                      where: { id },
                      data: {
                          repository_url: null
                      }
                  });
              }
          });
          
          // トランザクション成功ならループを抜ける
          return;
        } catch (e: any) {
          lastError = e;
          // P2034 (Write conflict) の場合のみリトライ
          if (e.code === 'P2034' && i < MAX_RETRIES - 1) {
            // 指数バックオフ + ランダムジッター (50ms ~ 200ms程度)
            const delay = Math.random() * (50 * Math.pow(2, i)); 
            await new Promise(r => setTimeout(r, 50 + delay));
            continue;
          }
          // その他のエラー、またはリトライ上限の場合はthrow
          throw e;
        }
      }
      
      // ここに来ることは基本ないが、念のため
      if (lastError) throw lastError;
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

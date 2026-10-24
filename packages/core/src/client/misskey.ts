import type { IpStack } from '../entity/schema.js';

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
  openRegistrations?: boolean | null;
  emailRequired?: boolean | null;
  ipStack?: IpStack | null;
}

// TIMEOUT: 接続失敗・410以外の非2xx, GONE: HTTP 410, UNKNOWN: 形式不正
export type FetchError = 'TIMEOUT' | 'GONE' | 'UNKNOWN';

export type InstanceResult = {
  info: InstanceInfo | null;
  error?: FetchError;
};

// nodeinfo, api/stats, api/metaからインスタンス情報取得
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
        const isAbort =
          e.name === 'AbortError' || e.message?.includes('aborted');
        // タイムアウトまたはネットワークエラーなら再試行
        if (isAbort || e.name === 'FetchError' || e.code === 'ECONNRESET') {
          // 少し待つ
          await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
          continue;
        }
      }
      // 再試行しないエラー、または再試行上限
      if (i === RETRY_LIMIT - 1) {
        console.warn(
          `Failed to fetch nodeinfo for ${host} (Attempt ${
            i + 1
          }/${RETRY_LIMIT}):`,
          e.message
        );
      }
      return { info: null, error: 'TIMEOUT' };
    }
  }

  if (!wkRes || !wkRes.ok) {
    if (wkRes && wkRes.status === 410) return { info: null, error: 'GONE' };
    // 404等はよくあるので単なる失敗扱い
    return { info: null, error: 'TIMEOUT' }; // TIMEOUTというか接続不可全般
  }

  let wkJson: any;
  try {
    wkJson = await wkRes.json();
  } catch {
    return { info: null, error: 'UNKNOWN' };
  }
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

    let ni: any;
    try {
      ni = await niRes.json();
    } catch {
      console.warn(`Failed to parse nodeinfo for ${host}: Invalid JSON`);
      return { info: null, error: 'UNKNOWN' };
    }

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
    let openRegistrations: boolean | null = null;
    let emailRequired: boolean | null = null;

    if (typeof ni.openRegistrations === 'boolean') {
      openRegistrations = ni.openRegistrations;
    }

    if (metadata && typeof metadata.emailRequiredForSignup === 'boolean') {
      emailRequired = metadata.emailRequiredForSignup;
    }

    // 正確なユーザー数を取得するために /api/stats を取得
    try {
        const statsController = new AbortController();
        const statsTimeoutId = setTimeout(() => statsController.abort(), 5000);
        const statsRes = await fetch(`https://${host}/api/stats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers },
            body: JSON.stringify({}),
            signal: statsController.signal,
        });
        clearTimeout(statsTimeoutId);

        if (statsRes.ok) {
            const stats = (await statsRes.json()) as {
                usersCount?: number;
                originalUsersCount?: number;
                notesCount?: number;
                originalNotesCount?: number;
            };

            // ユーザー数: originalUsersCount (ローカル) > usersCount (連合含む)
            if (typeof stats.originalUsersCount === 'number') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (users as any).total = stats.originalUsersCount;
            } else if (typeof stats.usersCount === 'number') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (users as any).total = stats.usersCount;
            }

            // ノート数: originalNotesCount > notesCount
            if (typeof stats.originalNotesCount === 'number') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (usage as any).localPosts = stats.originalNotesCount;
            } else if (typeof stats.notesCount === 'number') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (usage as any).localPosts = stats.notesCount;
            }
        }
    } catch {
        // statsの取得失敗は無視し、nodeinfoの情報を使用する
    }

    // POST /api/metaを試行
    if (
      !banner ||
      !icon ||
      !name ||
      !description ||
      !version ||
      !repositoryUrl
    ) {
      try {
        // api/meta用のリトライロジック(接続エラーのみ)
        const fetchWithRetry = async(
          url: string,
          options: RequestInit,
          retries = 3
        ) => {
          for (let i = 0; i < retries; i++) {
            if (options.signal?.aborted) throw new Error('Aborted');
            try {
              const res = await fetch(url, options);
              if (res.ok) return res;
              if (res.status >= 500 && i < retries - 1) continue;
              return res;
            } catch (e: any) {
              if (
                i === retries - 1 ||
                options.signal?.aborted ||
                e.name === 'AbortError'
              )
                throw e;
              await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
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
            try {
              const meta = await metaRes.json();
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

              if (typeof meta.disableRegistration === 'boolean') {
                openRegistrations = !meta.disableRegistration;
              }
              if (typeof meta.emailRequiredForSignup === 'boolean') {
                emailRequired = meta.emailRequiredForSignup;
              }
            } catch {
              console.warn(`Failed to parse api/meta for ${host}: Invalid JSON`);
              // JSONパースエラー時は何もせず続行
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
        description,
        openRegistrations,
        emailRequired,
      },
    };
  } catch {
    // ネットワークエラー、タイムアウト等
    return { info: null, error: 'TIMEOUT' };
  } finally {
    clearTimeout(id);
  }
}

// 言語判定用, 10文字以上の本文のみ
export async function fetchLocalTimeline(
  host: string,
  limit = 10
): Promise<string[]> {
  const TIMEOUT_MS = 10000;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(`https://${host}/api/notes/local-timeline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MisskeyInstanceList/0.1.0',
      },
      body: JSON.stringify({ limit }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) return [];

    const notes = (await res.json()) as { text?: string | null }[];
    return notes
      .map((note) => note.text)
      .filter((text): text is string => !!text && text.length >= 10);
  } catch {
    return [];
  }
}

const FEDERATION_PAGE_LIMIT = 30;
const FEDERATION_MAX_ITEMS = 250;
const FEDERATION_TIMEOUT_MS = 10_000;

// 重複除去済み
export async function fetchFederatedHosts(source: string): Promise<string[]> {
  const found: string[] = [];

  for (let offset = 0; offset < FEDERATION_MAX_ITEMS; offset += FEDERATION_PAGE_LIMIT) {
    const res = await fetch(`https://${source}/api/federation/instances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MisskeyInstanceList/0.1.0',
      },
      body: JSON.stringify({ limit: FEDERATION_PAGE_LIMIT, offset, sort: '+pubSub' }),
      signal: AbortSignal.timeout(FEDERATION_TIMEOUT_MS),
    });

    if (!res.ok) break;

    const list = await res.json();
    if (!Array.isArray(list) || list.length === 0) break;

    for (const item of list as { host?: unknown }[]) {
      if (typeof item.host === 'string' && item.host.includes('.')) {
        found.push(item.host);
      }
    }

    if (list.length < FEDERATION_PAGE_LIMIT) break;
  }

  return [...new Set(found)];
}

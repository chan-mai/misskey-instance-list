import { isPubliclyResolvable } from '@mil/core/net';

/** checkEmbeddable全体の上限, fetch個別のタイムアウト積み上げを防ぐ */
const TOTAL_TIMEOUT = 8000;

/** リダイレクトのfollow上限 */
const MAX_REDIRECTS = 5;

/** ユーザーID解決が全て失敗した場合の代替, フレーム制限ヘッダは/embed/*のプレフィックスで決まるため判定は成立する */
const PLACEHOLDER_USER_ID = 'unknown';

const USER_AGENT = 'MisskeyInstanceList/1.0 (EmbedCheck)';

/**
 * インスタンスの埋め込み(iframe)可否を判定する
 *
 * Misskeyは未知のパスにもSPAを200で返すため到達性では判別できない。
 * /embed/*のレスポンスからX-Frame-OptionsとCSP frame-ancestorsを読んで判定する
 */
export async function checkEmbeddable(domain: string): Promise<boolean> {
  // SSRF対策
  if (!await isPubliclyResolvable(domain)) {
    console.warn(`Blocked access to unsafe or unresolvable host: ${domain}`);
    return false;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TOTAL_TIMEOUT);

  try {
    const userId = await resolveEmbedUserId(domain, controller.signal);
    const res = await fetchEmbedPage(`https://${domain}/embed/user-timeline/${userId}`, domain, controller.signal);
    if (!res) return false;
    return !isFrameBlocked(res.headers);
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 埋め込み確認用のユーザーIDを解決する
 *
 * instance.actorはインスタンスによってusers/showで引けず(NO_SUCH_USER), これ単独では誤判定になる。
 * ローカルユーザー取得へフォールバックし, 双方失敗時もプレースホルダで判定を続行する
 */
async function resolveEmbedUserId(domain: string, signal: AbortSignal): Promise<string> {
  const systemActor = await fetchUserId(domain, 'users/show', { username: 'instance.actor' }, signal);
  if (systemActor) return systemActor;

  const localUser = await fetchUserId(domain, 'users', { limit: 1, origin: 'local' }, signal);
  if (localUser) return localUser;

  return PLACEHOLDER_USER_ID;
}

/** Misskey APIを叩いてユーザーIDを1件取り出す, レスポンスは単体/配列いずれも受ける */
async function fetchUserId(
  domain: string,
  endpoint: string,
  body: Record<string, unknown>,
  signal: AbortSignal,
): Promise<string | null> {
  try {
    const res = await fetch(`https://${domain}/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': USER_AGENT,
      },
      body: JSON.stringify(body),
      signal,
    });

    if (res.status !== 200) return null;

    const data = await res.json();
    const user = Array.isArray(data) ? data[0] : data;
    return user && typeof user.id === 'string' ? user.id : null;
  } catch {
    return null;
  }
}

/**
 * 埋め込みページを取得する, 2xxに辿り着けなければnull
 *
 * ヘッダを読む必要があるためHEADは使わない(プロキシがHEADで異なるヘッダを返しうる)
 */
async function fetchEmbedPage(
  url: string,
  domain: string,
  signal: AbortSignal,
  redirectCount = 0,
): Promise<Response | null> {
  if (redirectCount >= MAX_REDIRECTS) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  // リダイレクト先が別ホストへ逃げるのを防ぐため, 同一ドメインを強制
  if (parsed.hostname !== domain) return null;

  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      signal,
      headers: { 'User-Agent': USER_AGENT },
    });

    if (res.status >= 200 && res.status < 300) return res;

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) return null;
      // 相対URLを解決
      const nextUrl = new URL(location, url).toString();
      return fetchEmbedPage(nextUrl, domain, signal, redirectCount + 1);
    }

    return null;
  } catch {
    return null;
  }
}

/** フレーム埋め込みが制限されているか, X-Frame-OptionsとCSP frame-ancestorsを見る */
function isFrameBlocked(headers: Headers): boolean {
  const xfo = headers.get('x-frame-options')?.trim().toLowerCase();
  // sameoriginもクロスオリジンiframeは拒否されるため制限扱い
  if (xfo && (xfo === 'deny' || xfo.startsWith('sameorigin') || xfo.startsWith('allow-from'))) {
    return true;
  }

  // report-onlyは強制力がないため見ない
  const csp = headers.get('content-security-policy');
  if (!csp) return false;

  // 同名ヘッダ複数はget()が","で連結する, ポリシー区切りとディレクティブ区切りの両方で分解する
  for (const directive of csp.split(/[,;]/)) {
    const tokens = directive.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens[0] !== 'frame-ancestors') continue;

    const sources = tokens.slice(1);
    // 任意オリジンを許すソースがなければ制限扱い
    if (!sources.some(s => s === '*' || s === 'https:' || s === 'http:')) return true;
  }

  return false;
}

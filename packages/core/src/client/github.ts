// Simple in-memory cache to avoid hitting GitHub API excessively during sync
type GitHubRepository = {
  description: string | null;
  cachedAt: number;
  notFound?: boolean; // 404エラーの場合はtrue
};
const repositoryCache = new Map<string, GitHubRepository>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCachedRepository(
  name: string
): GitHubRepository | undefined {
  const cached = repositoryCache.get(name);
  if (cached && Date.now() - cached.cachedAt > CACHE_TTL_MS) {
    repositoryCache.delete(name);
    return undefined;
  }
  return cached;
}

export async function resolveRepositoryInfo(repositoryUrl: string, githubToken?: string) {
  let repositoryName: string | null = null;
  let repository: GitHubRepository | null = null;

  try {
    const urlObj = new URL(repositoryUrl);
    // GitHubのみ対応
    if (urlObj.hostname === 'github.com') {
      const pathParts = urlObj.pathname.split('/').filter((p) => p);
      if (pathParts.length >= 2) {
        repositoryName = `${pathParts[0]}/${pathParts[1]}`;
        repositoryName = repositoryName.replace(/\.git$/, '');

        if (repositoryName) {
          const cached = getCachedRepository(repositoryName);
          if (cached !== undefined) {
            // notFoundフラグがある場合はnullとして扱う
            repository = cached.notFound ? null : cached;
          } else {
            try {
              const headers: Record<string, string> = {
                'User-Agent': 'MisskeyInstanceList/1.0',
              };
              if (githubToken) {
                headers['Authorization'] = `token ${githubToken}`;
              }

              const ghRes = await fetch(
                `https://api.github.com/repos/${repositoryName}`,
                { headers }
              );

              // レート制限の確認
              const remaining = ghRes.headers.get('x-ratelimit-remaining');
              const limit = ghRes.headers.get('x-ratelimit-limit');
              const reset = ghRes.headers.get('x-ratelimit-reset');

              if (ghRes.status === 403 || ghRes.status === 429) {
                console.warn(
                  `GitHub API Rate Limit Exceeded for ${repositoryName}: Status=${ghRes.status}, Remaining=${remaining}/${limit}, Reset=${reset}`
                );
                // 失敗(null)としてキャッシュせず、次回再試行できるように早期リターンする
                // ここでnullをキャッシュすると、キャッシュ有効期限切れや再起動まで説明文が失われるため
                // repository変数の設定をスキップし、nullのままにするがキャッシュには保存しない
              } else if (ghRes.ok) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const ghData = (await ghRes.json()) as any;
                repository = {
                  description: ghData.description || null,
                  cachedAt: Date.now(),
                };
                // 成功した場合のみキャッシュする
                repositoryCache.set(repositoryName, repository);
              } else {
                // その他のエラー (404, 500等)
                console.warn(
                  `GitHub API Error for ${repositoryName}: ${ghRes.status}`
                );
                // 404の場合は、繰り返しの404を防ぐためにキャッシュする
                // それ以外はスキップする
                if (ghRes.status === 404) {
                  repositoryCache.set(repositoryName, {
                    description: null,
                    cachedAt: Date.now(),
                    notFound: true,
                  });
                }
              }
            } catch (e: any) {
              console.warn(
                `GitHub API Fetch Error for ${repositoryName}:`,
                e.message
              );
            }
          }
        }
      }
    } else if (urlObj.pathname.split('/').filter((p) => p).length >= 2) {
      // GitHub以外でも user/repo 形式だけ抽出しておく
      const pathParts = urlObj.pathname.split('/').filter((p) => p);
      repositoryName = `${pathParts[0]}/${pathParts[1]}`;
      repositoryName = repositoryName.replace(/\.git$/, '');
    }
  } catch {
    console.warn(`Failed to parse repository URL: ${repositoryUrl}`);
  }

  return { repositoryName, repository };
}

// releases/latestのリダイレクト先URLからタグ取得, REST APIのレート制限回避
export async function fetchLatestReleaseTag(repositoryUrl: string): Promise<string | null> {
  try {
    const res = await fetch(`${repositoryUrl}/releases/latest`, {
      redirect: 'manual',
      headers: { 'User-Agent': 'MisskeyInstanceList/1.0' },
    });
    const location = res.headers.get('location');
    const tag = location?.match(/\/releases\/tag\/([^/?#]+)$/)?.[1];
    if (!tag) {
      console.warn(`Failed to resolve latest release tag: status=${res.status}`);
      return null;
    }
    return decodeURIComponent(tag);
  } catch (e) {
    console.error('Failed to fetch latest version:', e);
    return null;
  }
}

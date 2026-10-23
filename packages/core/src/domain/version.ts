import { fetchLatestReleaseTag } from '../client/github.js';
import { listAliveVersionsByRepository } from '../repository/instances.js';
import type { Database } from '../db/index.js';

export const OFFICIAL_REPOSITORY_URL = 'https://github.com/misskey-dev/misskey';
// 安定版のみ (プレリリース接尾辞なし)
const RELEASE_VERSION_PATTERN = /^\d{4}\.\d{1,2}\.\d+$/;

/**
 * バージョン文字列から年月を抽出して月単位の数値に変換する
 * CalVer (YYYY.MM.Patch) を想定
 * 戻り値: (Year * 12) + Month
 */
export function parseVersionToMonths(version: string): number | null {
  // v2025.12.0 や 2025.12.0-fork などの形式に対応
  // 先頭の 'v' はあってもなくても良い
  const match = version.match(/^v?(\d{4})\.(\d{1,2})\.\d+/);
  if (!match) return null;

  const year = parseInt(match[1]!, 10);
  const month = parseInt(match[2]!, 10);
  return (year * 12) + month;
}

// 公式リポジトリの最新リリース, 取得失敗時はDB上の稼働中インスタンスの最大CalVer
export async function resolveLatestStableVersion(db: Database): Promise<string | null> {
  return (await fetchLatestReleaseTag(OFFICIAL_REPOSITORY_URL)) ?? (await findLatestVersionFromDb(db));
}

async function findLatestVersionFromDb(db: Database): Promise<string | null> {
  const versions = await listAliveVersionsByRepository(db, OFFICIAL_REPOSITORY_URL);

  let latest: { version: string; months: number } | null = null;
  for (const version of versions) {
    if (!version || !RELEASE_VERSION_PATTERN.test(version)) continue;
    const months = parseVersionToMonths(version);
    if (months !== null && (latest === null || months > latest.months)) {
      latest = { version, months };
    }
  }
  if (latest !== null) {
    console.warn(`Using latest version from database: ${latest.version}`);
  }
  return latest?.version ?? null;
}

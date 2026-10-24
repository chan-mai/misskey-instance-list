import { fetchLatestReleaseTag } from '../client/github.js';
import { listAliveVersionsByRepository } from '../repository/instances.js';
import type { Database } from '../db/index.js';
import { parseVersionToMonths } from './score.js';

export const OFFICIAL_REPOSITORY_URL = 'https://github.com/misskey-dev/misskey';
// 安定版のみ (プレリリース接尾辞なし)
const RELEASE_VERSION_PATTERN = /^\d{4}\.\d{1,2}\.\d+$/;

// 取得失敗時はDB上の公式版最大CalVer
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

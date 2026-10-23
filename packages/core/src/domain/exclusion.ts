import { fetchIgnoredHosts } from '../client/joinmisskey.js';
import { deleteInstance, deleteInstances } from '../repository/instances.js';
import {
  deleteExclusionsBySource,
  insertExclusion,
  insertExclusionsIgnoringConflict,
  listExcludedDomains,
  listExcludedDomainsBySource,
} from '../repository/excluded-hosts.js';
import type { ExcludedHostInsert } from '../entity/schema.js';
import type { Database } from '../db/index.js';

// 登録済みならundefined, 登録時は既存インスタンスも削除
export async function addExclusion(db: Database, values: ExcludedHostInsert) {
  const exclusion = await insertExclusion(db, values);
  if (!exclusion) return undefined;

  await deleteInstance(db, values.domain);
  return exclusion;
}

/**
 * ignorehosts.ymlと除外リストの差分
 *
 * @param upstream ignorehosts.ymlのドメイン
 * @param existing 全sourceの除外ドメイン(manual/system上書き防止用)
 * @param joinmisskey source=joinmisskeyの除外ドメイン
 */
export function diffIgnoredHosts(
  upstream: readonly string[],
  existing: readonly string[],
  joinmisskey: readonly string[],
): { additions: string[]; deletions: string[] } {
  const upstreamSet = new Set(upstream);
  const existingSet = new Set(existing);
  return {
    additions: upstream.filter((d) => !existingSet.has(d)),
    deletions: joinmisskey.filter((d) => !upstreamSet.has(d)),
  };
}

// JoinMisskeyのignorehosts.ymlと除外リストを突き合わせ
export async function syncJoinMisskeyExclusions(
  db: Database,
): Promise<{ additions: number; deletions: number }> {
  const upstream = await fetchIgnoredHosts();
  const joinmisskey = await listExcludedDomainsBySource(db, 'joinmisskey');
  const existing = await listExcludedDomains(db);

  const { additions, deletions } = diffIgnoredHosts(upstream, existing, joinmisskey);

  console.log(`Syncing exclusions: ${additions.length} additions, ${deletions.length} deletions`);

  if (deletions.length > 0) {
    await deleteExclusionsBySource(db, deletions, 'joinmisskey');
  }

  if (additions.length > 0) {
    await insertExclusionsIgnoringConflict(db, additions.map((domain) => ({
      domain,
      reason: 'JoinMisskey: ignorehosts.yml',
      source: 'joinmisskey' as const,
    })));

    // 新規追加分のみ削除
    await deleteInstances(db, additions);
  }

  return { additions: additions.length, deletions: deletions.length };
}

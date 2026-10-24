import { ExcludedHostSource, type ExcludedHostInsert } from '../entity/schema.js';
import { fetchIgnoredHosts } from '../client/joinmisskey.js';
import { deleteInstance, deleteInstances } from '../repository/instances.js';
import {
  deleteExclusionsBySource,
  insertExclusion,
  insertExclusionsIgnoringConflict,
  listExcludedDomains,
  upsertSystemExclusion,
} from '../repository/excluded-hosts.js';
import type { Database } from '../db/index.js';

// 登録済みならundefined
export async function addExclusion(db: Database, values: ExcludedHostInsert) {
  const exclusion = await insertExclusion(db, values);
  if (!exclusion) return undefined;

  await deleteInstance(db, values.domain);
  return exclusion;
}

export async function excludeRejectedHost(db: Database, domain: string, reason: string): Promise<void> {
  await db.batch([upsertSystemExclusion(db, domain, reason), deleteInstance(db, domain)]);
}

// 追加は全source既存分を除外, 削除はjoinmisskey由来のみ
function diffIgnoredHosts(
  upstreamDomains: readonly string[],
  excludedDomains: readonly string[],
  joinmisskeyDomains: readonly string[],
): { additions: string[]; deletions: string[] } {
  const upstreamSet = new Set(upstreamDomains);
  const excludedSet = new Set(excludedDomains);
  return {
    additions: upstreamDomains.filter((d) => !excludedSet.has(d)),
    deletions: joinmisskeyDomains.filter((d) => !upstreamSet.has(d)),
  };
}

// JoinMisskeyのignorehosts.ymlと除外リストを突き合わせ
export async function syncJoinMisskeyExclusions(
  db: Database,
): Promise<{ additions: number; deletions: number }> {
  const upstreamDomains = await fetchIgnoredHosts();
  const joinmisskeyDomains = await listExcludedDomains(db, ExcludedHostSource.joinmisskey);
  const excludedDomains = await listExcludedDomains(db);

  const { additions, deletions } = diffIgnoredHosts(upstreamDomains, excludedDomains, joinmisskeyDomains);

  console.log(`Syncing exclusions: ${additions.length} additions, ${deletions.length} deletions`);

  if (deletions.length > 0) {
    await deleteExclusionsBySource(db, deletions, ExcludedHostSource.joinmisskey);
  }

  if (additions.length > 0) {
    await insertExclusionsIgnoringConflict(db, additions.map((domain) => ({
      domain,
      reason: 'JoinMisskey: ignorehosts.yml',
      source: ExcludedHostSource.joinmisskey,
    })));

    // 新規追加分のみ削除
    await deleteInstances(db, additions);
  }

  return { additions: additions.length, deletions: deletions.length };
}

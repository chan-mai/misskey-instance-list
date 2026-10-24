import { fetchFederatedHosts } from '../client/misskey.js';
import { fetchListedHosts } from '../client/joinmisskey.js';
import { insertInstanceIds, sampleAliveInstanceIds } from '../repository/instances.js';
import { listExcludedDomains } from '../repository/excluded-hosts.js';
import type { Database } from '../db/index.js';
import type { CrawlContext } from './context.js';
import { validateInstance } from './crawl.js';

// 稼働中インスタンスの連合先から候補登録, 全ソース失敗時のみthrow
export async function discoverInstances(
  ctx: CrawlContext,
  sampleSize: number,
): Promise<{ sources: string[]; discovered: number }> {
  const excludedSet = new Set(await listExcludedDomains(ctx.db));

  const sources = await sampleAliveInstanceIds(ctx.db, sampleSize);
  if (sources.length === 0) {
    return { sources: [], discovered: 0 };
  }

  console.log(`Starting discovery from: ${sources.join(', ')}`);

  const results = await Promise.all(sources.map(async(source) => {
    try {
      const res = await validateInstance(ctx, source);
      if (!res.info) {
        console.log(`Skipping discovery from ${source} as it failed validation (${res.error})`);
        return 0;
      }

      const hosts = (await fetchFederatedHosts(source)).filter((host) => !excludedSet.has(host));
      if (hosts.length === 0) return 0;

      await insertInstanceIds(ctx.db, hosts);

      console.log(`Discovered from ${source}: found ${hosts.length} candidates`);
      return hosts.length;
    } catch (e) {
      console.error(`Discovery failed for ${source}`, e);
      return null;
    }
  }));

  const succeeded = results.filter((r): r is number => r !== null);
  if (succeeded.length === 0) {
    throw new Error(`Discovery failed for all ${sources.length} sources`);
  }

  return { sources, discovered: succeeded.reduce((a, b) => a + b, 0) };
}

// joinmisskeyのリストは1000件超, アプリ最大の書き込み
export async function seedInstances(db: Database): Promise<number> {
  const hosts = await fetchListedHosts();
  await insertInstanceIds(db, hosts);
  return hosts.length;
}

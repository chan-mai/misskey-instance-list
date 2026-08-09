import { Performer } from 'tsumugi/performer';
import { sql, eq } from 'drizzle-orm';
import { createDb, instances, excludedHosts, chunkForD1 } from '@mil/core/db';
import { validateInstance } from '@mil/core/crawl';
import { buildCrawlContext } from '../crawl-context.js';
import type { Env } from '../env.js';

const DEFAULT_SAMPLE_SIZE = 5;
const PAGE_LIMIT = 30;
const MAX_ITEMS = 250;
const FETCH_TIMEOUT_MS = 10_000;

export interface DiscoverInstancesPayload {
  sampleSize?: number;
}

export interface DiscoverInstancesResult {
  sources: string[];
  discovered: number;
}

// 個別ソースの失敗は握り潰し, 全滅した場合のみthrow
export class DiscoverInstances extends Performer<
  DiscoverInstancesPayload,
  DiscoverInstancesResult,
  object,
  Env
> {
  async perform({ sampleSize = DEFAULT_SAMPLE_SIZE }: DiscoverInstancesPayload): Promise<DiscoverInstancesResult> {
    const ctx = buildCrawlContext(this.env);
    const db = createDb(this.env.DB);

    const excludedList = await db.select({ domain: excludedHosts.domain }).from(excludedHosts);
    const excludedSet = new Set(excludedList.map((r) => r.domain));

    const actives = await db
      .select({ id: instances.id })
      .from(instances)
      .where(eq(instances.is_alive, true))
      .orderBy(sql`random()`)
      .limit(sampleSize);

    if (actives.length === 0) {
      return { sources: [], discovered: 0 };
    }

    const sources = actives.map((row) => row.id);
    console.log(`Starting discovery from: ${sources.join(', ')}`);

    const results = await Promise.all(sources.map(async(source) => {
      try {
        const res = await validateInstance(ctx, source);
        if (!res.info) {
          console.log(`Skipping discovery from ${source} as it failed validation (${res.error})`);
          return 0;
        }

        const hosts = await collectFederatedHosts(source, excludedSet);
        if (hosts.length === 0) return 0;

        // id + default付き4列で1行5パラメータ
        for (const chunk of chunkForD1(hosts, 5)) {
          await db
            .insert(instances)
            .values(chunk.map((host) => ({ id: host })))
            .onConflictDoNothing();
        }

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
}

async function collectFederatedHosts(source: string, excludedSet: ReadonlySet<string>): Promise<string[]> {
  const found: string[] = [];

  for (let offset = 0; offset < MAX_ITEMS; offset += PAGE_LIMIT) {
    const res = await fetch(`https://${source}/api/federation/instances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MisskeyInstanceList/0.1.0',
      },
      body: JSON.stringify({ limit: PAGE_LIMIT, offset, sort: '+pubSub' }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!res.ok) break;

    const list = await res.json();
    if (!Array.isArray(list) || list.length === 0) break;

    for (const item of list as { host?: unknown }[]) {
      if (typeof item.host === 'string' && item.host.includes('.') && !excludedSet.has(item.host)) {
        found.push(item.host);
      }
    }

    if (list.length < PAGE_LIMIT) break;
  }

  return [...new Set(found)];
}

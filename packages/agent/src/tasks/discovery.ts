import { sql, eq } from 'drizzle-orm';
import { instances, excludedHosts, chunkForD1 } from '@mil/core/db';
import { validateInstance } from '@mil/core/crawl';
import { defineTask } from './define.js';

/**
 * タスク: discovery
 * 説明: 既知のインスタンスから新しいMisskeyインスタンスを発見する
 * 冪等性: 冪等安全にリトライ可能存在しないインスタンスのみを追加します
 */
export default defineTask({
  meta: {
    name: 'discovery',
    description: 'Discover new Misskey instances from known instances'
  },
  async run(ctx) {
    const excludedList = await ctx.db
      .select({ domain: excludedHosts.domain })
      .from(excludedHosts);
    const excludedSet = new Set(excludedList.map(r => r.domain));

    const actives = await ctx.db
      .select({ id: instances.id })
      .from(instances)
      .where(eq(instances.is_alive, true))
      .orderBy(sql`random()`)
      .limit(5);

    if (!actives || actives.length === 0) {
      return { result: 'No active instances' };
    }

    console.log(`Starting discovery from: ${actives.map(r => r.id).join(', ')}`);

    let totalDiscovered = 0;

    await Promise.all(actives.map(async(row) => {
      try {
        const res = await validateInstance(ctx, row.id);
        if (!res.info) {
          console.log(`Skipping discovery from ${row.id} as it failed validation (${res.error})`);
          return;
        }

        const newHosts: string[] = [];
        let offset = 0;
        const limit = 30;
        const maxItems = 250;

        while (offset < maxItems) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const res = await fetch(`https://${row.id}/api/federation/instances`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'MisskeyInstanceList/0.1.0'
            },
            body: JSON.stringify({
              limit,
              offset,
              sort: '+pubSub'
            }),
            signal: controller.signal
          }).finally(() => clearTimeout(timeoutId));

          if (!res.ok) break;

          const list = await res.json() as any[];
          if (!Array.isArray(list) || list.length === 0) break;

          for (const item of list) {
            if (typeof item.host === 'string' && item.host.includes('.')) {
              if (!excludedSet.has(item.host)) {
                newHosts.push(item.host);
              }
            }
          }

          if (list.length < limit) break;
          offset += limit;
        }

        if (newHosts.length === 0) return;

        const uniqueHosts = [...new Set(newHosts)];

        // D1のバインドパラメータ上限(100)に収まるよう分割する
        for (const chunk of chunkForD1(uniqueHosts, 1)) {
          await ctx.db
            .insert(instances)
            .values(chunk.map(host => ({ id: host })))
            .onConflictDoNothing();
        }


        totalDiscovered += uniqueHosts.length;
        console.log(`Discovered from ${row.id}: found ${uniqueHosts.length} candidates`);

      } catch (e) {
        console.error(`Discovery failed for ${row.id}`, e);
      }
    }));

    return { result: `Discovered ${totalDiscovered} new hosts` };
  }
});

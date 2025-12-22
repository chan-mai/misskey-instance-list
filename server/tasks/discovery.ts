import { prisma } from '../utils/prisma';
import { validateInstance } from '../utils/misskey';

export default defineTask({
  meta: {
    name: 'discovery',
    description: 'Discover new Misskey instances from known instances'
  },
  async run() {
    const denyList = await prisma.denylist.findMany({ select: { domain: true } });
    const ignoreList = await prisma.ignoreHost.findMany({ select: { domain: true } });
    const denySet = new Set([...denyList, ...ignoreList].map(r => r.domain));

    const actives = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM instances WHERE is_alive = true ORDER BY RANDOM() LIMIT 5
    `;

    if (!actives || actives.length === 0) {
      return { result: 'No active instances' };
    }

    console.log(`Starting discovery from: ${actives.map((r: { id: string }) => r.id).join(', ')}`);

    let totalDiscovered = 0;

    await Promise.all(actives.map(async(row: { id: string }) => {
      try {
        const res = await validateInstance(prisma, row.id);
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
              if (!denySet.has(item.host)) {
                newHosts.push(item.host);
              }
            }
          }

          if (list.length < limit) break; 
          offset += limit;
        }

        if (newHosts.length === 0) return;

        const uniqueHosts = [...new Set(newHosts)];

        const data = uniqueHosts.map(host => ({ id: host }));
        await prisma.instance.createMany({
          data,
          skipDuplicates: true
        });
        
        totalDiscovered += uniqueHosts.length;
        console.log(`Discovered from ${row.id}: found ${uniqueHosts.length} candidates`);

      } catch (e) {
        console.error(`Discovery failed for ${row.id}`, e);
      }
    }));

    return { result: `Discovered ${totalDiscovered} new hosts` };
  }
});

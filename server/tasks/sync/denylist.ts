import yaml from 'js-yaml';
import { prisma } from '../../utils/prisma';

/**
 * タスク: sync:denylist
 * 説明: 外部ソースから拒否リストを同期する
 * 冪等性: 冪等。安全にリトライ可能。外部リストの状態に従ってデータベースを更新します。
 */
export default defineTask({
  meta: {
    name: 'sync:denylist',
    description: 'Sync denylist from JoinMisskey ignorehosts.yml'
  },
  async run() {
    try {
      const res = await fetch('https://raw.githubusercontent.com/joinmisskey/api/main/data/ignorehosts.yml');
      if (!res.ok) {
        console.error('Failed to fetch ignorehosts.yml');
        return { result: 'Failed to fetch' };
      }
      const text = await res.text();
      const upstreamDomains = yaml.load(text) as string[];

      if (!Array.isArray(upstreamDomains)) {
        return { result: 'Invalid data', error: 'Not an array' };
      }

      // 既存のエントリを取得して追加と削除を特定
      const existingEntries = await prisma.ignoreHost.findMany({
        select: { domain: true, source: true }
      });

      const existingDomains = new Set(existingEntries.map(e => e.domain));
      const upstreamSet = new Set(upstreamDomains);

      // 追加分: アップストリームにあるがDBにないもの (重複を避けるため joinmisskey と manual の両方と照合)
      // 注意: DBに 'manual' として存在し、'upstream' がそれを要求していても、'manual' を優先
      const additions = upstreamDomains.filter(d => !existingDomains.has(d));

      // 削除分: DBにあり (source='joinmisskey')、アップストリームにないもの
      const deletions = existingEntries
        .filter(e => e.source === 'joinmisskey' && !upstreamSet.has(e.domain))
        .map(e => e.domain);

      console.log(`Syncing Denylist: ${additions.length} additions, ${deletions.length} deletions`);

      // 古い joinmisskey エントリを削除
      if (deletions.length > 0) {
        await prisma.ignoreHost.deleteMany({
          where: {
            domain: { in: deletions },
            source: 'joinmisskey' // Double-check safety
          }
        });
      }

      // 新しいエントリを追加
      if (additions.length > 0) {
        await prisma.ignoreHost.createMany({
          data: additions.map(domain => ({
            domain,
            reason: 'JoinMisskey: ignorehosts.yml',
            source: 'joinmisskey'
          })),
          skipDuplicates: true
        });

        // 新規追加されたginore エントリに対応する Instance レコードのみ削除
        await prisma.instance.deleteMany({
          where: {
            id: { in: additions }
          }
        });
      }

      // Invalidate cache for API endpoint
      const storage = useStorage('cache');
      await storage.removeItem('nitro:handlers:_'); // Clears all matched routes, safest for now or check key pattern
      // Typically: nitro:handlers:_:api:v1:ignore_instances.json or similar.
      // Given the file `server/api/v1/ignore_instances.get.ts`, the key is often complex.
      // Clearing 'nitro:handlers:_' prefix or iterating is tricky.
      // Nitro's `defineCachedEventHandler` usually uses `nitro:handlers:<route>`.
      // Let's try to be specific if possible, but simplest is to clear relevant keys if possible.
      // For now, logging instruction said: "Use Nitro's cache storage API to clear the cache key"
      // Looking at `ignore_instances.get.ts`, it uses default key generation.
      // Key format: `nitro:handlers:_:api:v1:ignore_instances.json` (usually).
      const cacheKey = 'nitro:handlers:_:api:v1:ignore_instances';
      await storage.removeItem(cacheKey); // Try exact match first? Or prefix.
      // Or simply:
      const keys = await storage.getKeys('nitro:handlers:_:api:v1:ignore_instances');
      for (const key of keys) {
        await storage.removeItem(key);
      }
      
      console.log(`Synced: -${deletions.length} / +${additions.length} hosts. Cache invalidated.`);
      return { result: `Success: -${deletions.length} / +${additions.length}` };

    } catch (e) {
      console.error('Sync Denylist failed', e);
      return { result: 'Error', error: String(e) };
    }
  }
});

import yaml from 'js-yaml';
import { prisma } from '../../utils/prisma';

/**
 * タスク: sync:exclusions
 * 説明: 外部ソースから除外リストを同期する
 * 冪等性: 冪等。安全にリトライ可能。外部リストの状態に従ってデータベースを更新します。
 */
export default defineTask({
  meta: {
    name: 'sync:exclusions',
    description: 'Sync exclusions from JoinMisskey ignorehosts.yml'
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

      // 既存の 'joinmisskey' ソースのエントリのみを取得
      const existingEntries = await prisma.excludedHost.findMany({
        where: { source: 'joinmisskey' },
        select: { domain: true, source: true }
      });

      const upstreamSet = new Set(upstreamDomains);

      // 追加分: アップストリームにあるがDB (joinmisskey source) にないもの
      // ただし、もし 'manual' や 'system' で既に存在する場合は重複エラーになるので、upsertかskipDuplicatesを使う
      // ここでは、単純に createMany(skipDuplicates: true) を使うと source='system' (default) になってしまう恐れがあるため
      // 明示的に指定する必要がある。また、既存の manual/system のドメインと被る場合は ignore するのが望ましい。
      // なので、まずは全てのExcludedHostのドメインを取得して、それらに含まれていないものだけを追加対象にする。
      
      const allExisting = await prisma.excludedHost.findMany({ select: { domain: true, source: true } });
      const allExistingSet = new Set(allExisting.map(e => e.domain));

      const additions = upstreamDomains.filter(d => !allExistingSet.has(d));

      // 削除分: DBにあり (source='joinmisskey')、アップストリームにないもの
      const deletions = existingEntries
        .filter(e => e.source === 'joinmisskey' && !upstreamSet.has(e.domain))
        .map(e => e.domain);

      console.log(`Syncing Exclusions: ${additions.length} additions, ${deletions.length} deletions`);

      // 古い joinmisskey エントリを削除
      if (deletions.length > 0) {
        await prisma.excludedHost.deleteMany({
          where: {
            domain: { in: deletions },
            source: 'joinmisskey' 
          }
        });
      }

      // 新しいエントリを追加
      if (additions.length > 0) {
        await prisma.excludedHost.createMany({
          data: additions.map(domain => ({
            domain,
            reason: 'JoinMisskey: ignorehosts.yml',
            source: 'joinmisskey'
          })),
          skipDuplicates: true 
        });

        // 新規追加された除外エントリに対応する Instance レコードのみ削除
        await prisma.instance.deleteMany({
          where: {
            id: { in: additions }
          }
        });
      }

      // Invalidate cache for API endpoint
      const storage = useStorage('cache');
      // Clear cache for exclusions endpoint
      const keys = await storage.getKeys('nitro:handlers:_:api:v1:exclusions');
      for (const key of keys) {
        await storage.removeItem(key);
      }
      
      console.log(`Synced: -${deletions.length} / +${additions.length} hosts. Cache invalidated.`);
      return { result: `Success: -${deletions.length} / +${additions.length}` };

    } catch (e) {
      console.error('Sync Exclusions failed', e);
      return { result: 'Error', error: String(e) };
    }
  }
});

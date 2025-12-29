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
      const data = yaml.load(text) as string[];
      
      if (Array.isArray(data)) {
        await prisma.ignoreHost.createMany({
          data: data.map(domain => ({
            domain,
            reason: 'JoinMisskey: ignorehosts.yml'
          })),
          skipDuplicates: true
        });
        
        await prisma.instance.deleteMany({
          where: {
            id: { in: data }
          }
        });
        
        console.log(`Synced ${data.length} hosts from ignorehosts.yml to ignore_hosts table`);
        return { result: `Synced ${data.length} hosts` };
      }
      return { result: 'No data' };
    } catch (e) {
      console.error('Sync Denylist failed', e);
      return { result: 'Error', error: String(e) };
    }
  }
});

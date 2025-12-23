import { prisma } from '../../utils/prisma';
import { validateInstance, saveInstance } from '../../utils/misskey';

export default defineTask({
  meta: {
    name: 'sync:stats',
    description: 'Full stats sync for all instances'
  },
  async run() {
    console.log('Starting Full Stats Sync...');
    
    // 全インスタンス取得 (410以外)
    const candidates = await prisma.$queryRaw<{ id: string }[]>`
      SELECT i.id FROM instances i
      LEFT JOIN denylist d ON i.id = d.domain
      LEFT JOIN ignore_hosts ih ON i.id = ih.domain
      WHERE ( i.suspension_state != 'gone' OR i.suspension_state IS NULL) 
        AND (d.domain IS NULL AND ih.domain IS NULL)
    `;

    if (!candidates || candidates.length === 0) {
      console.log('No instances to sync.');
      return { result: 'No instances' };
    }

    const all = candidates;
    const now = new Date();
    console.log(`Syncing stats for ${all.length} instances...`);

    const chunkSize = 200; 
    for (let i = 0; i < all.length; i += chunkSize) {
      const chunk = all.slice(i, i + chunkSize);
      
      await Promise.all(chunk.map(async(row: { id: string }) => {
        try {
          const res = await validateInstance(prisma, row.id);
          await saveInstance(prisma, row.id, res, now);
        } catch(e) {
          console.error(`Error syncing ${row.id}:`, e);
        }
      }));
    }
    console.log('Full Stats Sync Completed.');
    return { result: `Synced ${all.length} instances` };
  }
});

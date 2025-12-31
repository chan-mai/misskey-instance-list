import yaml from 'js-yaml';
import { prisma } from '../utils/prisma';
import { validateInstance, saveInstance } from '../utils/misskey';

/**
 * タスク: update
 * 説明: インスタンス情報（バージョン、名前など）を更新する
 * 冪等性: 冪等。安全にリトライ可能。取得したデータに基づいて既存のレコードを更新します。
 */
export default defineTask({
  meta: {
    name: 'update',
    description: 'Update instance information'
  },
  async run() {
    const count = await prisma.instance.count();
    // 初回実行時 JoinMisskeyからSeed生成
    if (count === 0) {
      await seed();
      // Run sync:stats task after seeding
      await runTask('sync:stats');
      return { result: 'Seeded and synced' };
    }

    const candidates = await prisma.$queryRaw<{ id: string }[]>`
      SELECT i.id FROM instances i
      LEFT JOIN excluded_hosts eh ON i.id = eh.domain
      WHERE ( i.suspension_state != 'gone' OR i.suspension_state IS NULL) 
        AND (eh.domain IS NULL)
      ORDER BY i.last_check_at ASC NULLS FIRST 
      LIMIT 100
    `;

    if (!candidates || candidates.length === 0) {
      return { result: 'No candidates' };
    }

    const now = new Date();
    let updated = 0;

    await Promise.all(candidates.map(async(row: { id: string }) => {
      try {
        const res = await validateInstance(prisma, row.id);
        await saveInstance(prisma, row.id, res, now);
        updated++;
      } catch (e) {
        console.error(`Error updating ${row.id}:`, e);
        // Use updateMany to avoid error if record doesn't exist
        await prisma.instance.updateMany({
          where: { id: row.id },
          data: { last_check_at: new Date() }
        });
      }
    }));

    return { result: `Updated ${updated} instances` };
  }
});

async function seed() {
  try {
    const res = await fetch('https://raw.githubusercontent.com/joinmisskey/api/main/data/instances.yml');
    if (!res.ok) {
      console.error('Failed to fetch seed data');
      return;
    }
    const text = await res.text();
    const data = yaml.load(text) as { url: string }[];
    
    if (Array.isArray(data)) {
      const uniqueUrls = [...new Set(data.map(d => d.url).filter(u => !!u))];
      
      await prisma.instance.createMany({
        data: uniqueUrls.map(url => ({ id: url })),
        skipDuplicates: true
      });
    }
  } catch (e) {
    console.error('Seed failed', e);
  }
}

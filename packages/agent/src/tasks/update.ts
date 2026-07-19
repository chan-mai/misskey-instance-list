import yaml from 'js-yaml';
import { and, asc, count, eq, isNull, ne } from 'drizzle-orm';
import { instances, excludedHosts, chunkForD1, type Database } from '@mil/core/db';
import { validateInstance, saveInstance } from '@mil/core/crawl';
import { defineTask } from './define.js';

/**
 * タスク: update
 * 説明: インスタンス情報（バージョン、名前など）を更新する
 * 冪等性: 冪等安全にリトライ可能取得したデータに基づいて既存のレコードを更新します
 */
export default defineTask({
  meta: {
    name: 'update',
    description: 'Update instance information'
  },
  async run(ctx) {
    const countRows = await ctx.db.select({ total: count() }).from(instances);
    const total = countRows[0]?.total ?? 0;
    // 初回実行時 JoinMisskeyからSeed生成
    if (total === 0) {
      await seed(ctx.db);
      // Run sync:stats task after seeding
      await ctx.runTask('sync:stats');
      return { result: 'Seeded and synced' };
    }

    // 元のSQLから2点変更:
    // - `OR suspension_state IS NULL`は列がNOT NULL DEFAULT 'none'のためデッドコード, 落とすとindexも効く
    // - `ASC NULLS FIRST`はSQLiteのASC既定と同じなので単なるascで足りる
    const candidates = await ctx.db
      .select({ id: instances.id })
      .from(instances)
      .leftJoin(excludedHosts, eq(instances.id, excludedHosts.domain))
      .where(and(ne(instances.suspension_state, 'gone'), isNull(excludedHosts.domain)))
      .orderBy(asc(instances.last_check_at))
      .limit(100);

    if (!candidates || candidates.length === 0) {
      return { result: 'No candidates' };
    }

    const now = new Date();
    let updated = 0;

    await Promise.all(candidates.map(async(row) => {
      try {
        const res = await validateInstance(ctx, row.id);
        await saveInstance(ctx, row.id, res, now);
        updated++;
      } catch (e) {
        console.error(`Error updating ${row.id}:`, e);
        // 行が無くてもエラーにしない
        await ctx.db
          .update(instances)
          .set({ last_check_at: new Date() })
          .where(eq(instances.id, row.id));
      }
    }));

    return { result: `Updated ${updated} instances` };
  }
});

async function seed(db: Database) {
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

      // joinmisskeyのリストは1000件超, アプリ最大の書き込み
      // id + default付き4列(users_count/notes_count/is_alive/suspension_state)で5パラメータ
      for (const chunk of chunkForD1(uniqueUrls, 5)) {
        await db
          .insert(instances)
          .values(chunk.map(url => ({ id: url })))
          .onConflictDoNothing();
      }
    }
  } catch (e) {
    console.error('Seed failed', e);
  }
}

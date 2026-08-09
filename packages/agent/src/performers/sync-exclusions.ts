import yaml from 'js-yaml';
import { Performer } from 'tsumugi/performer';
import { and, eq, inArray } from 'drizzle-orm';
import { createDb, instances, excludedHosts, chunkForD1 } from '@mil/core/db';
import type { Env } from '../env.js';

export interface SyncExclusionsResult {
  additions: number;
  deletions: number;
}

// JoinMisskeyのignorehosts.ymlと除外リストを突き合わせ
export class SyncExclusions extends Performer<Record<string, never>, SyncExclusionsResult, object, Env> {
  async perform(): Promise<SyncExclusionsResult> {
    const db = createDb(this.env.DB);

    const res = await fetch('https://raw.githubusercontent.com/joinmisskey/api/main/data/ignorehosts.yml');
    if (!res.ok) {
      throw new Error(`Failed to fetch ignorehosts.yml: ${res.status}`);
    }

    const parsed = yaml.load(await res.text());
    if (!Array.isArray(parsed)) {
      throw new Error('ignorehosts.yml is not an array');
    }

    const upstreamDomains = parsed.filter((d): d is string => typeof d === 'string' && d.length > 0);
    const upstreamSet = new Set(upstreamDomains);

    const joinmisskeyEntries = await db
      .select({ domain: excludedHosts.domain })
      .from(excludedHosts)
      .where(eq(excludedHosts.source, 'joinmisskey'));

    // manual / systemで既に入っているドメインを上書きしないよう全ソースを見る
    const allExisting = await db.select({ domain: excludedHosts.domain }).from(excludedHosts);
    const allExistingSet = new Set(allExisting.map((e) => e.domain));

    const additions = upstreamDomains.filter((d) => !allExistingSet.has(d));
    const deletions = joinmisskeyEntries
      .filter((e) => !upstreamSet.has(e.domain))
      .map((e) => e.domain);

    console.log(`Syncing exclusions: ${additions.length} additions, ${deletions.length} deletions`);

    // 以下いずれもD1のバインドパラメータ上限(100)に収まるよう分割する
    if (deletions.length > 0) {
      // domain分 + where句のsource分で余裕を見る
      for (const chunk of chunkForD1(deletions, 2)) {
        await db
          .delete(excludedHosts)
          .where(and(inArray(excludedHosts.domain, chunk), eq(excludedHosts.source, 'joinmisskey')));
      }
    }

    if (additions.length > 0) {
      // 1行3カラム 33行/チャンク
      for (const chunk of chunkForD1(additions, 3)) {
        await db
          .insert(excludedHosts)
          .values(chunk.map((domain) => ({
            domain,
            reason: 'JoinMisskey: ignorehosts.yml',
            source: 'joinmisskey' as const,
          })))
          .onConflictDoNothing();
      }

      // 新規追加された除外エントリに対応する Instance レコードのみ削除
      for (const chunk of chunkForD1(additions, 1)) {
        await db.delete(instances).where(inArray(instances.id, chunk));
      }
    }

    // web側の/api/v1/exclusionsキャッシュはmaxAge切れを待つ
    return { additions: additions.length, deletions: deletions.length };
  }
}

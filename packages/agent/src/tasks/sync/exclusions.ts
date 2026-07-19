import yaml from 'js-yaml';
import { and, eq, inArray } from 'drizzle-orm';
import { instances, excludedHosts, chunkForD1 } from '@mil/core/db';
import { defineTask } from '../define.js';

/**
 * タスク: sync:exclusions
 * 説明: 外部ソースから除外リストを同期する
 * 冪等性: 冪等安全にリトライ可能外部リストの状態に従ってデータベースを更新します
 */
export default defineTask({
  meta: {
    name: 'sync:exclusions',
    description: 'Sync exclusions from JoinMisskey ignorehosts.yml'
  },
  async run(ctx) {
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
      const existingEntries = await ctx.db
        .select({ domain: excludedHosts.domain, source: excludedHosts.source })
        .from(excludedHosts)
        .where(eq(excludedHosts.source, 'joinmisskey'));

      const upstreamSet = new Set(upstreamDomains);

      // 追加分: アップストリームにあるがDB (joinmisskey source) にないもの
      // ただし、もし 'manual' や 'system' で既に存在する場合は重複エラーになるので、upsertかskipDuplicatesを使う
      // ここでは、単純に createMany(skipDuplicates: true) を使うと source='system' (default) になってしまう恐れがあるため
      // 明示的に指定する必要があるまた、既存の manual/system のドメインと被る場合は ignore するのが望ましい
      // なので、まずは全てのExcludedHostのドメインを取得して、それらに含まれていないものだけを追加対象にする

      const allExisting = await ctx.db
        .select({ domain: excludedHosts.domain, source: excludedHosts.source })
        .from(excludedHosts);
      const allExistingSet = new Set(allExisting.map(e => e.domain));

      const additions = upstreamDomains.filter(d => !allExistingSet.has(d));

      // 削除分: DBにあり (source='joinmisskey')、アップストリームにないもの
      const deletions = existingEntries
        .filter(e => e.source === 'joinmisskey' && !upstreamSet.has(e.domain))
        .map(e => e.domain);

      console.log(`Syncing Exclusions: ${additions.length} additions, ${deletions.length} deletions`);

      // 古い joinmisskey エントリを削除
      // 以下いずれもD1のバインドパラメータ上限(100)に収まるよう分割する
      if (deletions.length > 0) {
        // domain分 + where句のsource分で余裕を見る
        for (const chunk of chunkForD1(deletions, 2)) {
          await ctx.db
            .delete(excludedHosts)
            .where(
              and(
                inArray(excludedHosts.domain, chunk),
                eq(excludedHosts.source, 'joinmisskey'),
              ),
            );
        }
      }

      // 新しいエントリを追加
      if (additions.length > 0) {
        // 1行3カラムなので33行/チャンク
        for (const chunk of chunkForD1(additions, 3)) {
          await ctx.db
            .insert(excludedHosts)
            .values(chunk.map(domain => ({
              domain,
              reason: 'JoinMisskey: ignorehosts.yml',
              source: 'joinmisskey' as const
            })))
            .onConflictDoNothing();
        }

        // 新規追加された除外エントリに対応する Instance レコードのみ削除
        for (const chunk of chunkForD1(additions, 1)) {
          await ctx.db.delete(instances).where(inArray(instances.id, chunk));
        }
      }

      // web側の/api/v1/exclusionsキャッシュはmaxAge切れを待つ
      // 以前はNitroのuseStorage('cache')を直接消していたが, パッケージ分離で到達できなくなった
      // そもそもNitroの既定キャッシュはインスタンスごとのメモリで, 複数インスタンス時は
      // タスクを実行したインスタンスしか消せておらず無効化として機能していない
      // インスタンス跨ぎで正しく消すならMemorystore等を共有cache driverに据える必要がある

      console.log(`Synced: -${deletions.length} / +${additions.length} hosts.`);
      return { result: `Success: -${deletions.length} / +${additions.length}` };

    } catch (e) {
      console.error('Sync Exclusions failed', e);
      return { result: 'Error', error: String(e) };
    }
  }
});

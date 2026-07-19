import { and, asc, eq, isNull, ne } from 'drizzle-orm';
import { instances, excludedHosts } from '@mil/core/db';
import { validateInstance, saveInstance, fetchLocalTimeline } from '@mil/core/crawl';
import { detectLanguageFromTexts } from '@mil/core/lang';
import { defineTask, type TaskContext } from '../define.js';

/** 1チャンクあたりのホスト数 */
const CHUNK_SIZE = 50;

/**
 * タスク: sync:stats
 * 説明: インスタンスの統計情報（ユーザー数、ノート数など）を同期する
 * 冪等性: 冪等安全にリトライ可能現在のタイムスタンプ/データに基づいて時系列データを更新または追加します
 *
 * Workersは1回の実行に壁時計の上限があるため, ここでは対象をチャンクへ割ってキューに積むだけに留め,
 * 実処理はconsumer側にチャンク単位で分散する
 * Cloud Run前提の20分DEADLINE_MS打ち切りは不要になり, チャンク単位のリトライが効くようになった
 */
export default defineTask({
  meta: {
    name: 'sync:stats',
    description: 'Full stats sync for all instances'
  },
  async run(ctx) {
    console.log('Starting Full Stats Sync...');

    // 全インスタンス取得 (410以外)
    // 更新日時が古い順に取得することで、途中で止まっても次回は残りを処理できる
    const candidates = await ctx.db
      .select({ id: instances.id })
      .from(instances)
      .leftJoin(excludedHosts, eq(instances.id, excludedHosts.domain))
      .where(and(ne(instances.suspension_state, 'gone'), isNull(excludedHosts.domain)))
      .orderBy(asc(instances.last_check_at));

    if (candidates.length === 0) {
      console.log('No instances to sync.');
      return { result: 'No instances' };
    }

    const hosts = candidates.map((row) => row.id);
    const messages: { kind: 'stats-chunk'; hosts: string[] }[] = [];
    for (let i = 0; i < hosts.length; i += CHUNK_SIZE) {
      messages.push({ kind: 'stats-chunk', hosts: hosts.slice(i, i + CHUNK_SIZE) });
    }

    await ctx.enqueue(messages);

    console.log(`Enqueued ${messages.length} chunks for ${hosts.length} instances.`);
    return { result: `Enqueued ${messages.length} chunks (${hosts.length} instances)` };
  }
});

/**
 * チャンク1件分の統計同期キューのconsumerから呼ばれる
 *
 * Workersは1呼び出しあたり同時外向き接続が6本までなので,
 * Promise.allで並べても実際は6件ずつ流れる
 */
export async function processStatsChunk(ctx: TaskContext, hosts: string[]): Promise<number> {
  const now = new Date();
  let processed = 0;

  await Promise.all(hosts.map(async(host) => {
    try {
      const res = await validateInstance(ctx, host);

      let language: string | null = null;
      if (res.info) {
        const texts: string[] = [];

        // サーバー名と説明文を追加
        if (res.info.name) texts.push(res.info.name);
        if (res.info.description) texts.push(res.info.description);

        // タイムラインの投稿を取得して言語検出の精度を向上
        const timelinePosts = await fetchLocalTimeline(host, 30);
        texts.push(...timelinePosts);

        language = await detectLanguageFromTexts(texts);
      }

      // repository_url is updated in saveInstance if present in res.info
      await saveInstance(ctx, host, res, now, language);
      processed++;
    } catch (e) {
      console.warn(`Error syncing ${host}:`, e);
    }
  }));

  return processed;
}

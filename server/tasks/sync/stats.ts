import { prisma } from '../../utils/prisma';
import { validateInstance, saveInstance, fetchLocalTimeline } from '../../utils/misskey';
import { detectLanguageFromTexts } from '../../utils/detectLanguage';

export default defineTask({
  meta: {
    name: 'sync:stats',
    description: 'Full stats sync for all instances'
  },
  async run() {
    console.log('Starting Full Stats Sync...');
    
    // 全インスタンス取得 (410以外)
    // 更新日時が古い順に取得することで、タイムアウトで中断しても次回は残りを処理できる
    const candidates = await prisma.$queryRaw<{ id: string }[]>`
      SELECT i.id FROM instances i
      LEFT JOIN denylist d ON i.id = d.domain
      LEFT JOIN ignore_hosts ih ON i.id = ih.domain
      WHERE ( i.suspension_state != 'gone' OR i.suspension_state IS NULL) 
        AND (d.domain IS NULL AND ih.domain IS NULL)
      ORDER BY i.last_check_at ASC NULLS FIRST
    `;

    if (!candidates || candidates.length === 0) {
      console.log('No instances to sync.');
      return { result: 'No instances' };
    }

    const all = candidates;
    const now = new Date();
    // 実行開始時間
    const startTime = Date.now();
    // 期限 (サーバーレス関数のタイムアウト対策, 20分で打ち切り)
    const DEADLINE_MS = 20 * 60 * 1000;

    console.log(`Syncing stats for ${all.length} instances...`);

    const chunkSize = 25; 
    let processed = 0;

    for (let i = 0; i < all.length; i += chunkSize) {
      // 期限チェック
      if (Date.now() - startTime > DEADLINE_MS) {
        console.log(`Stats Sync timed out after ${processed} instances. Stopping gracefully.`);
        break;
      }

      const chunk = all.slice(i, i + chunkSize);
      
      await Promise.all(chunk.map(async(row: { id: string }) => {
        try {
          const res = await validateInstance(prisma, row.id);
          
          let language: string | null = null;
          if (res.info) {
            const texts: string[] = [];
            
            // サーバー名と説明文を追加
            if (res.info.name) texts.push(res.info.name);
            if (res.info.description) texts.push(res.info.description);
            
            // タイムラインの投稿を取得して言語検出の精度を向上
            const timelinePosts = await fetchLocalTimeline(row.id, 30);
            texts.push(...timelinePosts);
            
            language = detectLanguageFromTexts(texts);
          }

          // repository_url is updated in saveInstance if present in res.info
          await saveInstance(prisma, row.id, res, now, language);
        } catch(e) {
          console.warn(`Error syncing ${row.id}:`, e);
        }
      }));

      processed += chunk.length;
    }
    console.log(`Stats Sync Completed (Processed: ${processed}/${all.length}).`);
    return { result: `Synced ${processed}/${all.length} instances` };
  }
});

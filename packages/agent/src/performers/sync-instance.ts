import { Performer } from 'tsumugi/performer';
import { validateInstance, saveInstance, fetchLocalTimeline } from '@mil/core/crawl';
import { detectLanguageFromTexts } from '@mil/core/lang';
import { buildCrawlContext } from '../crawl-context.js';
import type { Env } from '../env.js';

export interface SyncInstancePayload {
  host: string;
  // サイクルの基準時刻
  scheduledAt: number;
  // タイムライン取得と言語判定の有無
  withLanguage: boolean;
}

export interface SyncInstanceResult {
  host: string;
  alive: boolean;
  language: string | null;
}

// validateInstanceが返すGONE / TIMEOUT / UNKNOWNは判定結果なのでthrowしない
export class SyncInstance extends Performer<
  SyncInstancePayload,
  SyncInstanceResult,
  { concurrencyKey: true },
  Env
> {
  async perform({ host, scheduledAt, withLanguage }: SyncInstancePayload): Promise<SyncInstanceResult> {
    const ctx = buildCrawlContext(this.env);
    const res = await validateInstance(ctx, host);

    let language: string | null = null;
    if (withLanguage && res.info) {
      const texts: string[] = [];
      if (res.info.name) texts.push(res.info.name);
      if (res.info.description) texts.push(res.info.description);
      texts.push(...await fetchLocalTimeline(host, 30));

      try {
        language = await detectLanguageFromTexts(texts);
      } catch (e) {
        // 言語判定が失敗してもクロール結果は保存する
        console.warn(`Language detection failed for ${host}:`, e);
      }
    }

    await saveInstance(ctx, host, res, new Date(scheduledAt), withLanguage ? language : undefined);

    return { host, alive: Boolean(res.info), language };
  }
}

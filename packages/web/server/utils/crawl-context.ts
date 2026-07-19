import type { H3Event } from 'h3';
import type { CrawlContext } from '@mil/core/crawl';
import { useDb } from '~~/server/utils/db';

/**
 * クロール処理用のコンテキストを組み立てる
 *
 * githubTokenはruntimeConfig経由ではなくprocess.envから直接読む。
 * runtimeConfigのenv上書きは`NUXT_`プレフィックスを要求するが, 実行環境が注入するのは
 * `GITHUB_TOKEN`(プレフィックスなし)のため上書きが効かない。
 */
export const createCrawlContext = (event: H3Event): CrawlContext => ({
  db: useDb(event),
  githubToken: process.env.GITHUB_TOKEN,
});

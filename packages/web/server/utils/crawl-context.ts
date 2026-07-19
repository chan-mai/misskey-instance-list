import { prisma } from '@mil/core/db';
import type { CrawlContext } from '@mil/core/crawl';

/**
 * クロール処理用のコンテキストを組み立てる
 *
 * githubTokenはruntimeConfig経由ではなくprocess.envから直接読む。
 * runtimeConfigのenv上書きは`NUXT_`プレフィックスを要求するが, 実行環境が注入するのは
 * `GITHUB_TOKEN`(プレフィックスなし)のため上書きが効かない。
 */
export const createCrawlContext = (): CrawlContext => ({
  prisma,
  githubToken: process.env.GITHUB_TOKEN,
});

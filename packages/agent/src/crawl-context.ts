import { createDb } from '@mil/core/db';
import type { CrawlContext } from '@mil/core/crawl';
import type { Env } from './env.js';

// D1bindingはenvにしか無いためジョブ毎に組み立てる
export const buildCrawlContext = (env: Env): CrawlContext => ({
  db: createDb(env.DB),
  githubToken: env.GITHUB_TOKEN,
});

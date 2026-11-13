import { createDb } from '@mil/core/db';

import type { Env } from './env.js';
import type { CrawlContext } from '@mil/core/domain';

// D1bindingはenvにしか無いためジョブ毎に組み立てる
export const buildCrawlContext = (env: Env): CrawlContext => ({
	db: createDb(env.DB),
	githubToken: env.GITHUB_TOKEN,
});

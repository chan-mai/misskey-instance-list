import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../entity/schema.js';

import type { D1Database } from '@cloudflare/workers-types';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

export type { D1Database };

// D1bindingはリクエスト時のenvにしか無いためsingletonは持てない
export type Database = DrizzleD1Database<typeof schema>;

export const createDb = (binding: D1Database): Database => drizzle(binding, { schema });

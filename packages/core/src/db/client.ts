import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';
import type { D1Database } from '@cloudflare/workers-types';
import * as schema from './schema.js';

export type { D1Database };

// D1バインディングはリクエスト時のenvにしか無いためsingletonは持てない
export type Database = DrizzleD1Database<typeof schema>;

export const createDb = (binding: D1Database): Database => drizzle(binding, { schema });

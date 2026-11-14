import { env } from 'cloudflare:test';
import { createDb } from '../src/db/index.js';
import { excludedHosts, instances, repositories } from '../src/entity/schema.js';

import type { InstanceInsert } from '../src/entity/schema.js';

export const db = createDb(env.DB);

export const resetDb = async () => {
	await db.batch([db.delete(instances), db.delete(excludedHosts), db.delete(repositories)]);
};

export const OFFICIAL = 'https://github.com/misskey-dev/misskey';

export const insertAlive = async (rows: (Partial<InstanceInsert> & { id: string })[]) => {
	await db.insert(instances).values(rows.map(row => ({ is_alive: true, ...row })));
};

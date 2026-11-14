import { beforeEach, describe, expect, test } from 'vitest';
import { instances } from '../../src/entity/schema.js';
import { insertExclusion } from '../../src/repository/excluded-hosts.js';
import { upsertSoftwareRepository } from '../../src/repository/software-repositories.js';
import { getAdminCounts, getNetworkCounts, listIpStackUsage, listLanguageUsage, listRepositoryUsage } from '../../src/repository/stats.js';
import { OFFICIAL, db, insertAlive, resetDb } from '../db.js';

beforeEach(resetDb);

test('空DBは全件数0', async () => {
	expect(await getNetworkCounts(db)).toEqual({ known: 0, active: 0, exclusions: 0, users: 0 });
	expect(await listIpStackUsage(db)).toEqual([]);
});

describe('集計', () => {
	const FORK = 'https://github.com/example/fork';

	beforeEach(async () => {
		await upsertSoftwareRepository(db, { url: OFFICIAL, name: 'misskey-dev/misskey', description: 'Misskey' });
		await upsertSoftwareRepository(db, { url: FORK, name: 'example/fork', description: null });
		await insertAlive([
			{ id: 'a.example', users_count: 100, language: 'ja', repository_url: OFFICIAL, ip_stack: 'dual' },
			{ id: 'b.example', users_count: 20, language: 'ja', repository_url: FORK, ip_stack: 'v4' },
			{ id: 'c.example', users_count: 3, language: 'en', repository_url: OFFICIAL, ip_stack: null },
			{ id: 'd.example', users_count: null, language: null, repository_url: null, ip_stack: 'dual' },
		]);
		await db.insert(instances).values({ id: 'dead.example', users_count: 9999, language: 'ko', repository_url: FORK, ip_stack: 'v6' });
		await insertExclusion(db, { domain: 'm.example', source: 'manual' });
		await insertExclusion(db, { domain: 's.example', source: 'system' });
		await insertExclusion(db, { domain: 'j.example', source: 'joinmisskey' });
	});

	test('公開統計件数を集計, ユーザー数は稼働中のみ合計', async () => {
		expect(await getNetworkCounts(db)).toEqual({ known: 5, active: 4, exclusions: 3, users: 123 });
	});

	test('管理画面件数を集計, 除外はsource別内訳', async () => {
		expect(await getAdminCounts(db)).toEqual({
			instances: { known: 5, active: 4 },
			users: 123,
			exclusions: { total: 3, manual: 1, system: 1, joinmisskey: 1 },
		});
	});

	test('レポジトリは稼働中件数降順', async () => {
		expect(await listRepositoryUsage(db)).toEqual([
			{ url: OFFICIAL, name: 'misskey-dev/misskey', description: 'Misskey', count: 2 },
			{ url: FORK, name: 'example/fork', description: null, count: 1 },
		]);
	});

	test('言語は判定済み稼働中のみ件数降順', async () => {
		expect(await listLanguageUsage(db)).toEqual([
			{ code: 'ja', count: 2 },
			{ code: 'en', count: 1 },
		]);
	});

	test('IPスタックは未判定をnullで集計', async () => {
		const rows = await listIpStackUsage(db);
		expect(rows).toEqual(
			expect.arrayContaining([
				{ stack: 'dual', count: 2, users: 100 },
				{ stack: 'v4', count: 1, users: 20 },
				{ stack: null, count: 1, users: 3 },
			]),
		);
		expect(rows).toHaveLength(3);
	});
});

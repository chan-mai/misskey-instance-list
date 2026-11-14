import { beforeEach, describe, expect, test } from 'vitest';
import { excludedHosts } from '../../src/entity/schema.js';
import {
	deleteExclusion,
	deleteExclusionsBySource,
	findExclusion,
	insertExclusion,
	insertExclusionsIgnoringConflict,
	listExcludedDomains,
	listExclusionReasons,
	searchExclusions,
	updateExclusionReason,
	upsertSystemExclusion,
} from '../../src/repository/excluded-hosts.js';
import { db, resetDb } from '../db.js';

beforeEach(resetDb);

describe('登録/更新', () => {
	test('新規時行返却, 重複時undefined, 既存行維持', async () => {
		const row = await insertExclusion(db, { domain: 'spam.example', reason: 'spam' });
		expect(row).toMatchObject({ domain: 'spam.example', reason: 'spam', source: 'system' });
		expect(typeof row?.created_at).toBe('number');

		expect(await insertExclusion(db, { domain: 'spam.example', reason: 'again', source: 'manual' })).toBeUndefined();
		expect(await findExclusion(db, 'spam.example')).toMatchObject({ reason: 'spam', source: 'system' });
	});

	test('自動判定登録は既存行のsource維持, 新規はsystem', async () => {
		await insertExclusion(db, { domain: 'manual.example', reason: 'by admin', source: 'manual' });
		await upsertSystemExclusion(db, 'manual.example', 'Fork Repository: x');
		await upsertSystemExclusion(db, 'new.example', 'Not Misskey: mastodon');

		expect(await findExclusion(db, 'manual.example')).toMatchObject({ source: 'manual', reason: 'Fork Repository: x' });
		expect(await findExclusion(db, 'new.example')).toMatchObject({ source: 'system', reason: 'Not Misskey: mastodon' });
	});

	test('理由更新/削除は対象無し時undefined', async () => {
		expect(await updateExclusionReason(db, 'absent.example', 'x')).toBeUndefined();
		expect(await deleteExclusion(db, 'absent.example')).toBeUndefined();

		await insertExclusion(db, { domain: 'spam.example', reason: 'spam' });
		expect(await updateExclusionReason(db, 'spam.example', 'edited')).toMatchObject({ reason: 'edited' });
		expect(await deleteExclusion(db, 'spam.example')).toMatchObject({ domain: 'spam.example' });
		expect(await findExclusion(db, 'spam.example')).toBeUndefined();
	});

	test('一括登録はD1上限で分割, 重複無視', async () => {
		const domains = Array.from({ length: 120 }, (_, i) => `host-${i}.example`);
		await insertExclusion(db, { domain: 'host-0.example', source: 'manual' });
		await insertExclusionsIgnoringConflict(
			db,
			domains.map(domain => ({ domain, reason: 'JoinMisskey: ignorehosts.yml', source: 'joinmisskey' as const })),
		);

		expect(await listExcludedDomains(db, 'joinmisskey')).toHaveLength(119);
		expect(await listExcludedDomains(db, 'manual')).toEqual(['host-0.example']);
		expect(await listExcludedDomains(db)).toHaveLength(120);
	});

	test('source指定一括削除で他source維持', async () => {
		await insertExclusion(db, { domain: 'a.example', source: 'joinmisskey' });
		await insertExclusion(db, { domain: 'b.example', source: 'manual' });
		await deleteExclusionsBySource(db, ['a.example', 'b.example'], 'joinmisskey');

		expect((await listExclusionReasons(db)).map(r => r.domain)).toEqual(['b.example']);
	});

	test('CHECK制約で不正source拒否', async () => {
		await expect(db.insert(excludedHosts).values({ domain: 'a.example', source: 'other' as never })).rejects.toMatchObject({
			cause: expect.objectContaining({ message: expect.stringContaining('CHECK constraint failed') }),
		});
	});
});

describe('検索', () => {
	beforeEach(async () => {
		await db.insert(excludedHosts).values([
			{ domain: 'old.example', reason: 'Fork Repository: cherrypick', source: 'system', created_at: 1_000 },
			{ domain: 'manual.example', reason: 'spam', source: 'manual', created_at: 3_000 },
			{ domain: 'jm.example', reason: 'JoinMisskey: ignorehosts.yml', source: 'joinmisskey', created_at: 2_000 },
		]);
	});

	const domainsOf = async (query: Partial<Parameters<typeof searchExclusions>[1]>) => {
		const { total, exclusions } = await searchExclusions(db, { page: 1, limit: 20, source: 'all', ...query });
		return { total, domains: exclusions.map(e => e.domain) };
	};

	test('既定は登録日時降順', async () => {
		expect(await domainsOf({})).toEqual({ total: 3, domains: ['manual.example', 'jm.example', 'old.example'] });
	});

	test.each([
		[{ source: 'manual' }, ['manual.example']],
		[{ search: 'cherry' }, ['old.example']],
		[{ search: 'jm.' }, ['jm.example']],
		[{ search: 'example', source: 'system' }, ['old.example']],
	] as const)('%j一致行のみ', async (query, domains) => {
		expect((await domainsOf(query)).domains).toEqual(domains);
	});

	test('page/limitで範囲指定', async () => {
		expect(await domainsOf({ page: 2, limit: 2 })).toEqual({ total: 3, domains: ['old.example'] });
	});
});

import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, test } from 'vitest';
import { instances } from '../../src/entity/schema.js';
import { insertExclusion } from '../../src/repository/excluded-hosts.js';
import {
	countInstances,
	deleteInstances,
	findInstance,
	findInstanceSummary,
	insertInstanceIds,
	insertInstanceIfAbsent,
	listAliveScoreInputs,
	listAliveVersionsByRepository,
	listAllSyncTargetIds,
	listStaleSyncTargetIds,
	markInstanceAlive,
	markInstanceDown,
	sampleAliveInstanceIds,
	searchInstances,
	updateRecommendationScores,
} from '../../src/repository/instances.js';
import { upsertSoftwareRepository } from '../../src/repository/software-repositories.js';
import { OFFICIAL, db, insertAlive, resetDb } from '../db.js';

import type { InstanceSearch } from '../../src/repository/instances.js';

beforeEach(resetDb);

const ids = (count: number) => Array.from({ length: count }, (_, i) => `host-${String(i).padStart(3, '0')}.example`);

describe('登録', () => {
	test('未登録時既定値で作成, true返却, 登録済み時false返却', async () => {
		expect(await insertInstanceIfAbsent(db, 'a.example')).toBe(true);
		expect(await insertInstanceIfAbsent(db, 'a.example')).toBe(false);
		expect(await findInstance(db, 'a.example')).toMatchObject({
			id: 'a.example',
			is_alive: false,
			suspension_state: 'none',
			users_count: 0,
			notes_count: 0,
			last_check_at: null,
		});
	});

	test('作成日時はepoch ms数値', async () => {
		const before = Temporal.Now.instant().epochMilliseconds;
		await insertInstanceIfAbsent(db, 'a.example');
		const row = await findInstance(db, 'a.example');

		expect(typeof row?.created_at).toBe('number');
		// unixepoch()は秒精度
		expect(row?.created_at).toBeGreaterThanOrEqual(before - 1_000);
		expect(row?.created_at).toBeLessThanOrEqual(Temporal.Now.instant().epochMilliseconds);
	});

	test('bindings上限を超える件数を分割登録, 重複無視', async () => {
		await insertInstanceIds(db, ids(250));
		await insertInstanceIds(db, [...ids(10), 'extra.example']);
		expect(await countInstances(db)).toBe(251);
	});

	test('bindings上限を超える件数を分割削除', async () => {
		await insertInstanceIds(db, ids(250));
		await deleteInstances(db, ids(249));
		expect(await countInstances(db)).toBe(1);
	});
});

describe('取得結果反映', () => {
	const now = Temporal.Instant.from('2026-11-14T00:00:00Z');

	test('稼働中として各値/確認時刻保存, 停止状態解除', async () => {
		await db.insert(instances).values({ id: 'a.example', suspension_state: 'suspended' });
		const updatedAfter = Temporal.Now.instant().epochMilliseconds;
		await markInstanceAlive(db, 'a.example', now, {
			node_name: 'A',
			users_count: 10,
			notes_count: 100,
			version: '2026.11.0',
			banner_url: null,
			icon_url: 'https://a.example/icon.png',
			language: 'ja',
			repository_url: null,
			open_registrations: true,
			email_required: false,
			ip_stack: 'dual',
		});

		const row = await findInstance(db, 'a.example');
		expect(row).toMatchObject({
			node_name: 'A',
			users_count: 10,
			is_alive: true,
			suspension_state: 'none',
			last_check_at: now.epochMilliseconds,
			open_registrations: true,
			email_required: false,
			ip_stack: 'dual',
		});
		// $onUpdateで更新時刻を記録
		expect(row?.last_updated).toBeGreaterThanOrEqual(updatedAfter);
	});

	test('停止状態/確認時刻のみ更新, 既存値保持', async () => {
		await insertAlive([{ id: 'a.example', node_name: 'A', users_count: 10 }]);
		await markInstanceDown(db, 'a.example', now, 'gone');

		expect(await findInstanceSummary(db, 'a.example')).toMatchObject({
			node_name: 'A',
			users_count: 10,
			is_alive: false,
			suspension_state: 'gone',
			last_check_at: now.epochMilliseconds,
		});
	});

	test('CHECK制約で不正IPスタック拒否', async () => {
		await expect(db.insert(instances).values({ id: 'a.example', ip_stack: 'v5' as never })).rejects.toMatchObject({
			cause: expect.objectContaining({ message: expect.stringContaining('CHECK constraint failed') }),
		});
	});
});

describe('同期対象', () => {
	beforeEach(async () => {
		await db.insert(instances).values([
			{ id: 'checked-old.example', last_check_at: 1_000 },
			{ id: 'checked-new.example', last_check_at: 2_000 },
			{ id: 'never.example', last_check_at: null },
			{ id: 'gone.example', last_check_at: 0, suspension_state: 'gone' },
			{ id: 'suspended.example', last_check_at: 3_000, suspension_state: 'suspended' },
			{ id: 'excluded.example', last_check_at: 0 },
		]);
		await insertExclusion(db, { domain: 'excluded.example', source: 'manual' });
	});

	test('未確認先頭に確認日時昇順, 除外ホスト/goneは対象外', async () => {
		expect(await listStaleSyncTargetIds(db, 10)).toEqual([
			'never.example',
			'checked-old.example',
			'checked-new.example',
			'suspended.example',
		]);
		expect(await listStaleSyncTargetIds(db, 2)).toEqual(['never.example', 'checked-old.example']);
	});

	test('全件取得時gone/除外ホスト除外, ID順', async () => {
		expect(await listAllSyncTargetIds(db)).toEqual(['checked-new.example', 'checked-old.example', 'never.example', 'suspended.example']);
	});

	test('連合先探索起点は稼働中から件数上限内で抽出', async () => {
		await insertAlive([{ id: 'alive-1.example' }, { id: 'alive-2.example' }]);
		expect((await sampleAliveInstanceIds(db, 10)).sort()).toEqual(['alive-1.example', 'alive-2.example']);
		expect(await sampleAliveInstanceIds(db, 1)).toHaveLength(1);
	});
});

describe('おすすめスコア', () => {
	test('稼働中をID keysetで走査, スコア一括更新', async () => {
		await insertAlive(ids(5).map(id => ({ id, users_count: 1 })));
		await db.insert(instances).values({ id: 'dead.example' });

		const first = await listAliveScoreInputs(db, 3);
		expect(first.map(r => r.id)).toEqual(ids(3));
		const second = await listAliveScoreInputs(db, 3, first.at(-1)?.id);
		expect(second.map(r => r.id)).toEqual(ids(5).slice(3));

		await updateRecommendationScores(db, [
			{ id: 'host-000.example', score: 12.5 },
			{ id: 'host-001.example', score: 80 },
		]);
		expect((await findInstance(db, 'host-000.example'))?.recommendation_score).toBe(12.5);
		expect((await findInstance(db, 'host-001.example'))?.recommendation_score).toBe(80);
		await updateRecommendationScores(db, []);
	});

	test('指定レポジトリの稼働中バージョンを重複無しで取得', async () => {
		await upsertSoftwareRepository(db, { url: OFFICIAL, name: 'misskey-dev/misskey', description: null });
		await insertAlive([
			{ id: 'a.example', version: '2026.11.0', repository_url: OFFICIAL },
			{ id: 'b.example', version: '2026.10.0', repository_url: OFFICIAL },
			{ id: 'c.example', version: '2026.11.0', repository_url: OFFICIAL },
			{ id: 'other.example', version: '2026.12.0' },
		]);
		await db.insert(instances).values({ id: 'dead.example', version: '2027.1.0', repository_url: OFFICIAL });

		expect(new Set(await listAliveVersionsByRepository(db, OFFICIAL))).toEqual(new Set(['2026.10.0', '2026.11.0']));
	});
});

describe('検索', () => {
	beforeEach(async () => {
		await insertAlive([
			{
				id: 'alpha.example',
				node_name: 'Alpha',
				users_count: 300,
				notes_count: 10,
				recommendation_score: 50,
				language: 'ja',
				open_registrations: true,
				email_required: false,
				ip_stack: 'dual',
			},
			{
				id: 'beta.example',
				node_name: 'Beta',
				users_count: 20,
				notes_count: 500,
				recommendation_score: null,
				language: 'en',
				open_registrations: false,
				email_required: true,
				ip_stack: 'v4',
			},
			{
				id: 'gamma.example',
				node_name: 'ガンマ',
				users_count: 20,
				notes_count: null,
				recommendation_score: 70,
				language: 'ja',
				open_registrations: null,
				email_required: null,
				ip_stack: null,
			},
		]);
		await insertAlive([{ id: 'excluded.example', users_count: 9999 }]);
		await insertExclusion(db, { domain: 'excluded.example' });
		await db.insert(instances).values({ id: 'dead.example', users_count: 9999 });
	});

	const search = async (query: Partial<InstanceSearch>) => {
		const { total, rows } = await searchInstances(db, { sort: 'users', order: 'desc', limit: 30, offset: 0, ...query });
		return { total, ids: rows.map(r => r.id) };
	};

	test('稼働中かつ未除外のみ, 同値はID順', async () => {
		expect(await search({})).toEqual({ total: 3, ids: ['alpha.example', 'beta.example', 'gamma.example'] });
		expect(await search({ order: 'asc' })).toEqual({ total: 3, ids: ['beta.example', 'gamma.example', 'alpha.example'] });
	});

	test('NULLは昇順/降順に関わらず末尾', async () => {
		expect((await search({ sort: 'recommended', order: 'desc' })).ids).toEqual(['gamma.example', 'alpha.example', 'beta.example']);
		expect((await search({ sort: 'recommended', order: 'asc' })).ids).toEqual(['alpha.example', 'gamma.example', 'beta.example']);
		expect((await search({ sort: 'notes', order: 'asc' })).ids).toEqual(['alpha.example', 'beta.example', 'gamma.example']);
	});

	test.each([
		[{ language: 'ja' }, ['alpha.example', 'gamma.example']],
		[{ open_registrations: true }, ['alpha.example']],
		[{ open_registrations: false }, ['beta.example']],
		[{ email_required: true }, ['beta.example']],
		[{ ip_stack: 'v4' }, ['beta.example']],
		[{ min_users: 21 }, ['alpha.example']],
		[{ max_users: 20 }, ['beta.example', 'gamma.example']],
		[{ min_users: 20, max_users: 20 }, ['beta.example', 'gamma.example']],
		[{ search: 'ガン' }, ['gamma.example']],
		[{ search: 'beta.ex' }, ['beta.example']],
		[{ search: 'ALPHA' }, ['alpha.example']],
	] as [Partial<InstanceSearch>, string[]][])('%j一致行のみ', async (query, expected) => {
		expect((await search(query)).ids).toEqual(expected);
	});

	test('totalは条件一致総数, 行はlimit/offset範囲', async () => {
		expect(await search({ limit: 1, offset: 1 })).toEqual({ total: 3, ids: ['beta.example'] });
		expect(await search({ limit: 10, offset: 3 })).toEqual({ total: 3, ids: [] });
	});

	test('レポジトリURL一致のみ', async () => {
		await upsertSoftwareRepository(db, { url: OFFICIAL, name: null, description: null });
		await db.update(instances).set({ repository_url: OFFICIAL }).where(eq(instances.id, 'alpha.example'));
		expect((await search({ repository: OFFICIAL })).ids).toEqual(['alpha.example']);
	});
});

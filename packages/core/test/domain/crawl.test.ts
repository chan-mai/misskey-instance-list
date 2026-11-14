import { beforeEach, describe, expect, test } from 'vitest';
import { saveInstance } from '../../src/domain/crawl.js';
import { addExclusion, excludeRejectedHost } from '../../src/domain/exclusion.js';
import { repositories } from '../../src/entity/schema.js';
import { findExclusion } from '../../src/repository/excluded-hosts.js';
import { findInstance, insertInstanceIfAbsent } from '../../src/repository/instances.js';
import { upsertSoftwareRepository } from '../../src/repository/software-repositories.js';
import { db, insertAlive, resetDb } from '../db.js';

import type { InstanceInfo } from '../../src/client/misskey.js';

beforeEach(resetDb);

const ctx = { db };
const now = Temporal.Instant.from('2026-11-13T12:00:00Z');

const info = (overrides: Partial<InstanceInfo> = {}): InstanceInfo => ({
	name: 'Example',
	users: 42,
	notes: 1000,
	version: '2026.11.0',
	softwareName: 'misskey',
	banner: null,
	icon: null,
	repositoryUrl: null,
	description: 'desc',
	openRegistrations: true,
	emailRequired: false,
	ipStack: 'v4',
	...overrides,
});

describe('saveInstance', () => {
	beforeEach(async () => {
		await insertInstanceIfAbsent(db, 'a.example');
	});

	test('取得結果を稼働中として保存し, 言語未指定なら既存値を保持', async () => {
		await insertAlive([{ id: 'b.example', language: 'ja' }]);
		await saveInstance(ctx, 'b.example', { info: info() }, now);

		expect(await findInstance(db, 'b.example')).toMatchObject({
			node_name: 'Example',
			users_count: 42,
			notes_count: 1000,
			is_alive: true,
			language: 'ja',
			ip_stack: 'v4',
			repository_url: null,
			last_check_at: now.epochMilliseconds,
		});
	});

	test('言語判定の結果nullは未判定として上書き', async () => {
		await insertAlive([{ id: 'b.example', language: 'ja' }]);
		await saveInstance(ctx, 'b.example', { info: info() }, now, null);
		expect((await findInstance(db, 'b.example'))?.language).toBeNull();
	});

	test('GitHub以外のリポジトリはowner/repo形式の名前で登録し紐付け', async () => {
		const url = 'https://codeberg.example/owner/repo.git';
		await saveInstance(ctx, 'a.example', { info: info({ repositoryUrl: url }) }, now);

		expect((await findInstance(db, 'a.example'))?.repository_url).toBe(url);
		expect(await db.select().from(repositories)).toEqual([expect.objectContaining({ url, name: 'owner/repo', description: null })]);
	});

	test.each([
		['GONE', 'gone'],
		['TIMEOUT', 'suspended'],
		['UNKNOWN', 'suspended'],
	] as const)('取得失敗%sは%s', async (error, state) => {
		await saveInstance(ctx, 'a.example', { info: null, error }, now);
		expect(await findInstance(db, 'a.example')).toMatchObject({
			is_alive: false,
			suspension_state: state,
			last_check_at: now.epochMilliseconds,
		});
	});
});

describe('除外', () => {
	test('手動除外はインスタンスを削除し, 登録済みならundefined', async () => {
		await insertAlive([{ id: 'spam.example' }]);

		expect(await addExclusion(db, { domain: 'spam.example', reason: 'spam', source: 'manual' })).toMatchObject({ source: 'manual' });
		expect(await findInstance(db, 'spam.example')).toBeUndefined();
		expect(await addExclusion(db, { domain: 'spam.example', source: 'manual' })).toBeUndefined();
	});

	test('自動判定の除外は登録と削除を1バッチで行う', async () => {
		await insertAlive([{ id: 'fork.example' }]);
		await excludeRejectedHost(db, 'fork.example', 'Fork Repository: x');

		expect(await findExclusion(db, 'fork.example')).toMatchObject({ source: 'system', reason: 'Fork Repository: x' });
		expect(await findInstance(db, 'fork.example')).toBeUndefined();
	});
});

describe('upsertSoftwareRepository', () => {
	test('名前と説明は値がある場合のみ上書きし, 更新時刻を記録', async () => {
		const url = 'https://github.com/misskey-dev/misskey';
		await upsertSoftwareRepository(db, { url, name: 'misskey-dev/misskey', description: 'first' });
		const [created] = await db.select().from(repositories);

		const updatedAfter = Temporal.Now.instant().epochMilliseconds;
		await upsertSoftwareRepository(db, { url, name: null, description: null });
		const [updated] = await db.select().from(repositories);

		expect(updated).toMatchObject({ name: 'misskey-dev/misskey', description: 'first', created_at: created?.created_at });
		expect(updated?.updated_at).toBeGreaterThanOrEqual(updatedAfter);
	});
});

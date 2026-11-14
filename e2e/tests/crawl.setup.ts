// 管理画面からの登録とagentの各ジョブを実行し, 以降のテストが参照するデータを作る
import { mkdirSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import {
	ADMIN_STATE,
	HOSTS,
	OFFICIAL_REPOSITORY_URL,
	listJobs,
	loginWithZitadel,
	resultOf,
	triggerSchedule,
	waitForJob,
	waitForRun,
} from './support';

test.describe.configure({ mode: 'serial' });

test('管理者がZITADELでログインする', async ({ page }) => {
	await page.goto('/admin');
	await expect(page).toHaveURL(/zitadel\.mil-e2e\.test\/ui\/v2\/login/);

	await loginWithZitadel(page, 'mil-admin');

	await expect(page).toHaveURL('https://web.mil-e2e.test/admin', { timeout: 30_000 });
	await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

	mkdirSync('.auth', { recursive: true });
	await page.context().storageState({ path: ADMIN_STATE });
});

test.describe('管理画面からの指名クロール', () => {
	test.use({ storageState: ADMIN_STATE });

	test('Misskeyサーバーを登録し取得結果を表示する', async ({ page }) => {
		await page.goto('/admin/crawl');
		await page.getByPlaceholder('misskey.io').fill(HOSTS.alpha);
		await page.getByRole('button', { name: 'クロール' }).click();

		const rows = page.getByRole('row');
		await expect(page.getByText('新規登録')).toBeVisible({ timeout: 60_000 });
		await expect(rows.filter({ hasText: '名前' })).toContainText('Alpha E2E');
		await expect(rows.filter({ hasText: 'バージョン' })).toContainText('2026.11.0');
		await expect(rows.filter({ hasText: '生存' })).toContainText('alive');
		await expect(rows.filter({ hasText: '停止状態' })).toContainText('none');
		await expect(rows.filter({ hasText: 'リポジトリ' })).toContainText(OFFICIAL_REPOSITORY_URL);
		await expect(rows.filter({ hasText: '最終チェック' })).not.toContainText('-');
	});

	test('Misskey以外のソフトウェアは除外リストへ登録される', async ({ page }) => {
		const res = await page.request.post('/api/admin/crawl', { data: { domain: HOSTS.gts } });
		expect(res.status()).toBe(200);
		expect(await res.json()).toMatchObject({ domain: HOSTS.gts, ok: false, error: 'UNKNOWN', created: true, instance: null });

		const exclusion = await page.request.get(`/api/admin/exclusions?search=${HOSTS.gts}`);
		expect((await exclusion.json()).exclusions).toEqual([
			expect.objectContaining({ domain: HOSTS.gts, source: 'system', reason: 'Not Misskey: gotosocial' }),
		]);
	});

	test('User-Agentで応答を変えるサーバーは偽装として除外される', async ({ page }) => {
		const res = await page.request.post('/api/admin/crawl', { data: { domain: HOSTS.spoof } });
		expect(await res.json()).toMatchObject({ ok: false, instance: null });

		const exclusion = await page.request.get(`/api/admin/exclusions?search=${HOSTS.spoof}`);
		expect((await exclusion.json()).exclusions).toEqual([
			expect.objectContaining({ domain: HOSTS.spoof, source: 'system', reason: 'Spoofing: JoinMisskey=misskey, Browser=gotosocial' }),
		]);
	});

	test('410を返すサーバーはgoneとして記録される', async ({ page }) => {
		const res = await page.request.post('/api/admin/crawl', { data: { domain: HOSTS.gone } });
		expect(await res.json()).toMatchObject({
			ok: false,
			error: 'GONE',
			instance: { id: HOSTS.gone, is_alive: false, suspension_state: 'gone' },
		});
	});

	test('接続できないサーバーはsuspendedとして記録される', async ({ page }) => {
		const res = await page.request.post('/api/admin/crawl', { data: { domain: HOSTS.down } });
		expect(await res.json()).toMatchObject({
			ok: false,
			error: 'TIMEOUT',
			instance: { id: HOSTS.down, is_alive: false, suspension_state: 'suspended' },
		});
	});

	test('プライベートアドレスへ解決されるドメインは接続前に拒否される', async ({ page }) => {
		const res = await page.request.post('/api/admin/crawl', { data: { domain: HOSTS.private } });
		expect(res.status()).toBe(400);
		expect((await res.json()).statusMessage).toBe('Domain does not resolve to a public address');
	});

	test('名前解決できないドメインは拒否される', async ({ page }) => {
		const res = await page.request.post('/api/admin/crawl', { data: { domain: HOSTS.missing } });
		expect(res.status()).toBe(400);
	});

	test('除外済みのドメインは409を返す', async ({ page }) => {
		const res = await page.request.post('/api/admin/crawl', { data: { domain: HOSTS.gts } });
		expect(res.status()).toBe(409);
		expect((await res.json()).statusMessage).toBe('Host is excluded (source: system)');
	});
});

test.describe('agentの定期ジョブ', () => {
	test('稼働中サーバーの連合先から候補を発見する', async ({ request }) => {
		const { kind, id } = await triggerSchedule(request, 'discover-instances');
		expect(kind).toBe('job');

		const job = await waitForJob(request, id);
		expect(job.state).toBe('COMPLETED');
		// 稼働中はalphaのみ, その連合先がbeta, cherrypick, tempura
		expect(resultOf(job)).toEqual({ sources: [HOSTS.alpha], discovered: 3 });
	});

	test('更新Flowが全対象を再取得し除外対象のフォークを除外する', async ({ request }) => {
		const { kind, id } = await triggerSchedule(request, 'update-instances');
		expect(kind).toBe('flow');

		const run = await waitForRun(request, id);
		expect(run).toMatchObject({ state: 'COMPLETED', node_failed: 0 });

		const syncs = (await listJobs(request, 'SyncInstance')).map(job => resultOf<{ host: string; alive: boolean }>(job));
		expect(syncs).toEqual(
			expect.arrayContaining([
				{ host: HOSTS.alpha, alive: true, language: null },
				{ host: HOSTS.beta, alive: true, language: null },
				{ host: HOSTS.tempura, alive: true, language: null },
				{ host: HOSTS.cherrypick, alive: false, language: null },
				{ host: HOSTS.down, alive: false, language: null },
			]),
		);
		// goneは再取得対象外
		expect(syncs.map(s => s.host)).not.toContain(HOSTS.gone);
	});

	test('統計同期がバッチ単位で全対象の言語を判定する', async ({ request }) => {
		const { id } = await triggerSchedule(request, 'plan-stats-sync');
		const plan = await waitForJob(request, id);
		expect(plan.state).toBe('COMPLETED');
		// alpha, beta, tempura, down
		expect(resultOf(plan)).toEqual({ enqueued: 4 });

		await expect
			.poll(async () => (await listJobs(request, 'SyncInstanceBatch')).map(job => job.state), { timeout: 300_000, intervals: [1_000] })
			.toEqual(['COMPLETED']);

		const [batch] = await listJobs(request, 'SyncInstanceBatch');
		expect(batch && resultOf(batch)).toEqual({ synced: 4, retried: [] });
	});

	test('おすすめスコアをGitHubの最新リリースを基準に計算する', async ({ request }) => {
		const { id } = await triggerSchedule(request, 'sync-recommendation-scores');
		const job = await waitForJob(request, id);
		expect(job.state).toBe('COMPLETED');

		const result = resultOf<{ updated: number; latestVersion: string | null }>(job);
		expect(result.updated).toBe(3);
		expect(result.latestVersion).toMatch(/^\d{4}\.\d{1,2}\.\d+$/);
	});

	test('JoinMisskeyのignorehostsを除外リストへ取り込む', async ({ request }) => {
		const { id } = await triggerSchedule(request, 'sync-exclusions');
		const job = await waitForJob(request, id);
		expect(job.state).toBe('COMPLETED');

		const result = resultOf<{ additions: number; deletions: number }>(job);
		expect(result.additions).toBeGreaterThan(0);
		expect(result.deletions).toBe(0);
	});
});

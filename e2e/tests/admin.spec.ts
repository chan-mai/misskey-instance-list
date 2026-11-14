// 管理画面の認可と除外ホスト管理
import { expect, test } from '@playwright/test';
import { ADMIN_STATE, HOSTS, loginWithZitadel } from './support';

test.describe('未ログイン', () => {
	test('管理APIは401を返す', async ({ request }) => {
		for (const path of ['/api/admin/stats', '/api/admin/exclusions']) {
			const res = await request.get(path);
			expect(res.status(), path).toBe(401);
		}
		const crawl = await request.post('/api/admin/crawl', { data: { domain: HOSTS.alpha } });
		expect(crawl.status()).toBe(401);
	});

	test('管理ページはZITADELのログインへ遷移する', async ({ page }) => {
		await page.goto('/admin/excluded-hosts');
		await expect(page).toHaveURL(/zitadel\.mil-e2e\.test\/ui\/v2\/login/);
	});
});

test('Adminロールの無いユーザーは403になる', async ({ page }) => {
	await page.goto('/admin');
	await loginWithZitadel(page, 'mil-viewer');

	await expect(page.getByText("Forbidden: 'Admin' role is required")).toBeVisible({ timeout: 30_000 });
	const res = await page.request.get('/api/admin/stats');
	expect(res.status()).toBe(403);
});

test.describe('管理者', () => {
	test.use({ storageState: ADMIN_STATE });

	test('ダッシュボードに件数を表示する', async ({ page }) => {
		await page.goto('/admin');
		await expect(page.getByText('Active / Known Instances').locator('..')).toContainText('3 / 5');
		await expect(page.getByText('System: 3')).toBeVisible();
		await expect(page.getByText('Manual: 0')).toBeVisible();
		await expect(page.getByText(/JoinMisskey: [1-9]/)).toBeVisible();
	});

	test('sourceと検索語で自動除外のホストを抽出し, 操作不可にする', async ({ page }) => {
		await page.goto('/admin/excluded-hosts');
		await page.getByRole('combobox').selectOption('system');

		const rows = page.getByRole('row').filter({ has: page.getByRole('cell') });
		await expect(rows).toHaveCount(3);
		for (const host of [HOSTS.cherrypick, HOSTS.gts, HOSTS.spoof]) {
			const row = rows.filter({ hasText: host });
			await expect(row).toContainText('system');
			await expect(row).toContainText('操作不可');
			await expect(row.getByRole('cell').nth(3)).toHaveText(/\d{4}\/\d{1,2}\/\d{1,2} \d{1,2}:\d{2}:\d{2}/);
		}

		await page.getByPlaceholder('ドメインまたは理由で検索...').fill('Spoofing');
		await expect(rows).toHaveCount(1);
		await expect(rows).toContainText(HOSTS.spoof);
	});

	const MANUAL_DOMAIN = 'manual.mil-e2e.test';

	// 途中失敗時も後続の件数検証へ残さない
	test.afterEach(async ({ request }) => {
		const res = await request.delete(`/api/admin/exclusions/${MANUAL_DOMAIN}`);
		expect([200, 404]).toContain(res.status());
	});

	test('手動除外を追加, 編集, 削除する', async ({ page }) => {
		const domain = MANUAL_DOMAIN;
		page.on('dialog', dialog => dialog.accept());

		await page.goto('/admin/excluded-hosts');
		await page.getByRole('combobox').selectOption('manual');
		const rows = page.getByRole('row').filter({ hasText: domain });

		await page.getByRole('button', { name: 'Add' }).click();
		const modal = page.locator('dialog');
		await modal.getByPlaceholder('example.com').fill(domain.toUpperCase());
		await modal.getByPlaceholder('除外する理由を入力してください...').fill('E2E added');
		await modal.getByRole('button', { name: '保存' }).click();

		// ドメインは正規化して保存
		await expect(rows).toHaveCount(1);
		await expect(rows).toContainText('E2E added');
		await expect(rows).toContainText('manual');

		// 重複登録
		await page.getByRole('button', { name: 'Add' }).click();
		await modal.getByPlaceholder('example.com').fill(domain);
		await modal.getByRole('button', { name: '保存' }).click();
		await expect(modal.getByText('Domain is already excluded')).toBeVisible();
		await modal.getByRole('button', { name: 'キャンセル' }).click();

		await rows.getByTitle('編集').click();
		await expect(modal.getByPlaceholder('example.com')).toBeDisabled();
		await modal.getByPlaceholder('除外する理由を入力してください...').fill('E2E edited');
		await modal.getByRole('button', { name: '保存' }).click();
		await expect(rows).toContainText('E2E edited');

		await rows.getByTitle('削除').click();
		await expect(rows).toHaveCount(0);

		const res = await page.request.get(`/api/admin/exclusions?search=${domain}`);
		expect((await res.json()).total).toBe(0);
	});

	test('除外APIは入力を検証する', async ({ page }) => {
		const invalid = await page.request.post('/api/admin/exclusions', { data: { domain: 'not a domain' } });
		expect(invalid.status()).toBe(400);
		expect((await invalid.json()).statusMessage).toBe('domain: Invalid domain format');

		const empty = await page.request.patch(`/api/admin/exclusions/${HOSTS.cherrypick}`, { data: { reason: '   ' } });
		expect(empty.status()).toBe(400);
		expect((await empty.json()).statusMessage).toBe('reason: Reason cannot be empty');

		const missing = await page.request.delete('/api/admin/exclusions/absent.mil-e2e.test');
		expect(missing.status()).toBe(404);
	});
});

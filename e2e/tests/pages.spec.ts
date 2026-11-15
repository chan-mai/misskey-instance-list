// クロール済みデータでの公開ページ表示
import { expect, test } from '@playwright/test';
import { HOSTS } from './support';

const card = (page: import('@playwright/test').Page, name: string) =>
	page.getByRole('link').filter({ has: page.getByRole('heading', { name }) });

test('トップページに集計値表示, 一覧へ遷移', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: /Find Your\s*Misskey Server/ })).toBeVisible();

	// ページ下部のCTAに同一集計値, 先頭のheroに限定
	const hero = page.locator('section').first();
	const statOf = (label: string) => hero.locator('p', { hasText: new RegExp(`^${label}$`) }).locator('xpath=preceding-sibling::p[1]');
	await expect(statOf('Active')).toHaveText('3');
	await expect(statOf('Known')).toHaveText('5');
	await expect(statOf('Software')).toHaveText('2');
	await expect(statOf('Languages')).toHaveText('2');

	await hero.getByRole('link', { name: 'サーバーを見つける' }).click();
	await expect(page).toHaveURL('/servers');
});

test.describe('サーバ一覧', () => {
	test('稼働中サーバをおすすめ順にカード表示, 除外フォーク非表示', async ({ page }) => {
		const api = await (await page.request.get('/api/v1/instances', { params: { search: HOSTS.alpha } })).json();
		await page.goto('/servers');

		const cards = page.getByRole('link').filter({ has: page.getByRole('heading', { level: 3 }) });
		await expect(cards.getByRole('heading')).toHaveText(['Alpha E2E', 'Beta E2E', 'Tempura E2E']);

		const alpha = card(page, 'Alpha E2E');
		await expect(alpha).toHaveAttribute('href', `https://${HOSTS.alpha}`);
		await expect(alpha).toContainText(HOSTS.alpha);
		await expect(alpha).toContainText('(v2026.11.0)');
		await expect(alpha.getByTitle('Users')).toHaveText(String(api.items[0].users_count));
		await expect(alpha.getByTitle('Notes')).toHaveText(String(api.items[0].notes_count));
		await expect(alpha.getByTitle('Language')).toHaveText('日本語 (ja)');
		await expect(alpha.getByTitle('Online')).toBeVisible();
		await expect(alpha).toContainText('E2Eテスト用のMisskeyサーバです。日本語で運営しています。');
		// 説明文はSSRのHTMLに出力
		expect(await (await page.request.get('/servers')).text()).toContain('E2Eテスト用のMisskeyサーバです。日本語で運営しています。');

		const beta = card(page, 'Beta E2E');
		await expect(beta.getByTitle('Language')).toHaveText('英語 (en)');
		await expect(beta).toContainText('An English speaking Misskey server for end to end tests.');

		const tempura = card(page, 'Tempura E2E');
		await expect(tempura).toContainText('(v2026.11.0-tempura-2.0.24)');
		await expect(tempura).toContainText('misskey-tempuraで動いているサーバです。');

		await expect(page.getByRole('heading', { name: 'CherryPick E2E' })).toHaveCount(0);
	});

	test('URLクエリの条件で一覧抽出', async ({ page }) => {
		const cases: [string, string[]][] = [
			['language=en', ['Beta E2E']],
			['language=ja', ['Alpha E2E', 'Tempura E2E']],
			['ipStack=dual', ['Alpha E2E']],
			['ipStack=v4', ['Beta E2E', 'Tempura E2E']],
			['openRegistrations=false', ['Beta E2E']],
			['repository=official', ['Alpha E2E', 'Beta E2E']],
			['q=tempura', ['Tempura E2E']],
			['order=asc', ['Beta E2E', 'Tempura E2E', 'Alpha E2E']],
		];
		for (const [query, names] of cases) {
			await page.goto(`/servers?${query}`);
			const headings = page.getByRole('link').getByRole('heading', { level: 3 });
			await expect(headings, query).toHaveText(names);
		}
	});

	test('フィルタで検索語/並び順変更, URLへ反映', async ({ page }) => {
		await page.goto('/servers');
		await page.getByRole('button', { name: 'FILTERS' }).click();

		const drawer = page
			.locator('div')
			.filter({ has: page.getByRole('heading', { name: 'FILTERS' }) })
			.filter({ has: page.getByPlaceholder('サーバー名...') })
			.last();
		const searchBox = drawer.getByPlaceholder('サーバー名...');
		// 入力欄右隣の検索ボタン
		const searchButton = searchBox.locator('xpath=following::button[1]');
		await searchBox.fill('Beta');
		await searchButton.click();
		await expect(page).toHaveURL(/q=beta/);
		await expect(page.getByRole('link').getByRole('heading', { level: 3 })).toHaveText(['Beta E2E']);

		await searchBox.fill('');
		await searchButton.click();
		await expect(page.getByRole('link').getByRole('heading', { level: 3 })).toHaveText(['Alpha E2E', 'Beta E2E', 'Tempura E2E']);

		await drawer.getByTitle('降順').click();
		await expect(page).toHaveURL(/order=asc/);
		await expect(page.getByRole('link').getByRole('heading', { level: 3 })).toHaveText(['Beta E2E', 'Tempura E2E', 'Alpha E2E']);
	});
});

test.describe('統計ページ', () => {
	test('集計値/IPスタック割合/レポジトリ分布表示', async ({ page }) => {
		await page.goto('/stats');

		// 集計値の大きな数値を含むタイル
		const tile = (label: string) =>
			page
				.locator('button, div')
				.filter({ has: page.getByText(label, { exact: true }) })
				.filter({ has: page.locator('p[class*="text-3xl"]') })
				.last();
		await expect(tile('Active Servers')).toContainText('3');
		await expect(tile('Total Known')).toContainText('5');
		await expect(tile('Dual Stack')).toContainText('33.3% · IPv4 + IPv6');
		await expect(tile('IPv4')).toContainText('66.7% · IPv4 only');
		await expect(tile('Unknown')).toContainText('0.0% · Not checked yet');

		const official = page.getByRole('link', { name: /misskey-dev\/misskey/ });
		await expect(official).toHaveAttribute('href', 'https://github.com/misskey-dev/misskey');
		await expect(official).toContainText('66.7%');
		const tempura = page.getByRole('link', { name: /lqvp\/misskey-tempura/ });
		await expect(tempura).toHaveAttribute('href', 'https://github.com/lqvp/misskey-tempura');
		await expect(tempura).toContainText('33.3%');
	});

	test('除外ドメイン一覧を理由付きで表示', async ({ page }) => {
		await page.goto('/stats');
		await page.getByRole('button', { name: /Excluded/ }).click();

		const dialog = page.getByRole('dialog');
		await expect(dialog.getByText('Excluded Domains')).toBeVisible();
		await expect(dialog.getByText(HOSTS.cherrypick)).toBeVisible();
		await expect(dialog.getByText('Fork Repository: https://github.com/kokonect-link/cherrypick')).toBeVisible();
		await expect(dialog.getByText(HOSTS.spoof)).toBeVisible();
	});

	test('IPスタック別サーバ一覧をダイアログ表示', async ({ page }) => {
		await page.goto('/stats');
		await page.getByRole('button', { name: /Dual Stack/ }).click();

		const dialog = page.getByRole('dialog');
		await expect(dialog.getByText('Dual Stack Servers')).toBeVisible();
		await expect(dialog.getByText(HOSTS.alpha)).toBeVisible();
		await expect(dialog.getByText(HOSTS.beta)).toHaveCount(0);
	});
});

test.describe('静的ページ', () => {
	for (const path of [
		'/docs/api/v1',
		'/docs/api/v1/instances',
		'/docs/api/v1/stats',
		'/docs/api/v1/exclusions',
		'/docs/api/v1/check',
		'/privacy',
	]) {
		test(`${path}は200でフッター表示`, async ({ page }) => {
			const res = await page.goto(path);
			expect(res?.status()).toBe(200);
			await expect(page.getByRole('contentinfo')).toContainText(/© 2025-\d{4}/);
		});
	}

	test('存在しないページは404', async ({ page }) => {
		const res = await page.goto('/no-such-page');
		expect(res?.status()).toBe(404);
	});

	test('本番以外ホストにnoindex付与', async ({ request }) => {
		const res = await request.get('/');
		expect(res.headers()['x-robots-tag']).toBe('noindex, nofollow');
	});
});

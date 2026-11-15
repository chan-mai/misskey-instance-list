// クロール済みデータでの公開API応答
import { expect, test } from '@playwright/test';
import { ADMIN_STATE, HOSTS, OFFICIAL_REPOSITORY_URL } from './support';

import type { APIRequestContext, APIResponse } from '@playwright/test';

type Item = Record<string, unknown> & { host: string };

const TEMPURA_REPOSITORY_URL = 'https://github.com/lqvp/misskey-tempura';

const hostsOf = async (res: APIResponse) => {
	expect(res.status()).toBe(200);
	return ((await res.json()).items as Item[]).map(item => item.host);
};

// 各サーバが現在返す統計値, Misskeyはチャートを20分ごとにDBへ保存
const serverStats = async (request: APIRequestContext, host: string) => {
	const res = await request.post(`https://${host}/api/stats`, { data: {} });
	return (await res.json()) as { originalUsersCount: number; originalNotesCount: number };
};

test.describe('GET /api/v1/instances', () => {
	test('稼働中かつ未除外サーバを取得値/スコア付きで返却', async ({ request }) => {
		const res = await request.get('/api/v1/instances');
		const body = await res.json();

		expect(body).toMatchObject({ total: 3, limit: 30, offset: 0 });
		const byHost = new Map((body.items as Item[]).map(item => [item.host, item]));
		const items = Object.fromEntries(
			[HOSTS.alpha, HOSTS.beta, HOSTS.tempura].map(host => {
				const item = byHost.get(host);
				if (!item) throw new Error(`${host} not listed`);
				return [host, item];
			}),
		);

		expect(items[HOSTS.alpha]).toMatchObject({
			name: 'Alpha E2E',
			description: 'E2Eテスト用のMisskeyサーバです。日本語で運営しています。',
			banner_url: 'https://alpha.mil-e2e.test/banner.png',
			version: '2026.11.0',
			is_alive: true,
			suspension_state: 'none',
			open_registrations: true,
			email_required: false,
			repository_url: OFFICIAL_REPOSITORY_URL,
			language: 'ja',
			ip_stack: 'dual',
		});
		expect(items[HOSTS.beta]).toMatchObject({
			name: 'Beta E2E',
			description: 'An English speaking Misskey server for end to end tests.',
			banner_url: 'https://beta.mil-e2e.test/background.png',
			version: '2026.11.0-beta.1',
			open_registrations: false,
			email_required: true,
			repository_url: OFFICIAL_REPOSITORY_URL,
			language: 'en',
			ip_stack: 'v4',
		});
		// 除外パターンに該当しないフォーク
		expect(items[HOSTS.tempura]).toMatchObject({
			name: 'Tempura E2E',
			description: 'misskey-tempuraで動いているサーバです。',
			version: '2026.11.0-tempura-2.0.24',
			open_registrations: true,
			repository_url: TEMPURA_REPOSITORY_URL,
			language: 'ja',
			ip_stack: 'v4',
		});

		for (const [host, item] of Object.entries(items)) {
			const stats = await serverStats(request, host);
			expect(item.users_count, host).toBe(stats.originalUsersCount);
			expect(item.notes_count, host).toBe(stats.originalNotesCount);
			expect(item.recommendation_score, host).toEqual(expect.any(Number));
			expect(item.created_at, host).toEqual(expect.any(Number));
			expect(item.last_check_at, host).toEqual(expect.any(Number));
		}

		// 件数同数時IPスタックで差, betaのプレリリースは最新版扱い
		expect(items[HOSTS.alpha]?.recommendation_score as number).toBeGreaterThan(items[HOSTS.beta]?.recommendation_score as number);
		expect(items[HOSTS.beta]?.recommendation_score).toBe(items[HOSTS.tempura]?.recommendation_score);
	});

	test('検索条件ごとに一致サーバのみ返却', async ({ request }) => {
		const cases: [Record<string, string>, string[]][] = [
			[{ language: 'ja' }, [HOSTS.alpha, HOSTS.tempura]],
			[{ language: 'en' }, [HOSTS.beta]],
			[{ ip_stack: 'dual' }, [HOSTS.alpha]],
			[{ ip_stack: 'v4' }, [HOSTS.beta, HOSTS.tempura]],
			[{ ip_stack: 'v6' }, []],
			[{ open_registrations: 'false' }, [HOSTS.beta]],
			[{ email_required: 'true' }, [HOSTS.beta]],
			[{ repository: 'official' }, [HOSTS.alpha, HOSTS.beta]],
			[{ repository: TEMPURA_REPOSITORY_URL }, [HOSTS.tempura]],
			[{ search: 'Beta' }, [HOSTS.beta]],
			[{ search: 'tempura.mil' }, [HOSTS.tempura]],
			[{ search: '%' }, [HOSTS.alpha, HOSTS.beta, HOSTS.tempura]],
		];

		for (const [params, expected] of cases) {
			const res = await request.get('/api/v1/instances', { params });
			expect(await hostsOf(res), JSON.stringify(params)).toEqual(expected);
		}
	});

	test('sort/order/limit/offset反映', async ({ request }) => {
		// スコア同値時ID順
		expect(await hostsOf(await request.get('/api/v1/instances', { params: { sort: 'recommended' } }))).toEqual([
			HOSTS.alpha,
			HOSTS.beta,
			HOSTS.tempura,
		]);
		expect(await hostsOf(await request.get('/api/v1/instances', { params: { sort: 'recommended', order: 'asc' } }))).toEqual([
			HOSTS.beta,
			HOSTS.tempura,
			HOSTS.alpha,
		]);

		const page2 = await request.get('/api/v1/instances', { params: { sort: 'recommended', limit: '1', offset: '1' } });
		expect(await page2.json()).toMatchObject({ total: 3, limit: 1, offset: 1, items: [{ host: HOSTS.beta }] });
	});

	test('不正パラメータは400, エラー内容返却', async ({ request }) => {
		const cases: [Record<string, string>, string][] = [
			[{ limit: '0' }, 'limit: '],
			[{ limit: '101' }, 'limit: '],
			[{ offset: '-1' }, 'offset: '],
			[{ sort: 'name' }, 'sort: '],
			[{ open_registrations: 'yes' }, 'open_registrations: Must be "true" or "false"'],
			[{ ip_stack: 'v5' }, 'ip_stack: '],
			[{ min_users: '' }, 'min_users: Must be an integer'],
		];
		for (const [params, message] of cases) {
			const res = await request.get('/api/v1/instances', { params });
			expect(res.status(), JSON.stringify(params)).toBe(400);
			expect((await res.json()).statusMessage).toContain(message);
		}
	});
});

test('GET /api/v1/statsは件数/言語/レポジトリ/IPスタック集計', async ({ request }) => {
	const res = await request.get('/api/v1/stats');
	expect(res.status()).toBe(200);
	const stats = await res.json();

	let users = 0;
	for (const host of [HOSTS.alpha, HOSTS.beta, HOSTS.tempura]) users += (await serverStats(request, host)).originalUsersCount;

	// 登録済みはalpha, beta, tempura, gone, down
	expect(stats.counts).toMatchObject({ known: 5, active: 3, users });
	expect(stats.counts.exclusions).toBeGreaterThan(3);
	expect(stats.languages).toEqual([
		{ code: 'ja', count: 2 },
		{ code: 'en', count: 1 },
	]);
	expect(stats.repositories).toEqual([
		{ url: OFFICIAL_REPOSITORY_URL, name: 'misskey-dev/misskey', description: expect.any(String), count: 2 },
		{ url: TEMPURA_REPOSITORY_URL, name: 'lqvp/misskey-tempura', description: expect.any(String), count: 1 },
	]);
	expect(stats.ip_stacks).toMatchObject({
		dual: { count: 1 },
		v6: { count: 0, users: 0 },
		v4: { count: 2 },
		unknown: { count: 0, users: 0 },
	});
});

test('GET /api/v1/exclusionsは自動除外理由付き, 掲載フォーク含まず', async ({ request }) => {
	const res = await request.get('/api/v1/exclusions');
	expect(res.status()).toBe(200);
	const exclusions = (await res.json()) as { domain: string; reason: string | null }[];

	expect(exclusions).toEqual(
		expect.arrayContaining([
			{ domain: HOSTS.cherrypick, reason: 'Fork Repository: https://github.com/kokonect-link/cherrypick' },
			{ domain: HOSTS.gts, reason: 'Not Misskey: gotosocial' },
			{ domain: HOSTS.spoof, reason: 'Spoofing: JoinMisskey=misskey, Browser=gotosocial' },
			expect.objectContaining({ reason: 'JoinMisskey: ignorehosts.yml' }),
		]),
	);
	expect(exclusions.map(e => e.domain)).not.toContain(HOSTS.tempura);
});

test.describe('GET /api/v1/check', () => {
	test('登録済みサーバはDBから返却', async ({ request }) => {
		const res = await request.get('/api/v1/check', { params: { domain: `https://${HOSTS.alpha}/about` } });
		expect(await res.json()).toMatchObject({
			is_misskey: true,
			source: 'database',
			data: {
				name: 'Alpha E2E',
				version: '2026.11.0',
				softwareName: 'misskey',
				description: 'E2Eテスト用のMisskeyサーバです。日本語で運営しています。',
				ipStack: 'dual',
			},
		});
	});

	test('自動除外サーバは除外理由返却', async ({ request }) => {
		const res = await request.get('/api/v1/check', { params: { domain: HOSTS.cherrypick } });
		expect(await res.json()).toEqual({
			is_misskey: false,
			data: null,
			reason: 'Fork Repository: https://github.com/kokonect-link/cherrypick',
			is_embeddable: false,
			source: 'database',
		});
	});

	test.describe(() => {
		test.use({ storageState: ADMIN_STATE });

		test('非稼働/未登録サーバは都度取得, DB登録無し', async ({ page }) => {
			const adminStats = async () => (await page.request.get('/api/admin/stats')).json();
			const before = await adminStats();

			const down = await page.request.get('/api/v1/check', { params: { domain: HOSTS.down } });
			expect(await down.json()).toMatchObject({ is_misskey: false, source: 'fetch', reason: 'TIMEOUT' });

			const priv = await page.request.get('/api/v1/check', { params: { domain: HOSTS.private } });
			expect(await priv.json()).toMatchObject({ is_misskey: false, source: 'fetch', reason: 'UNKNOWN' });

			expect(await adminStats()).toEqual(before);
			for (const host of [HOSTS.down, HOSTS.private]) {
				const res = await page.request.get('/api/admin/exclusions', { params: { search: host } });
				expect((await res.json()).total, host).toBe(0);
			}
		});
	});

	test('不正ドメイン指定は400', async ({ request }) => {
		const cases: [string, string][] = [
			['localhost', 'Localhost addresses are not allowed'],
			['exa mple.com', 'Domain parameter contains invalid characters'],
			['', 'Domain parameter is required'],
		];
		for (const [domain, message] of cases) {
			const res = await request.get('/api/v1/check', { params: { domain } });
			expect(res.status(), domain).toBe(400);
			expect((await res.json()).statusMessage).toContain(message);
		}
	});
});

test('GET /api/healthはstatusとISO時刻返却', async ({ request }) => {
	const res = await request.get('/api/health');
	const body = await res.json();
	expect(body.status).toBe('ok');
	expect(body.time).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
});

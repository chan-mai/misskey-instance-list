import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	// 共有DBへの書き込み順序固定
	fullyParallel: false,
	workers: 1,
	forbidOnly: !!process.env.CI,
	retries: 0,
	timeout: 60_000,
	reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
	outputDir: 'test-results',
	use: {
		baseURL: 'https://web.mil-e2e.test',
		ignoreHTTPSErrors: true,
		locale: 'ja-JP',
		timezoneId: 'Asia/Tokyo',
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
	},
	projects: [
		{ name: 'crawl', testMatch: 'crawl.setup.ts', timeout: 600_000 },
		{ name: 'e2e', testIgnore: 'crawl.setup.ts', dependencies: ['crawl'] },
	],
});

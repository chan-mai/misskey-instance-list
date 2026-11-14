import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig(async () => {
	const migrations = await readD1Migrations('./drizzle');

	return {
		test: {
			projects: [
				{
					plugins: [
						cloudflareTest({
							// 本番Workerと同じ実行環境
							miniflare: {
								compatibilityDate: '2026-07-15',
								compatibilityFlags: ['nodejs_compat', 'temporal'],
								d1Databases: ['DB'],
								bindings: { TEST_MIGRATIONS: migrations },
							},
						}),
					],
					test: {
						name: 'workers',
						include: ['test/**/*.test.ts'],
						exclude: ['test/lang.test.ts'],
						setupFiles: ['./test/setup.ts'],
					},
				},
				// eldの辞書(4.4MB)の動的importでテスト用workerが終了, workerd上の判定はE2Eで確認
				{
					test: {
						name: 'node',
						include: ['test/lang.test.ts'],
						environment: 'node',
					},
				},
			],
		},
	};
});

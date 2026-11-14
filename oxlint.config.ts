import { defineOxlintConfig } from '@chan-mai/oxc-config';

export default defineOxlintConfig({
	features: {
		nuxt: true,
		vitest: true,
		workers: { entry: ['**/src/index.{ts,js}', 'e2e/app/agent-entry.ts'] },
	},
	overrides: {
		ignorePatterns: ['**/dist/**', '**/.nuxt/**', '**/.output/**', '**/.wrangler/**', '**/generated/**'],
		overrides: [
			// coreはフレームワーク非依存を維持する
			{
				files: ['packages/core/**/*.ts'],
				rules: {
					'no-restricted-imports': [
						'error',
						{
							paths: ['h3', 'nitropack', 'hono', '#imports', 'nuxt', 'vue'],
							patterns: ['#*', 'nuxt/*', 'nitropack/*'],
						},
					],
				},
			},
		],
	},
});

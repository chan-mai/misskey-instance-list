import { defineOxlintConfig } from '@chan-mai/oxc-config';

export default defineOxlintConfig({
	features: {
		nuxt: true,
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

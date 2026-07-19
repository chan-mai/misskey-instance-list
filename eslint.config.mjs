import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';

const sharedTsRules = {
  'semi': ['error', 'always'],
  'quotes': [2, 'single'],
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
};

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/node_modules/**',
      '**/generated/**',
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
    },
    rules: {
      ...sharedTsRules,
      'space-before-blocks': [2, 'always'],
      'space-before-function-paren': [2, 'never'],
      'space-in-parens': [2, 'never'],
    },
  },
  // サーバーサイドはNode, クライアントのみbrowser
  {
    files: ['packages/core/**/*.ts', 'packages/agent/**/*.ts', 'packages/web/server/**/*.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['packages/web/app/**/*.{ts,vue}', 'packages/web/app.vue'],
    languageOptions: { globals: globals.browser },
  },
  // coreはフレームワーク非依存を維持する
  {
    files: ['packages/core/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        paths: ['h3', 'nitropack', 'hono', '#imports', 'nuxt', 'vue'],
        patterns: ['#*', 'nuxt/*', 'nitropack/*'],
      }],
    },
  },
  {
    files: ['**/*.vue'],
    extends: [...tseslint.configs.recommended],
    plugins: { vue: pluginVue },
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: globals.browser,
    },
    rules: {
      ...pluginVue.configs['flat/recommended'].rules,
      ...sharedTsRules,
    },
  }
);

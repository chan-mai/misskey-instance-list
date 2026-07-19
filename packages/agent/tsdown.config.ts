import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  platform: 'node',
  target: 'node24',
  // ネイティブバインディングやランタイムアセットを持つものはバンドルせず外に出す
  external: [
    '@prisma/client',
    '@prisma/adapter-pg',
    'pg',
    '@google-cloud/tasks',
    'eld',
    'franc',
    'tinyld',
    'iso-639-3',
  ],
});

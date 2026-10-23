import { defineConfig } from 'drizzle-kit';

// マイグレーションの適用はwrangler d1 migrations applyが行うため, ここは生成専用
export default defineConfig({
  dialect: 'sqlite',
  schema: './src/entity/schema.ts',
  out: './drizzle',
});

import { defineConfig, env } from 'prisma/config';
import { fileURLToPath } from 'node:url';

// .envはworkspaceルートに置くため, パッケージのcwdからは自動で拾われない
// CI/Docker等では環境変数が直接注入されるので, 見つからなくても無視する
try {
  process.loadEnvFile(fileURLToPath(new URL('../../.env', import.meta.url)));
} catch {
  // .envなし
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});

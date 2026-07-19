import { prisma } from '@mil/core/db';
import type { CrawlContext } from '@mil/core/crawl';

export interface AgentConfig {
  taskSecret: string;
  githubToken?: string;
  gcpProjectId?: string;
  gcpRegion: string;
  /** 自身のCloud RunサービスURL, ワーカーエンドポイントのenqueue先になる */
  serviceUrl?: string;
  serviceAccountEmail?: string;
  serviceName?: string;
  port: number;
}

/** enqueueに必要な項目が揃ったAgentConfig */
export type EnqueueableConfig = AgentConfig &
  Required<Pick<AgentConfig, 'gcpProjectId' | 'serviceUrl' | 'serviceName'>>;

const required = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

/**
 * 環境変数から設定を組み立てる
 *
 * TASK_SECRETは認証に使うため起動時に必須とする。
 * GCP系はenqueue時にのみ必要なので, ローカルでworkersだけ叩く用途では未設定でも起動できる。
 */
export const loadConfig = (): AgentConfig => ({
  taskSecret: required('TASK_SECRET'),
  githubToken: process.env.GITHUB_TOKEN,
  gcpProjectId: process.env.GCP_PROJECT_ID?.trim(),
  gcpRegion: process.env.GCP_REGION?.trim() || 'asia-northeast1',
  serviceUrl: process.env.SERVICE_URL?.trim(),
  serviceAccountEmail: process.env.SERVICE_ACCOUNT_EMAIL,
  serviceName: process.env.SERVICE_NAME?.trim(),
  // Cloud RunはPORTを注入するため, 既定値はローカル用(webの3000と衝突しない番号)
  port: Number(process.env.PORT) || 3001,
});

/**
 * enqueueに必要な設定が揃っているか検証する
 *
 * serviceUrlをリクエストから推測するフォールバックは持たない。
 * 設定漏れを隠して誤ったURLへenqueueするより, ここで落とす方が安全なため。
 */
export const assertEnqueueable = (config: AgentConfig): EnqueueableConfig => {
  const missing = (['gcpProjectId', 'serviceUrl', 'serviceName'] as const)
    .filter((key) => !config[key]);

  if (missing.length > 0) {
    const envNames = { gcpProjectId: 'GCP_PROJECT_ID', serviceUrl: 'SERVICE_URL', serviceName: 'SERVICE_NAME' };
    throw new Error(
      `Cloud Tasks configuration missing: ${missing.map((k) => envNames[k]).join(', ')}`
    );
  }

  return config as EnqueueableConfig;
};

export const createCrawlContext = (config?: Pick<AgentConfig, 'githubToken'>): CrawlContext => ({
  prisma,
  githubToken: config?.githubToken ?? process.env.GITHUB_TOKEN,
});

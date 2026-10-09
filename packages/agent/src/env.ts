import type { RunControl, SchedulerControl, TsumugiJobShard } from 'tsumugi';

export interface Env {
  // アプリ本体のD1
  DB: D1Database;
  // GitHub APIのレート制限緩和用トークン
  GITHUB_TOKEN?: string;
  // 統計同期の実行間隔, 起点はUNIXエポック, 未設定時はcron通り
  STATS_SYNC_INTERVAL_HOURS?: string;

  // ジョブの調停役
  JOB_SHARD: DurableObjectNamespace<TsumugiJobShard>;
  // Flowのrun実行
  RUN: DurableObjectNamespace<RunControl>;
  // 定期実行の発火役
  SCHEDULER: DurableObjectNamespace<SchedulerControl>;
  // Tsumugiの読み取りモデル用D1
  TSUMUGI_DB: D1Database;
  TSUMUGI_QUEUE: Queue;
  TSUMUGI_METRICS?: AnalyticsEngineDataset;

  // `<team>.cloudflareaccess.com`のteam部分
  CF_ACCESS_TEAM_DOMAIN: string;
  // Accessアプリケーションのaudience tag
  CF_ACCESS_AUD: string;
}

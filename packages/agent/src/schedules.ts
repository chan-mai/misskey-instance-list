import type { ScheduleContext } from 'tsumugi';

// cron式は5フィールド(分 時 日 月 曜日)のUTC分精度
export const SCHEDULES = {
  'discover-instances': {
    binding: 'DiscoverInstances',
    payload: {},
    cron: '0 0 * * *',
    maxAttempts: 2,
    timeoutMs: 180_000,
  },
  'sync-exclusions': {
    binding: 'SyncExclusions',
    payload: {},
    cron: '0 0 * * *',
    maxAttempts: 3,
    timeoutMs: 120_000,
  },
  'plan-stats-sync': {
    binding: 'PlanStatsSync',
    payload: ({ scheduledAt }: ScheduleContext) => ({ scheduledAt }),
    cron: '0 */6 * * *',
    maxAttempts: 3,
    timeoutMs: 300_000,
  },
  'sync-recommendation-scores': {
    binding: 'SyncRecommendationScores',
    payload: {},
    cron: '0 */12 * * *',
    maxAttempts: 3,
    timeoutMs: 300_000,
  },
  'update-instances': {
    flow: 'UPDATE_INSTANCES',
    input: ({ scheduledAt }: ScheduleContext) => ({ scheduledAt, limit: 100 }),
    cron: '0 */12 * * *',
  },
} as const;

import { createFlow } from 'tsumugi';
import * as performers from './performers/index.js';

const flow = createFlow(performers);

export interface UpdateInstancesInput {
  scheduledAt: number;
  limit?: number;
}

export const FLOWS = {
  UPDATE_INSTANCES: flow<UpdateInstancesInput>((f) => {
    const list = f.node('list', 'ListUpdateTargets', {
      input: (i) => ({ scheduledAt: i.scheduledAt, limit: i.limit }),
      maxAttempts: 3,
      timeoutMs: 300_000,
    });

    f.fanOut('sync', 'SyncInstance', {
      after: { list },
      over: (_i, d) => d.list.hosts,
      input: (host, i) => ({ host, scheduledAt: i.scheduledAt, withLanguage: false }),
      concurrencyKey: (host) => host,
      maxAttempts: 2,
      timeoutMs: 120_000,
      backoff: { kind: 'exponential', baseMs: 30_000, factor: 4, maxMs: 600_000, jitter: true },
    });
  }),
};

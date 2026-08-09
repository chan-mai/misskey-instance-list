import { defineTsumugi } from 'tsumugi';
import { ui } from 'tsumugi/ui';
import { accessAuth } from './auth.js';
import { BINDINGS } from './bindings.js';
import { SCHEDULES } from './schedules.js';
import * as performers from './performers/index.js';
import type { Env } from './env.js';

export * from './performers/index.js';

const tsumugi = defineTsumugi({
  performers,
  schedules: SCHEDULES,
  bindings: BINDINGS,
  auth: accessAuth,
  ui: ui(),
  retention: { olderThanMs: 3 * 24 * 60 * 60 * 1000, limit: 2_000 },
});

export { TsumugiJobShard } from 'tsumugi';
export class TsumugiScheduler extends tsumugi.schedulerClass {}

export default tsumugi satisfies ExportedHandler<Env>;

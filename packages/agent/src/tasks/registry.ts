import type { TaskDefinition } from './define.js';
import update from './update.js';
import discovery from './discovery.js';
import syncStats from './sync/stats.js';
import syncRecommendationScores from './sync/recommendation-scores.js';
import syncExclusions from './sync/exclusions.js';

export type { TaskContext, TaskDefinition } from './define.js';
export { defineTask } from './define.js';

export const TASKS = {
  'update': update,
  'discovery': discovery,
  'sync:stats': syncStats,
  'sync:recommendation-scores': syncRecommendationScores,
  'sync:exclusions': syncExclusions,
} satisfies Record<string, TaskDefinition>;

export type TaskName = keyof typeof TASKS;

export const VALID_TASKS = Object.keys(TASKS) as TaskName[];

export const isValidTask = (name: string): name is TaskName =>
  Object.hasOwn(TASKS, name);

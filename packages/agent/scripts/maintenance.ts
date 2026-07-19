import { prisma } from '@mil/core/db';
import { createCrawlContext } from '../src/config.js';
import { TASKS, type TaskContext, type TaskName } from '../src/tasks/registry.js';

/**
 * タスクをHTTPを介さず直接回すメンテナンス用スクリプト
 *
 * `pnpm --filter @mil/agent maintenance` で実行する。
 * Cloud Tasksを経由しないため, GCP関連の環境変数は不要 (DATABASE_URLのみ必須)。
 */

const buildContext = (): TaskContext => ({
  ...createCrawlContext(),
  runTask: (name: TaskName) => TASKS[name].run(buildContext()),
});

const ITERATIONS = Number(process.env.ITERATIONS) || 3;
const SEQUENCE: TaskName[] = ['update', 'discovery', 'sync:stats'];

async function runMaintenance() {
  console.log('--- STARTING EMERGENCY MAINTENANCE ---');

  for (let i = 1; i <= ITERATIONS; i++) {
    console.log(`\n=== Iteration ${i}/${ITERATIONS} ===`);

    for (const name of SEQUENCE) {
      console.log(`[Task: ${name}] Starting...`);
      try {
        const res = await TASKS[name].run(buildContext());
        console.log(`[Task: ${name}] Result:`, res);
      } catch (e) {
        console.error(`[Task: ${name}] Failed:`, e);
      }
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n--- MAINTENANCE COMPLETE ---');
}

runMaintenance()
  .catch(console.error)
  .finally(async() => {
    await prisma.$disconnect();
  });

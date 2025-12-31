import { createJiti } from 'jiti';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize jiti with aliases
const jiti = createJiti(import.meta.url, {
  alias: {
    '~~': __dirname,
    '~': __dirname,
    '@': __dirname,
  }
});

import { prisma } from './server/utils/prisma';

// Mock defineTask to allow importing task files directly
globalThis.defineTask = (config) => config;
globalThis.useRuntimeConfig = () => ({
  githubToken: process.env.GITHUB_TOKEN,
  database_url: process.env.DATABASE_URL,
  taskSecret: process.env.TASK_SECRET
});

async function runMaintenance() {
  console.log('--- STARTING EMERGENCY MAINTENANCE ---');
  
  // Load tasks using jiti to resolve aliases
  console.log('Loading tasks...');
  const updateTask = (await jiti.import('./server/tasks/update') as any).default;
  const statsTask = (await jiti.import('./server/tasks/sync/stats') as any).default;
  const discoveryTask = (await jiti.import('./server/tasks/discovery') as any).default;

  const ITERATIONS = 3;

  for (let i = 1; i <= ITERATIONS; i++) {
    console.log(`\n=== Iteration ${i}/${ITERATIONS} ===`);

    console.log('[Task: Update] Starting...');
    try {
        const res = await updateTask.run();
        console.log('[Task: Update] Result:', res);
    } catch (e) {
        console.error('[Task: Update] Failed:', e);
    }

    console.log('[Task: Discovery] Starting...');
    try {
        const res = await discoveryTask.run();
        console.log('[Task: Discovery] Result:', res);
    } catch (e) {
        console.error('[Task: Discovery] Failed:', e);
    }

    console.log('[Task: Sync Stats] Starting...');
    try {
        const res = await statsTask.run();
        console.log('[Task: Sync Stats] Result:', res);
    } catch (e) {
        console.error('[Task: Sync Stats] Failed:', e);
    }
    
    // Slight pause between iterations
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n--- MAINTENANCE COMPLETE ---');
}

runMaintenance()
  .catch(console.error)
  .finally(async() => {
    await prisma.$disconnect();
  });

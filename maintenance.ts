
import { prisma } from './server/utils/prisma';

// Mock defineTask to allow importing task files directly in this script
globalThis.defineTask = (config) => config;
globalThis.useRuntimeConfig = () => ({
  githubToken: process.env.GITHUB_TOKEN,
  database_url: process.env.DATABASE_URL,
  taskSecret: process.env.TASK_SECRET
});

async function runMaintenance() {
  console.log('--- STARTING EMERGENCY MAINTENANCE ---');
  
  // Dynamic imports to load tasks after defineTask is mocked
  // We need to use valid relative paths. 
  // tsx runs from root, so ./server/...
  
  // Note: We are importing the default export which is the task config object
  const updateTask = (await import('./server/tasks/update')).default;
  const statsTask = (await import('./server/tasks/sync/stats')).default;
  const discoveryTask = (await import('./server/tasks/discovery')).default;

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

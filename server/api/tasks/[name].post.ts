/**
 * タスク実行API
 * Cloud Schedulerから呼び出されるエンドポイント
 * 
 * POST /api/tasks/:name
 * Authorization: Bearer <TASK_SECRET>
 */
export default defineEventHandler(async(event) => {
  const config = useRuntimeConfig();
  
  // 認証チェック
  const authHeader = getHeader(event, 'authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }
  
  const token = authHeader.slice(7);
  // .trim() is important to handle newline characters in secret
  if (token !== config.taskSecret?.trim()) {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }
  
  
  // タスク名取得
  const taskName = getRouterParam(event, 'name');
  if (!taskName) {
    throw createError({ statusCode: 400, message: 'Task name is required' });
  }
  
  // 有効なタスク名かチェック
  const validTasks = ['sync:denylist', 'sync:stats', 'display:stats', 'sync:recommendation-scores', 'discovery', 'update'];
  if (!validTasks.includes(taskName)) {
    throw createError({ statusCode: 404, message: `Task not found: ${taskName}` });
  }

  try {
    // Nitro Taskを実行
    const result = await runTask(taskName);
    
    return {
      success: true,
      task: taskName,
      result
    };
  } catch (error) {
    console.error(`Task ${taskName} failed:`, error);
    throw createError({ 
      statusCode: 500, 
      message: `Task execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
});

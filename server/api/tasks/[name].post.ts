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
  
  // デバッグログ
  console.log('[DEBUG] Task API Request:', {
    hasAuth: !!authHeader,
    configSecretSet: !!config.taskSecret,
    configSecretLength: config.taskSecret?.length
  });

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }
  
  const token = authHeader.slice(7);
  if (token !== config.taskSecret) {
    console.error('[DEBUG] Token mismatch');
    console.error(`[DEBUG] Received: ${token.substring(0,5)}... (${token.length} chars)`);
    console.error(`[DEBUG] Expected: ${config.taskSecret?.substring(0,5)}... (${config.taskSecret?.length} chars)`);
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }
  
  // タスク名取得
  const taskName = getRouterParam(event, 'name');
  if (!taskName) {
    throw createError({ statusCode: 400, message: 'Task name is required' });
  }
  
  // 有効なタスク名かチェック
  const validTasks = ['sync:denylist', 'sync:stats', 'discovery', 'update'];
  if (!validTasks.includes(taskName)) {
    throw createError({ statusCode: 404, message: `Task not found: ${taskName}` });
  }

  try {
    // Nitro Taskを実行
    // Cloud Runのタイムアウト回避のため、awaitせずに非同期実行（Fire and Forget）
    runTask(taskName).catch((e) => {
      console.error(`[Task: ${taskName}] Async execution error:`, e);
    });
    
    setResponseStatus(event, 202);
    return {
      success: true,
      task: taskName,
      result: 'Created task'
    };
  } catch (error) {
    console.error(`Task ${taskName} failed:`, error);
    throw createError({ 
      statusCode: 500, 
      message: `Task execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
});

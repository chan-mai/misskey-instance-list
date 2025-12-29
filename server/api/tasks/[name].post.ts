import { enqueueTask, VALID_TASKS } from '~~/server/utils/cloud-tasks';

/**
 * タスク実行API
 * Cloud Schedulerから呼び出されるエンドポイント
 * 
 * POST /api/tasks/:name
 * Authorization: Bearer <TASK_SECRET>
 * 
 * 注意: このエンドポイントはタスクを同期的に実行するのではなく、Cloud Tasks にキューイングするようになりました。
 * これにより、タイムアウトの問題や競合を防ぎます。
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
  if (!VALID_TASKS.includes(taskName)) {
    throw createError({ statusCode: 404, message: `Task not found: ${taskName}` });
  }

  try {
    // Cloud Tasksにキューイング
    // 即時実行のため現在時刻を指定
    console.log(`[TaskAPI] Enqueuing task: ${taskName}`);
    const result = await enqueueTask(taskName, new Date(), event);
    
    // 202 Accepted: リクエストは受理されたが、処理は完了していない
    setResponseStatus(event, 202);

    return {
      success: true,
      message: result.status === 'already_exists' ? 'Task already exists' : 'Task queued',
      task: taskName,
      status: result.status
    };
  } catch (error) {
    console.error(`Failed to enqueue task ${taskName}:`, error);
    throw createError({ 
      statusCode: 500, 
      message: `Task enqueue failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
});

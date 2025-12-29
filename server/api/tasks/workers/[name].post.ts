/**
 * Cloud Tasks ワーカーエンドポイント
 * Path: /api/tasks/workers/:name
 * 
 * Google Cloud Tasks から呼び出され、バックグラウンドジョブを実行します。
 * 
 * 認証:
 * Cloud Run は IAM を介して認証を処理します。
 * Cloud Tasks キューは、サービスアカウントによって署名された OIDC トークンを送信するように設定されています。
 * Cloud Run（認証が必要な設定の場合）は、リクエストがここに到達する前にこのトークンを検証します。
 * 
 * IAM設定については Terraform 構成を参照してください:
 * - Cloud Tasks サービスアカウントは `roles/run.invoker` を持っています
 * - Cloud Run サービスは OIDC トークンを検証します（インフラストラクチャによって処理されます）
 */
export default defineEventHandler(async(event) => {
  const taskName = getRouterParam(event, 'name');
  
  // 有効なタスクのホワイトリスト (既存のタスクと一致する必要があります)
  const validTasks = [
    'sync:denylist', 
    'sync:stats', 
    'sync:recommendation-scores', 
    'discovery', 
    'update'
  ];

  if (!taskName || !validTasks.includes(taskName)) {
    // 404 または 400 - Cloud Tasks は一般的な 4xx エラー（429 を除く）をリトライしません
    // 無効な名前の場合はリトライを停止したいためです。
    console.error(`Invalid task name requested: ${taskName}`);
    throw createError({ statusCode: 404, message: 'Invalid task name' });
  }

  const startTime = Date.now();
  console.log(`[Worker] Starting task: ${taskName}`);

  try {
    // Nitro Taskを実行
    const result = await runTask(taskName);
    
    const duration = Date.now() - startTime;
    console.log(`[Worker] Task ${taskName} completed successfully in ${duration}ms`);

    return {
      success: true,
      task: taskName,
      result
    };

  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    console.error(`[Worker] Task ${taskName} failed after ${duration}ms:`, error);
    
    // 500 を返して Cloud Tasks のリトライをトリガー
    // 機密情報が漏れないように注意
    throw createError({ 
      statusCode: 500, 
      message: 'Internal Server Error' 
    });
  }
});

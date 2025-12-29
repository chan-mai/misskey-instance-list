import { CloudTasksClient } from '@google-cloud/tasks';

const client = new CloudTasksClient();

// Terraform設定に基づくキューのマッピング
const QUEUE_MAPPING: Record<string, string> = {
  'update': 'update-queue',
  'discovery': 'discovery-queue',
  'sync:stats': 'sync-stats-queue',
  'sync:recommendation-scores': 'rec-scores-queue',
  'sync:denylist': 'sync-denylist-queue',
};

export const enqueueTask = async(taskName: string, scheduledTime: Date = new Date()) => {
  const config = useRuntimeConfig();

  // 必須設定がない場合はエラーを投げる
  if (!config.gcpProjectId || !config.serviceUrl || !config.serviceName) {
    throw new Error(`Cloud Tasks configuration missing (GCP_PROJECT_ID, SERVICE_URL, or SERVICE_NAME). Task not enqueued: ${taskName}`);
  }

  const queueNameSuffix = QUEUE_MAPPING[taskName];
  if (!queueNameSuffix) {
    throw new Error(`Unknown task name: ${taskName}`);
  }

  const project = config.gcpProjectId;
  const location = config.gcpRegion;
  const queue = `${config.serviceName}-${queueNameSuffix}`;
  
  const parent = client.queuePath(project, location, queue);
  
  // ワーカーエンドポイントのURLを構築
  const url = `${config.serviceUrl}/api/tasks/workers/${taskName}`;
  
  // 重複排除のための決定論的なタスク名
  // 形式: projects/PROJECT/locations/LOCATION/queues/QUEUE/tasks/TASK_ID
  const safeTaskName = taskName.replace(/:/g, '-');
  const timestamp = scheduledTime.getTime();
  const taskId = `${safeTaskName}-${timestamp}`;
  const name = `${parent}/tasks/${taskId}`;

  const task = {
    name, // 名前を設定することで、同じタスクを作成しようとした場合の重複排除を保証
    httpRequest: {
      httpMethod: 'POST' as const,
      url,
      oidcToken: {
        serviceAccountEmail: config.serviceAccountEmail,
        audience: config.serviceUrl, // Cloud RunサービスURL
      },
      headers: {
        'Content-Type': 'application/json',
      },
    },
    // DateをprotobufのTimestampに変換
    scheduleTime: {
      seconds: Math.floor(scheduledTime.getTime() / 1000),
    }
  };

  try {
    const [response] = await client.createTask({ parent, task });
    console.log(`Task enqueued: ${response.name}`);
    return { status: 'queued', response };
  } catch (error: unknown) {
    // タスクが既に存在する場合 (ALREADY_EXISTS) は問題なし（重複排除）
    // gRPCのエラーコード 6 は ALREADY_EXISTS
    if (error instanceof Error && 'code' in error && (error as { code: number }).code === 6) {
      console.log(`Task already exists: ${name}`);
      return { status: 'already_exists' };
    }
    console.error(`Error enqueueing task ${taskName}:`, error);
    throw error;
  }
};

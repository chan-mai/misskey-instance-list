import type { SuspensionState } from '../entity/schema.js';
import type { InstanceResult } from '../client/misskey.js';
import { resolveRepositoryInfo } from '../client/github.js';
import { markInstanceAlive, markInstanceDown } from '../repository/instances.js';
import { upsertSystemExclusionAndDeleteInstance } from '../repository/excluded-hosts.js';
import { upsertRepository } from '../repository/repositories.js';
import type { CrawlContext } from './context.js';
import { evaluateInstance } from './evaluate.js';

/**
 * インスタンスを検査し, 不合格なら除外リストへの登録とインスタンス削除まで行う
 *
 * 判定自体は`evaluateInstance`に委譲する書き込みを伴うため, 認証済みの経路
 * (クロールタスク, /api/admin/crawl)からのみ呼ぶこと認証なしの公開経路では
 * `evaluateInstance`を使う
 *
 * @param ctx - DBクライアント等の依存
 * @param host - 検査対象のホスト(ドメイン)
 */
export async function validateInstance(
  ctx: CrawlContext,
  host: string
): Promise<InstanceResult> {
  const { rejection, ...result } = await evaluateInstance(host);

  if (rejection) {
    await upsertSystemExclusionAndDeleteInstance(ctx.db, host, rejection.reason);
  }

  return result;
}

/**
 * クロール結果をinstancesへ保存
 *
 * 成功時はrepositoriesとメタデータを更新し稼働中扱い, 失敗時は410でgone, 他はsuspended
 *
 * @param res 取得結果
 * @param now last_check_atに記録する時刻
 * @param language 判定した言語
 */
export async function saveInstance(
  ctx: CrawlContext,
  id: string,
  res: InstanceResult,
  now: Date,
  language?: string | null
) {
  const { db } = ctx;
  const info = res.info;

  if (info) {
    const repoInfo = info.repositoryUrl
      ? await resolveRepositoryInfo(info.repositoryUrl, ctx.githubToken)
      : null;

    // リポジトリのリレーションを更新
    if (info.repositoryUrl && repoInfo) {
      await upsertRepository(db, {
        url: info.repositoryUrl,
        name: repoInfo.repositoryName,
        description: repoInfo.repository?.description || null,
      });
    }

    await markInstanceAlive(db, id, now, {
      node_name: info.name,
      users_count: info.users,
      notes_count: info.notes,
      version: info.version,
      banner_url: info.banner,
      icon_url: info.icon,
      language: language,
      repository_url: info.repositoryUrl && repoInfo ? info.repositoryUrl : null,
      open_registrations: info.openRegistrations,
      email_required: info.emailRequired,
      ip_stack: info.ipStack ?? null,
    });
  } else {
    // 410 -> gone (Permanent)
    // TIMEOUT/OTHER -> suspended (Temporary)
    const state: SuspensionState = res.error === 'GONE' ? 'gone' : 'suspended';
    await markInstanceDown(db, id, now, state);
  }
}

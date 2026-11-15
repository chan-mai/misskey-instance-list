import { resolveRepositoryInfo } from '../client/github.js';
import { SuspensionState } from '../entity/schema.js';
import { markInstanceAlive, markInstanceDown } from '../repository/instances.js';
import { upsertSoftwareRepository } from '../repository/software-repositories.js';
import { evaluateInstance } from './evaluate.js';
import { excludeRejectedHost } from './exclusion.js';

import type { InstanceResult } from '../client/misskey.js';
import type { CrawlContext } from './context.js';

export const DESCRIPTION_MAX_LENGTH = 1000;

// コードポイント単位で切り詰め
const truncateDescription = (description: string | undefined): string | null =>
	description ? Array.from(description).slice(0, DESCRIPTION_MAX_LENGTH).join('') : null;

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
export async function validateInstance(ctx: CrawlContext, host: string): Promise<InstanceResult> {
	const { rejection, ...result } = await evaluateInstance(host);

	if (rejection) {
		await excludeRejectedHost(ctx.db, host, rejection.reason);
	}

	return result;
}

// 失敗時は410でgone, 他はsuspended
export async function saveInstance(ctx: CrawlContext, id: string, res: InstanceResult, now: Temporal.Instant, language?: string | null) {
	const { db } = ctx;
	const info = res.info;

	if (info) {
		const repoInfo = info.repositoryUrl ? await resolveRepositoryInfo(info.repositoryUrl, ctx.githubToken) : null;
		// owner/repo形式に解析できたURLのみ保存
		const repositoryUrl = repoInfo?.repositoryName ? info.repositoryUrl : null;

		// リポジトリのリレーションを更新
		if (repositoryUrl && repoInfo) {
			await upsertSoftwareRepository(db, {
				url: repositoryUrl,
				name: repoInfo.repositoryName,
				description: repoInfo.repository?.description ?? null,
			});
		}

		await markInstanceAlive(db, id, now, {
			node_name: info.name,
			description: truncateDescription(info.description),
			users_count: info.users,
			notes_count: info.notes,
			version: info.version,
			banner_url: info.banner,
			icon_url: info.icon,
			language: language,
			repository_url: repositoryUrl,
			open_registrations: info.openRegistrations,
			email_required: info.emailRequired,
			ip_stack: info.ipStack ?? null,
		});
	} else {
		// 410 -> gone (Permanent)
		// TIMEOUT/OTHER -> suspended (Temporary)
		const state = res.error === 'GONE' ? SuspensionState.gone : SuspensionState.suspended;
		await markInstanceDown(db, id, now, state);
	}
}

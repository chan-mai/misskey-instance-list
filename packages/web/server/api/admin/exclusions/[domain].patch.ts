import { updateExclusionReason } from '@mil/core/repository';
import { domainParamSchema, exclusionPatchBodySchema } from '@mil/core/validation';
import { useDb } from '~~/server/utils/db';
import { parseOrThrow } from '~~/server/utils/validate';

/**
 * 除外理由更新API (管理者用)
 *
 * 既存の除外ホストの理由のみを更新します。
 *
 * パスパラメータ:
 * - domain: 対象ドメイン
 *
 * リクエストボディ:
 * - reason: 新しい除外理由
 *
 * @throws 400 Bad Request
 * @throws 401 Unauthorized
 * @throws 404 Not Found
 */
export default defineEventHandler(async(event) => {
  const db = useDb(event);
  const { domain } = parseOrThrow(domainParamSchema, getRouterParams(event));
  const { reason } = parseOrThrow(exclusionPatchBodySchema, await readBody(event));

  const exclusion = await updateExclusionReason(db, domain, reason);

  if (!exclusion) {
    throw createError({ statusCode: 404, statusMessage: 'Exclusion not found' });
  }

  return exclusion;
});

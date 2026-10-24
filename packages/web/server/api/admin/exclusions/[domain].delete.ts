import { deleteExclusion } from '@mil/core/repository';
import { domainParamSchema } from '@mil/core/validation';
import { useDb } from '~~/server/utils/db';
import { parseOrThrow } from '~~/server/utils/validate';

/**
 * 除外解除API (管理者用)
 *
 * 除外リストからホストを削除します。
 * これにより、次回のクロール時に再びインスタンスとして認識される可能性が出てきます。
 *
 * パスパラメータ:
 * - domain: 対象ドメイン
 *
 * @throws 400 Bad Request
 * @throws 401 Unauthorized
 * @throws 404 Not Found
 */
export default defineEventHandler(async(event) => {
  const db = useDb(event);
  const { domain } = parseOrThrow(domainParamSchema, getRouterParams(event));

  const exclusion = await deleteExclusion(db, domain);

  if (!exclusion) {
    throw createError({ statusCode: 404, statusMessage: 'Exclusion not found' });
  }

  return exclusion;
});

import { prisma } from '~~/server/utils/prisma';
import { requireAdminAuth } from '~~/server/utils/admin-basic-auth';

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
  // 管理者権限チェック
  requireAdminAuth(event);
  const domain = getRouterParam(event, 'domain');
  const body = await readBody(event);

  if (!domain) {
    throw createError({ statusCode: 400, statusMessage: 'Domain is required' });
  }

  try {
    // 理由の更新実行
    const exclusion = await prisma.excludedHost.update({
      where: { domain },
      data: {
        reason: body.reason,
      },
    });
    return exclusion;
  } catch (e: unknown) {
    // レコード不在 (P2025) のハンドリング
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((e as any).code === 'P2025') {
      throw createError({ statusCode: 404, statusMessage: 'Exclusion not found' });
    }
    throw e;
  }
});

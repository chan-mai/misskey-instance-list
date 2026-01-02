import { prisma } from '~~/server/utils/prisma';
import { requireAdminAuth } from '~~/server/utils/admin-basic-auth';

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
  // 管理者権限チェック
  requireAdminAuth(event);
  const domain = getRouterParam(event, 'domain');

  if (!domain) {
    throw createError({ statusCode: 400, statusMessage: 'Domain is required' });
  }

  try {
    // 削除実行
    const exclusion = await prisma.excludedHost.delete({
      where: { domain },
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

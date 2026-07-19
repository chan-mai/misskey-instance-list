import type { H3Event } from 'h3';
import { getUserSession } from 'nuxt-oidc-auth/runtime/server/utils/session.js';
import { ADMIN_ROLE, getSessionRoles } from '~~/shared/utils/zitadel-roles';

/**
 * 管理者権限チェックユーティリティ
 *
 * ZITADEL(OIDC)のセッションを検証し、ADMIN_ROLEのプロジェクトロールを持つかを確認します。
 *
 * @param event H3Event
 * @throws 401 Unauthorized (未ログイン, APIリクエストの場合)
 * @throws 403 Forbidden (ロール不足)
 */
export const requireAdminAuth = async(event: H3Event) => {
  // APIは常にエラーを返し, ページは未ログイン時にログインへ飛ばす
  const isApiRequest = getRequestURL(event).pathname.toLowerCase().startsWith('/api/');

  // 未ログインなら401をthrowするので, ここで捕まえて経路ごとに処理を分ける
  let session;
  try {
    session = await getUserSession(event);
  } catch {
    session = null;
  }

  if (!session) {
    if (isApiRequest) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }
    return await sendRedirect(event, '/auth/zitadel/login', 302);
  }

  if (!getSessionRoles(session).includes(ADMIN_ROLE)) {
    throw createError({
      statusCode: 403,
      statusMessage: `Forbidden: '${ADMIN_ROLE}' role is required`,
    });
  }

  return true;
};

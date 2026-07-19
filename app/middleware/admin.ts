import { ADMIN_ROLE, getSessionRoles } from '~~/shared/utils/zitadel-roles';

/**
 * /admin用ルートミドルウェア
 *
 * クライアント遷移時のUX担保が目的で, 実際の認可はサーバーミドルウェアが行う
 */
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn, user } = useOidcAuth();

  if (!loggedIn.value) {
    return navigateTo('/auth/zitadel/login', { external: true });
  }

  if (!getSessionRoles(user.value).includes(ADMIN_ROLE)) {
    throw createError({
      statusCode: 403,
      statusMessage: `Forbidden: '${ADMIN_ROLE}' role is required`,
      fatal: true,
    });
  }
});

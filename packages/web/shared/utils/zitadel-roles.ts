/**
 * ZITADELのプロジェクトロール判定
 *
 * ロールがIDトークンのclaimsとuserinfoのどちらに載るかはZITADEL側の設定次第なので、
 * サーバー・クライアント双方から同じロジックで参照できるようここに置く
 */

/** ZITADELのプロジェクトロールクレーム */
export const ZITADEL_ROLES_CLAIM = 'urn:zitadel:iam:org:project:roles';

/** /adminへのアクセスに必須となるZITADELのプロジェクトロール */
export const ADMIN_ROLE = 'Admin';

/** ロール判定に使うセッションの部分型 */
export interface RoleBearingSession {
  claims?: Record<string, unknown>;
  userInfo?: Record<string, unknown>;
}

/**
 * ロールクレームからロール名一覧を取り出す
 *
 * ZITADELの表現ゆれを吸収する:
 * - `{ Admin: { orgId: 'example.com' } }` オブジェクトマップ
 * - `[{ Admin: { orgId: 'example.com' } }]` 1要素配列に包まれた形
 * - `['Admin']` 文字列配列
 */
const collectRoleNames = (claim: unknown): string[] => {
  if (!claim) return [];
  if (typeof claim === 'string') return [claim];
  if (Array.isArray(claim)) return claim.flatMap(collectRoleNames);
  if (typeof claim === 'object') return Object.keys(claim as Record<string, unknown>);
  return [];
};

/** セッションからロール名一覧を取得, claimsとuserinfoの両方を参照 */
export const getSessionRoles = (session: RoleBearingSession | null | undefined): string[] => {
  if (!session) return [];

  return [...new Set([
    ...collectRoleNames(session.claims?.[ZITADEL_ROLES_CLAIM]),
    ...collectRoleNames(session.userInfo?.[ZITADEL_ROLES_CLAIM]),
  ])];
};

/** セッションが指定ロールを持つか */
export const hasRole = (session: RoleBearingSession | null | undefined, role: string): boolean => {
  return getSessionRoles(session).includes(role);
};

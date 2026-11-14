import { describe, expect, test } from 'vitest';
import { ADMIN_ROLE, ZITADEL_ROLES_CLAIM, getSessionRoles, hasRole } from '../shared/utils/zitadel-roles';

describe('getSessionRoles', () => {
	test.each([
		['オブジェクトマップ', { Admin: { orgId: 'example.com' }, Viewer: {} }, ['Admin', 'Viewer']],
		['1要素配列', [{ Admin: { orgId: 'example.com' } }], ['Admin']],
		['文字列配列', ['Admin', 'Viewer'], ['Admin', 'Viewer']],
		['文字列', 'Admin', ['Admin']],
		['空', undefined, []],
		['数値', 1, []],
	])('%s形式のclaim', (_label, claim, roles) => {
		expect(getSessionRoles({ claims: { [ZITADEL_ROLES_CLAIM]: claim } })).toEqual(roles);
	});

	test('claims/userInfoを重複なく併合', () => {
		expect(
			getSessionRoles({
				claims: { [ZITADEL_ROLES_CLAIM]: { Admin: {} } },
				userInfo: { [ZITADEL_ROLES_CLAIM]: { Admin: {}, Viewer: {} } },
			}),
		).toEqual(['Admin', 'Viewer']);
	});

	test('セッションなしは空', () => {
		expect(getSessionRoles(null)).toEqual([]);
		expect(getSessionRoles(undefined)).toEqual([]);
		expect(getSessionRoles({})).toEqual([]);
	});
});

test('hasRole', () => {
	const session = { userInfo: { [ZITADEL_ROLES_CLAIM]: [ADMIN_ROLE] } };
	expect(hasRole(session, ADMIN_ROLE)).toBe(true);
	expect(hasRole(session, 'Viewer')).toBe(false);
	expect(hasRole({ claims: { other: { Admin: {} } } }, ADMIN_ROLE)).toBe(false);
});

import { describe, expect, test } from 'vitest';
import { calculateRecommendationScore, getVersionScore, parseVersionToMonths } from '../src/domain/score.js';

describe('parseVersionToMonths', () => {
	test.each([
		['2025.12.0', 2025 * 12 + 12],
		['v2026.1.3', 2026 * 12 + 1],
		['2025.12.0-beta.1', 2025 * 12 + 12],
		['2025.12.0-fork', 2025 * 12 + 12],
	])('%s', (version, months) => {
		expect(parseVersionToMonths(version)).toBe(months);
	});

	test.each(['13.14.2', '12.119.2', 'latest', '', '2025.x.0'])('CalVer以外の%sはnull', version => {
		expect(parseVersionToMonths(version)).toBeNull();
	});
});

describe('getVersionScore', () => {
	test('最新版と同じか新しい場合は満点', () => {
		expect(getVersionScore('2026.11.0', '2026.11.0')).toBe(1);
		expect(getVersionScore('2026.12.0-beta.1', '2026.11.0')).toBe(1);
	});

	test('月数差で指数減衰', () => {
		expect(getVersionScore('2026.8.0', '2026.11.0')).toBeCloseTo(Math.exp(-1));
		expect(getVersionScore('2025.11.0', '2026.11.0')).toBeCloseTo(Math.exp(-4));
	});

	test('バージョン不明やCalVer以外は0', () => {
		expect(getVersionScore(null, '2026.11.0')).toBe(0);
		expect(getVersionScore('2026.11.0', null)).toBe(0);
		expect(getVersionScore('13.14.2', '2026.11.0')).toBe(0);
	});
});

describe('calculateRecommendationScore', () => {
	const latest = '2026.11.0';

	test('全指標が上限なら100', () => {
		expect(
			calculateRecommendationScore({ users_count: 1_000_000, notes_count: 200_000_000, version: latest, ip_stack: 'dual' }, latest),
		).toBe(100);
	});

	test('上限超過は上限扱い', () => {
		expect(
			calculateRecommendationScore({ users_count: 10_000_000, notes_count: 2_000_000_000, version: latest, ip_stack: 'dual' }, latest),
		).toBe(100);
	});

	test('値なしは0', () => {
		expect(calculateRecommendationScore({ users_count: null, notes_count: null, version: null, ip_stack: null }, latest)).toBe(0);
	});

	test('IPスタックの配点はdual > v6 > v4', () => {
		const base = { users_count: 0, notes_count: 0, version: null };
		expect(calculateRecommendationScore({ ...base, ip_stack: 'dual' }, latest)).toBe(10);
		expect(calculateRecommendationScore({ ...base, ip_stack: 'v6' }, latest)).toBe(5);
		expect(calculateRecommendationScore({ ...base, ip_stack: 'v4' }, latest)).toBe(2.5);
	});

	test('バージョン配点は20点', () => {
		expect(calculateRecommendationScore({ users_count: 0, notes_count: 0, version: latest, ip_stack: null }, latest)).toBe(20);
	});

	test('負の件数は0扱い', () => {
		expect(calculateRecommendationScore({ users_count: -5, notes_count: -1, version: null, ip_stack: null }, latest)).toBe(0);
	});
});

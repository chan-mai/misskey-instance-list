import { describe, expect, test } from 'vitest';
import { useFormat } from '../app/composables/useFormat';

const { formatNumber, calculateShare, getLanguageName, formatDateTime } = useFormat();

describe('formatNumber', () => {
	test.each([
		[null, false, '-'],
		[undefined, false, '-'],
		[0, false, '0'],
		[1234567, false, '1,234,567'],
		[9999, true, '9,999'],
		[12345, true, '12.3K'],
		[1_500_000, true, '1.5M'],
	] as const)('%j (compact=%j) -> %s', (num, compact, text) => {
		expect(formatNumber(num, compact)).toBe(text);
	});
});

test.each([
	[1, 3, '33.3'],
	[3, 3, '100.0'],
	[0, 0, '0.0'],
	[5, undefined, '0.0'],
])('calculateShare(%j, %j) = %s', (count, total, share) => {
	expect(calculateShare(count, total)).toBe(share);
});

test.each([
	['ja', '日本語 (ja)'],
	['en', '英語 (en)'],
	['zz', 'ZZ'],
	[null, 'Unknown'],
	['', 'Unknown'],
])('getLanguageName(%j) = %s', (code, name) => {
	expect(getLanguageName(code)).toBe(name);
});

describe('formatDateTime', () => {
	test('epoch msを現在のロケールとタイムゾーンで表示', () => {
		const epochMs = Temporal.Instant.from('2026-11-13T12:34:56Z').epochMilliseconds;
		expect(formatDateTime(epochMs)).toBe(
			new Intl.DateTimeFormat(undefined, {
				year: 'numeric',
				month: 'numeric',
				day: 'numeric',
				hour: 'numeric',
				minute: 'numeric',
				second: 'numeric',
			}).format(epochMs),
		);
	});

	test('値なしは-', () => {
		expect(formatDateTime(null)).toBe('-');
		expect(formatDateTime(undefined)).toBe('-');
	});
});

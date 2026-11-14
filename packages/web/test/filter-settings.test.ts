import { describe, expect, test } from 'vitest';
import { loadViewMode, parseFilterQuery, toFilterQuery } from '../app/utils/filter-settings';

const DEFAULTS = {
	q: '',
	repository: '',
	language: '',
	orderBy: 'recommendedScore',
	order: 'desc',
	openRegistrations: null,
	emailRequired: null,
	ipStack: null,
	minUsers: null,
	maxUsers: null,
};

describe('parseFilterQuery', () => {
	test('空のクエリは既定値', () => {
		expect(parseFilterQuery({})).toEqual(DEFAULTS);
	});

	test('URLクエリを型変換', () => {
		expect(
			parseFilterQuery({
				q: 'misskey',
				language: 'ja',
				orderBy: 'usersCount',
				order: 'asc',
				openRegistrations: 'true',
				emailRequired: 'false',
				ipStack: 'v6',
				minUsers: '10',
				maxUsers: '100',
			}),
		).toEqual({
			...DEFAULTS,
			q: 'misskey',
			language: 'ja',
			orderBy: 'usersCount',
			order: 'asc',
			openRegistrations: true,
			emailRequired: false,
			ipStack: 'v6',
			minUsers: 10,
			maxUsers: 100,
		});
	});

	test('不正値は項目単位で既定値へ戻す', () => {
		expect(
			parseFilterQuery({
				orderBy: 'name',
				order: 'up',
				openRegistrations: 'yes',
				ipStack: 'v5',
				minUsers: '-1',
				maxUsers: '1.5',
				language: 'ja',
			}),
		).toEqual({ ...DEFAULTS, language: 'ja' });
	});

	test('配列は先頭の値', () => {
		expect(parseFilterQuery({ language: ['en', 'ja'] }).language).toBe('en');
	});

	test('空文字の件数は未指定', () => {
		expect(parseFilterQuery({ minUsers: '' }).minUsers).toBeNull();
	});
});

describe('toFilterQuery', () => {
	test('既定値は省略', () => {
		expect(toFilterQuery(parseFilterQuery({}))).toEqual({});
	});

	test('parseFilterQueryと往復しても同じ条件', () => {
		const query = {
			q: 'a',
			repository: 'official',
			language: 'ja',
			orderBy: 'createdAt',
			order: 'asc',
			openRegistrations: 'false',
			emailRequired: 'true',
			ipStack: 'dual',
			minUsers: '0',
			maxUsers: '5000',
		};
		expect(toFilterQuery(parseFilterQuery(query))).toEqual(query);
	});
});

describe('loadViewMode', () => {
	test.each([
		[JSON.stringify({ v_view: 'list' }), 'list'],
		[JSON.stringify({ v_view: 'grid' }), 'grid'],
		[JSON.stringify({ v_view: 'table' }), 'grid'],
		[JSON.stringify({}), 'grid'],
		['not json', null],
		[null, null],
		['', null],
	])('%j -> %j', (raw, mode) => {
		expect(loadViewMode(raw)).toBe(mode);
	});
});

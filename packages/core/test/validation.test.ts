import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import {
	adminExclusionsQuerySchema,
	checkQuerySchema,
	crawlBodySchema,
	exclusionCreateBodySchema,
	exclusionPatchBodySchema,
	imageQuerySchema,
	instancesQuerySchema,
} from '../src/validation/index.js';

const issueOf = (schema: v.GenericSchema, input: unknown) => {
	const result = v.safeParse(schema, input);
	expect(result.success).toBe(false);
	const [issue] = result.issues ?? [];
	if (!issue) throw new Error('issue expected');
	return `${v.getDotPath(issue) ?? ''}: ${issue.message}`;
};

describe('instancesQuerySchema', () => {
	test('省略時の既定値', () => {
		expect(v.parse(instancesQuerySchema, {})).toEqual({ sort: 'users', order: 'desc', limit: 30, offset: 0 });
	});

	test('文字列のクエリを型変換', () => {
		expect(
			v.parse(instancesQuerySchema, {
				sort: 'recommended',
				order: 'asc',
				limit: '100',
				offset: '30',
				search: 'mi%ss_key',
				open_registrations: 'true',
				email_required: 'false',
				ip_stack: 'dual',
				min_users: '0',
				max_users: '5000',
			}),
		).toEqual({
			sort: 'recommended',
			order: 'asc',
			limit: 100,
			offset: 30,
			search: 'misskey',
			open_registrations: true,
			email_required: false,
			ip_stack: 'dual',
			min_users: 0,
			max_users: 5000,
		});
	});

	test.each([
		[{ limit: '0' }, 'limit: '],
		[{ limit: '101' }, 'limit: '],
		[{ limit: '1.5' }, 'limit: Must be an integer'],
		[{ limit: '' }, 'limit: Must be an integer'],
		[{ offset: '-1' }, 'offset: '],
		[{ sort: 'name' }, 'sort: '],
		[{ order: 'up' }, 'order: '],
		[{ open_registrations: '1' }, 'open_registrations: Must be "true" or "false"'],
		[{ ip_stack: 'v5' }, 'ip_stack: '],
		[{ language: 'x'.repeat(33) }, 'language: '],
		[{ repository: 'x'.repeat(513) }, 'repository: '],
	])('%jは拒否', (input, message) => {
		expect(issueOf(instancesQuerySchema, input)).toContain(message);
	});
});

describe('checkQuerySchema', () => {
	test.each([
		['Misskey.IO', 'misskey.io'],
		[' misskey.io ', 'misskey.io'],
		['https://misskey.io/@syuilo', 'misskey.io'],
		['http://Example.com:8080/path', 'example.com'],
	])('%sからホスト名%sを取り出す', (domain, host) => {
		expect(v.parse(checkQuerySchema, { domain })).toEqual({ domain: host });
	});

	test.each([
		[{}, 'domain: Invalid key'],
		[{ domain: '' }, 'Domain parameter is required'],
		[{ domain: ['a.com', 'b.com'] }, 'Multiple domain parameters are not allowed'],
		[{ domain: 'localhost' }, 'Localhost addresses are not allowed'],
		[{ domain: '127.0.0.1' }, 'Localhost addresses are not allowed'],
		[{ domain: 'http://[::1]/' }, 'Domain parameter contains invalid characters'],
		[{ domain: 'exa mple.com' }, 'Domain parameter contains invalid characters'],
		[{ domain: 'https://' }, 'Invalid URL format'],
	])('%jは拒否', (input, message) => {
		expect(issueOf(checkQuerySchema, input)).toContain(message);
	});
});

describe('除外ホストの入力', () => {
	test('作成時はドメインを正規化しsourceの既定はmanual', () => {
		expect(v.parse(exclusionCreateBodySchema, { domain: ' Spam.Example ' })).toEqual({ domain: 'spam.example', source: 'manual' });
		expect(v.parse(exclusionCreateBodySchema, { domain: 'spam.example', reason: null, source: 'system' })).toEqual({
			domain: 'spam.example',
			reason: null,
			source: 'system',
		});
	});

	test.each([
		[{}, 'domain: Invalid key'],
		[{ domain: 'spam' }, 'domain: Invalid domain format'],
		[{ domain: 'spam.example', reason: 1 }, 'reason: Reason must be a string'],
		[{ domain: 'spam.example', reason: 'x'.repeat(501) }, 'reason: '],
		[{ domain: 'spam.example', source: 'other' }, 'source: '],
	])('作成時%jは拒否', (input, message) => {
		expect(issueOf(exclusionCreateBodySchema, input)).toContain(message);
	});

	test('更新時は理由の前後空白を除去', () => {
		expect(v.parse(exclusionPatchBodySchema, { reason: '  spam  ' })).toEqual({ reason: 'spam' });
	});

	test.each([
		[{ reason: '   ' }, 'reason: Reason cannot be empty'],
		[{ reason: 'x'.repeat(501) }, 'reason: Reason is too long (max 500 chars)'],
		[{}, 'reason: '],
	])('更新時%jは拒否', (input, message) => {
		expect(issueOf(exclusionPatchBodySchema, input)).toContain(message);
	});

	test('一覧の検索条件', () => {
		expect(v.parse(adminExclusionsQuerySchema, {})).toEqual({ page: 1, limit: 20, source: 'all' });
		expect(issueOf(adminExclusionsQuerySchema, { page: '0' })).toContain('page: ');
		expect(issueOf(adminExclusionsQuerySchema, { source: 'other' })).toContain('source: ');
	});
});

describe('その他の入力', () => {
	test('クロール対象はドメインのみ', () => {
		expect(v.parse(crawlBodySchema, { domain: 'Misskey.IO' })).toEqual({ domain: 'misskey.io' });
		expect(issueOf(crawlBodySchema, { domain: '127.0.0.1' })).toBe('domain: Invalid domain format');
	});

	test('画像プロキシはhttp(s)のURLのみ', () => {
		expect(v.parse(imageQuerySchema, { url: 'https://example.com/a.png' })).toEqual({ url: 'https://example.com/a.png' });
		expect(issueOf(imageQuerySchema, { url: 'file:///etc/passwd' })).toBe('url: Invalid URL');
		expect(issueOf(imageQuerySchema, { url: 'not a url' })).toBe('url: Invalid URL');
		expect(issueOf(imageQuerySchema, {})).toContain('url: Invalid key');
		expect(issueOf(imageQuerySchema, { url: '' })).toBe('url: URL is required');
	});
});

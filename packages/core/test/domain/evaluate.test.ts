import { describe, expect, test } from 'vitest';
import { evaluateInstance, isConfirmedNonMisskey } from '../../src/domain/evaluate.js';

describe('isConfirmedNonMisskey', () => {
	test.each([
		['Not Misskey: mastodon', true],
		['Fork Repository: https://github.com/kokonect-link/cherrypick', true],
		['Spoofing: JoinMisskey=misskey, Browser=sharkey', true],
		['not misskey: pleroma', true],
		['JoinMisskey: ignorehosts.yml', false],
		['spam', false],
		[null, false],
	])('%sは%s', (reason, expected) => {
		expect(isConfirmedNonMisskey(reason)).toBe(expected);
	});
});

describe('evaluateInstance', () => {
	test.each(['127.0.0.1', '10.0.0.1', '169.254.169.254', '::1'])('非公開アドレス%sは接続せずUNKNOWN', async host => {
		expect(await evaluateInstance(host)).toEqual({ info: null, error: 'UNKNOWN' });
	});
});

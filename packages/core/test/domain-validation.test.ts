import { describe, expect, test } from 'vitest';
import { validateDomain } from '../src/net/domain-validation.js';

describe('validateDomain', () => {
	test.each([
		['misskey.io', 'misskey.io'],
		['  Misskey.IO ', 'misskey.io'],
		['sub.domain.example.co.jp', 'sub.domain.example.co.jp'],
		['xn--r8jz45g.xn--zckzah', 'xn--r8jz45g.xn--zckzah'],
		['a-b.example', 'a-b.example'],
	])('%sは%sへ正規化', (input, normalized) => {
		expect(validateDomain(input)).toEqual({ valid: true, normalized });
	});

	test.each([
		['', 'Domain is required'],
		['localhost', 'Invalid domain format'],
		['example', 'Invalid domain format'],
		['-example.com', 'Invalid domain format'],
		['example-.com', 'Invalid domain format'],
		['exa_mple.com', 'Invalid domain format'],
		['example.com/path', 'Invalid domain format'],
		['https://example.com', 'Invalid domain format'],
		['example.c', 'Invalid domain format'],
		[`${'a'.repeat(64)}.com`, 'Invalid domain format'],
		[`${'a.'.repeat(128)}com`, 'Domain is too long (max 255 chars)'],
	])('%sは拒否', (input, error) => {
		expect(validateDomain(input)).toEqual({ valid: false, error });
	});
});

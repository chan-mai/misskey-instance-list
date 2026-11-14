import { expect, test } from 'vitest';
import { firstNonEmpty } from '../shared/utils/text';

test.each([
	[['a', 'b'], 'a'],
	[['', 'b'], 'b'],
	[[null, undefined, 0, false, {}, 'c'], 'c'],
	[[], undefined],
	[['', null], undefined],
])('firstNonEmpty(%j) = %j', (values, expected) => {
	expect(firstNonEmpty(...values)).toBe(expected);
});

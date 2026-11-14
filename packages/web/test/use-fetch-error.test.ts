import { expect, test } from 'vitest';
import { useFetchError } from '../app/composables/useFetchError';

const { getErrorMessage } = useFetchError();

test.each([
	[
		{ data: { statusMessage: 'Domain is already excluded' }, statusMessage: '', message: '[POST] "/x": 409 ' },
		'Domain is already excluded',
	],
	[{ data: null, statusMessage: 'Conflict', message: '[POST] "/x": 409 Conflict' }, 'Conflict'],
	[{ data: { statusMessage: '' }, statusMessage: '', message: '[POST] "/x": 500 ' }, '[POST] "/x": 500 '],
	[{}, 'fallback'],
	[null, 'fallback'],
	['string error', 'fallback'],
])('getErrorMessage(%j)', (error, expected) => {
	expect(getErrorMessage(error, 'fallback')).toBe(expected);
});

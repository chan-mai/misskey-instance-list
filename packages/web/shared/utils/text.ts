// string以外と空文字を除外
export const firstNonEmpty = (...values: unknown[]): string | undefined =>
	values.find((value): value is string => typeof value === 'string' && value !== '');

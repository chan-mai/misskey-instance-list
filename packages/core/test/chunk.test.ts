import { describe, expect, test } from 'vitest';
import { D1_MAX_BOUND_PARAMS, chunkForD1, clampLikeTerm } from '../src/db/chunk.js';

describe('chunkForD1', () => {
	test('列数からbindings上限内の行数で分割', () => {
		const rows = Array.from({ length: 250 }, (_, i) => i);
		const chunks = chunkForD1(rows, 5);

		expect(chunks.map(c => c.length)).toEqual([19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 3]);
		expect(chunks.flat()).toEqual(rows);
		for (const chunk of chunks) expect(chunk.length * 5).toBeLessThan(D1_MAX_BOUND_PARAMS);
	});

	test('空配列は空', () => {
		expect(chunkForD1([], 3)).toEqual([]);
	});

	test('列数上限超過時1行ずつ', () => {
		expect(chunkForD1([1, 2], 500)).toEqual([[1], [2]]);
	});

	test('列数0以下は1列扱い', () => {
		expect(
			chunkForD1(
				Array.from({ length: 100 }, (_, i) => i),
				0,
			).map(c => c.length),
		).toEqual([99, 1]);
	});
});

describe('clampLikeTerm', () => {
	test('ワイルドカードとバックスラッシュを除去', () => {
		expect(clampLikeTerm('a%b_c\\d')).toBe('abcd');
	});

	test('48バイト以内はそのまま', () => {
		expect(clampLikeTerm('a'.repeat(48))).toBe('a'.repeat(48));
	});

	test('ASCIIは48バイトで切り詰め', () => {
		expect(clampLikeTerm('a'.repeat(60))).toBe('a'.repeat(48));
	});

	test('マルチバイト文字は文字境界で切り詰め', () => {
		// 3バイトx16文字で48バイト
		expect(clampLikeTerm('あ'.repeat(20))).toBe('あ'.repeat(16));
		expect(clampLikeTerm(`a${'あ'.repeat(20)}`)).toBe(`a${'あ'.repeat(15)}`);
	});

	test('サロゲートペアを分割しない', () => {
		const result = clampLikeTerm('😀'.repeat(20));
		expect(result).toBe('😀'.repeat(12));
	});
});

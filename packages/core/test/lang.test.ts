import { describe, expect, test } from 'vitest';
import { detectLanguage, detectLanguageFromTexts } from '../src/lang/index.js';

describe('detectLanguage', () => {
	test.each([
		['こんにちは、今日はいい天気ですね', 'ja'],
		['カタカナダケノブンショウデス', 'ja'],
		['안녕하세요 오늘 날씨가 좋네요', 'ko'],
		['Привет, как дела сегодня?', 'ru'],
		['สวัสดีครับ วันนี้อากาศดี', 'th'],
		['مرحبا كيف حالك اليوم', 'ar'],
	])('文字種判定: %s -> %s', async (text, lang) => {
		expect(await detectLanguage(text)).toBe(lang);
	});

	test.each([
		['The quick brown fox jumps over the lazy dog near the river bank today.', 'en'],
		['Le renard brun rapide saute par-dessus le chien paresseux près de la rivière.', 'fr'],
		['Der schnelle braune Fuchs springt über den faulen Hund am Flussufer.', 'de'],
	])('3ライブラリ合議: %s -> %s', async (text, lang) => {
		expect(await detectLanguage(text)).toBe(lang);
	});

	test.each([null, undefined, '', '   '])('空入力%jはnull', async text => {
		expect(await detectLanguage(text)).toBeNull();
	});
});

describe('detectLanguageFromTexts', () => {
	test('得票6割以上の言語を採用', async () => {
		const texts = ['今日はいい天気です', '明日は雨が降るでしょう', 'ご飯を食べました', 'This is an English sentence for testing purposes.'];
		expect(await detectLanguageFromTexts(texts)).toBe('ja');
	});

	test('最多票6割未満時null', async () => {
		const texts = ['今日はいい天気です', '明日は雨が降るでしょう', '안녕하세요 반갑습니다', '오늘 날씨가 좋네요'];
		expect(await detectLanguageFromTexts(texts)).toBeNull();
	});

	test('全テキスト判定不能時null', async () => {
		expect(await detectLanguageFromTexts(['', null, '123456'])).toBeNull();
	});
});

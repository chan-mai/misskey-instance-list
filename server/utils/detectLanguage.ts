import { franc } from 'franc';

/**
 * テキストの言語を検出し、ISO 639-3 コードを返します。
 * 言語が確実に検出されない場合、またはテキストが空の場合は null を返します。
 *
 * @param text - 解析するテキスト
 * @returns ISO 639-3 言語コード (例: 'eng', 'jpn') または null
 */
export function detectLanguage(text: string | null | undefined): string | null {
  if (!text || text.trim().length === 0) return null;

  try {
    const langCode = franc(text, { minLength: 10 });

    // 'und' は undetermined
    if (langCode === 'und') return null;

    return langCode;
  } catch (e) {
    console.warn('Language detection failed:', e);
    return null;
  }
}

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

/**
 * 複数のテキストから言語を検出し、最も多く検出された言語を返します。
 * 投票方式により、精度を向上させます。
 *
 * @param texts - 解析するテキストの配列
 * @returns ISO 639-3 言語コード または null
 */
export function detectLanguageFromTexts(texts: (string | null | undefined)[]): string | null {
  const langCounts: Record<string, number> = {};

  for (const text of texts) {
    const lang = detectLanguage(text);
    if (lang) {
      langCounts[lang] = (langCounts[lang] || 0) + 1;
    }
  }

  // 最も多く検出された言語を返す
  let maxCount = 0;
  let result: string | null = null;
  for (const [lang, count] of Object.entries(langCounts)) {
    if (count > maxCount) {
      maxCount = count;
      result = lang;
    }
  }

  return result;
}

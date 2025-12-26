import { franc } from 'franc';

// よく誤検出される言語のブラックリスト
const LANGUAGE_BLACKLIST = ['lat', 'sco', 'ina', 'epo', 'ido'];

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
    const langCode = franc(text, { minLength: 30 });

    // 'und' は undetermined
    if (langCode === 'und') return null;

    // 偽陽性が多い言語を除外
    if (LANGUAGE_BLACKLIST.includes(langCode)) return null;

    return langCode;
  } catch (e) {
    console.warn('Language detection failed:', e);
    return null;
  }
}

/**
 * 複数のテキストから言語を検出し、最も多く検出された言語を返します。
 * スーパーマジョリティ投票（≥50%）により、精度を向上させます。
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

  // 総投票数
  const totalVotes = Object.values(langCounts).reduce((a, b) => a + b, 0);
  if (totalVotes === 0) return null;

  // 最も多く検出された言語を見つける
  let maxCount = 0;
  let result: string | null = null;
  for (const [lang, count] of Object.entries(langCounts)) {
    if (count > maxCount) {
      maxCount = count;
      result = lang;
    }
  }

  // スーパーマジョリティ（≥50%）を要求
  const threshold = totalVotes * 0.5;
  if (maxCount < threshold) return null;

  return result;
}

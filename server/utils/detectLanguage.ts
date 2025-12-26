/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="../types/eld.d.ts" />
import { detect as tinyDetect } from 'tinyld';
import { franc } from 'franc';
import { eld } from 'eld';
import { iso6393To1 } from 'iso-639-3';

/**
 * 文字種から言語を判定（高精度）
 * ひらがな/カタカナ、ハングルなどは文字だけで言語を特定可能
 */
function detectByScript(text: string): string | null {
  const total = text.replace(/\s/g, '').length;
  if (total === 0) return null;

  const hiragana = (text.match(/[\u3040-\u309F]/g) || []).length;
  const katakana = (text.match(/[\u30A0-\u30FF]/g) || []).length;
  const hangul = (text.match(/[\uAC00-\uD7AF]/g) || []).length;
  const cyrillic = (text.match(/[\u0400-\u04FF]/g) || []).length;
  const thai = (text.match(/[\u0E00-\u0E7F]/g) || []).length;
  const arabic = (text.match(/[\u0600-\u06FF]/g) || []).length;

  // 10%以上のひらがな/カタカナ → 日本語（混合言語対策）
  if ((hiragana + katakana) / total > 0.1) return 'ja';
  if (hangul / total > 0.1) return 'ko';
  if (cyrillic / total > 0.2) return 'ru';
  if (thai / total > 0.2) return 'th';
  if (arabic / total > 0.2) return 'ar';

  return null;
}

/**
 * ISO 639-3 コードを ISO 639-1 に変換
 */
function convertToIso1(code: string): string | null {
  if (code.length === 2) return code;
  return iso6393To1[code] || null;
}

/**
 * 3ライブラリの合議で言語を検出
 * TinyLD, ELD, franc を使用し、2票以上で確定
 */
function detectByLibraries(text: string): string | null {
  const results: Record<string, number> = {};

  try {
    // TinyLD (ISO 639-1)
    const tiny = tinyDetect(text);
    if (tiny) results[tiny] = (results[tiny] || 0) + 1;
  } catch {
    // ignore
  }

  try {
    // ELD (ISO 639-1)
    const eldResult = eld.detect(text);
    if (eldResult && eldResult.language) {
      results[eldResult.language] = (results[eldResult.language] || 0) + 1;
    }
  } catch {
    // ignore
  }

  try {
    // franc (ISO 639-3 → 639-1)
    const francResult = franc(text, { minLength: 20 });
    if (francResult !== 'und') {
      const iso1 = convertToIso1(francResult);
      if (iso1) results[iso1] = (results[iso1] || 0) + 1;
    }
  } catch {
    // ignore
  }

  // 2票以上で確定、それ以外はnull
  const sorted = Object.entries(results).sort((a, b) => b[1] - a[1]);
  const topResult = sorted[0];
  if (topResult && topResult[1] >= 2) return topResult[0];

  return null;
}

/**
 * テキストの言語を検出し、ISO 639-1 コードを返します。
 *
 * @param text - 解析するテキスト
 * @returns ISO 639-1 言語コード (例: 'en', 'ja') または null
 */
export function detectLanguage(text: string | null | undefined): string | null {
  if (!text || text.trim().length === 0) return null;

  // 文字種判定
  const scriptLang = detectByScript(text);
  if (scriptLang) return scriptLang;

  // 合議
  return detectByLibraries(text);
}

/**
 * 複数のテキストから言語を検出し、最も多く検出された言語を返します。
 * スーパーマジョリティ投票（≥50%）により、精度を向上させます。
 *
 * @param texts - 解析するテキストの配列
 * @returns ISO 639-1 言語コード または null
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

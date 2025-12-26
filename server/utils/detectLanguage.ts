import LanguageDetect from 'languagedetect';

const detector = new LanguageDetect();

const languageToIso639: Record<string, string> = {
  'english': 'en',
  'japanese': 'ja',
  'chinese': 'zh',
  'korean': 'ko',
  'spanish': 'es',
  'french': 'fr',
  'german': 'de',
  'russian': 'ru',
  'portuguese': 'pt',
  'italian': 'it',
  'indonesian': 'id',
  'vietnamese': 'vi',
  'thai': 'th',
  'arabic': 'ar',
  'hindi': 'hi',
  'polish': 'pl',
  'ukrainian': 'uk',
  'dutch': 'nl',
  'turkish': 'tr',
  'bengali': 'bn',
  'persian': 'fa',
  'urdu': 'ur',
  'catalan': 'ca',
  'greek': 'el',
  'hebrew': 'he',
  'romanian': 'ro',
  'swedish': 'sv',
  'hungarian': 'hu',
  'czech': 'cs',
  'danish': 'da',
  'finnish': 'fi',
  'norwegian': 'no',
  'slovak': 'sk',
  'malay': 'ms',
  'filipino': 'tl',
  'tagalog': 'tl',
};

/**
 * テキストの言語を検出し、ISO 639-1 コードを返します。
 * 言語が確実に検出されない場合、またはテキストが空の場合は null を返します。
 *
 * @param text - 解析するテキスト
 * @returns ISO 639-1 言語コード (例: 'en', 'ja') または null
 */
export function detectLanguage(text: string | null | undefined): string | null {
  if (!text || text.trim().length === 0) return null;
  
  const results = detector.detect(text, 1); // 上位1件を取得

  if (results.length > 0) {
    const [language] = results[0];
    
    // マッピングされている最上位のものを採用
    const formattedLang = language.toLowerCase();
    return languageToIso639[formattedLang] || null;
  }

  return null;
}

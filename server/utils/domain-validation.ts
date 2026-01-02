/**
 * ドメイン名の検証と正規化
 *
 * @param domain 検証対象のドメイン文字列
 * @returns 検証結果オブジェクト
 */
export const validateDomain = (domain: string): ValidationResult => {
  if (!domain) {
    return { valid: false, error: 'Domain is required' };
  }

  // 空白削除と小文字化
  const normalized = domain.trim().toLowerCase();

  // 基本的な長さチェック
  if (normalized.length > 255) {
    return { valid: false, error: 'Domain is too long (max 255 chars)' };
  }

  // ドメイン検証用正規表現 (簡易版)
  // 英数字、ハイフン、ドットを許可。末尾のセグメントは2文字以上。
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;

  if (!domainRegex.test(normalized)) {
    return { valid: false, error: 'Invalid domain format' };
  }

  return { valid: true, normalized };
};

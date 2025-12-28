export function formatNumber(num: number | undefined | null, compact = false): string {
  if (num == null) return '-';
  if (compact && num >= 100000) {
    return new Intl.NumberFormat('ja-JP', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
  }
  return new Intl.NumberFormat('ja-JP').format(num);
}

export function calculateShare(count: number, total?: number): string {
  if (!total || total === 0) return '0.0';
  return ((count / total) * 100).toFixed(1);
}

export function getLanguageName(code: string | null | undefined): string {
  if (!code) return 'Unknown';
  try {
    const name = new Intl.DisplayNames(['ja'], { type: 'language' }).of(code);
    if (name && name !== code) {
      return name;
    }
  } catch {
    // ignore
  }
  return code.toUpperCase();
}

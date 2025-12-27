export const useFormat = () => {
  const formatNumber = (num: number | undefined | null) => {
    if (num == null) return '-';
    if (num >= 100000) {
      return new Intl.NumberFormat('ja-JP', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
    }
    return new Intl.NumberFormat('ja-JP').format(num);
  };

  const getLanguageName = (code: string) => {
    try {
      const name = new Intl.DisplayNames(['ja'], { type: 'language' }).of(code);
      if (name && name !== code) {
        return name;
      }
    } catch {
      // ignore
    }
    return code;
  };

  return {
    formatNumber,
    getLanguageName
  };
};

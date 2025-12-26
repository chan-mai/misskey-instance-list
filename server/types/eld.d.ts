declare module 'eld' {
  interface LanguageResult {
    language: string;
    getScores(): Record<string, number>;
    isReliable(): boolean;
  }

  export const eld: {
    detect(text: string): LanguageResult;
    cleanText(flag: boolean): void;
    dynamicLangSubset(languages: string[] | false): void;
    info(): object;
  };
}

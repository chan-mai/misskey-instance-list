import type { IpStack } from '../db/schema.js';

/**
 * おすすめスコアの重みと設定
 */
const SCORING_CONFIG = {
  WEIGHTS: {
    USER_COUNT: 0.35,
    POST_VOLUME: 0.35,
    VERSION: 0.2,
    IP_STACK: 0.1
  },
  // 対数正規化の上限
  CAPS: {
    USERS: 1_000_000,
    POSTS: 200_000_000
  },
  // バージョン新鮮さの減衰係数 (月数)
  VERSION_DECAY_MONTHS: 3,
  // IPスタック種別の点数 (0-1)
  IP_STACK_SCORES: { v4: 0.25, v6: 0.5, dual: 1 } satisfies Record<IpStack, number>
};

/**
 * バージョン文字列から年月を抽出して月単位の数値に変換する
 * CalVer (YYYY.MM.Patch) を想定
 * 戻り値: (Year * 12) + Month
 */
export function parseVersionToMonths(version: string): number | null {
  // v2025.12.0 や 2025.12.0-fork などの形式に対応
  // 先頭の 'v' はあってもなくても良い
  const match = version.match(/^v?(\d{4})\.(\d{1,2})\.\d+/);
  if (!match) return null;

  const year = parseInt(match[1]!, 10);
  const month = parseInt(match[2]!, 10);
  return (year * 12) + month;
}

/**
 * バージョンスコアを計算する (0-1)
 * @param instanceVersion インスタンスのバージョン
 * @param latestVersion 最新の安定版バージョン
 */
export function getVersionScore(instanceVersion: string | null, latestVersion: string | null): number {
  if (!instanceVersion || !latestVersion) return 0;

  const instanceMonths = parseVersionToMonths(instanceVersion);
  const latestMonths = parseVersionToMonths(latestVersion);

  // CalVerとして解析できない場合 (v13系など) はスコア0
  if (instanceMonths === null || latestMonths === null) return 0;

  const diffMonths = latestMonths - instanceMonths;

  // 最新版より新しい (betaなど) または同じ場合は満点
  if (diffMonths <= 0) return 1.0;

  // 古い場合は月単位で減衰
  return Math.exp(-diffMonths / SCORING_CONFIG.VERSION_DECAY_MONTHS);
}

// 対数正規化 (0-1)
function normalizeLog(value: number, cap: number): number {
  return Math.min(Math.log10(1 + Math.max(value, 0)) / Math.log10(1 + cap), 1);
}

/**
 * インスタンスのおすすめスコアを計算する
 * スコアは0から100の間
 */
export function calculateRecommendationScore(instance: {
  users_count: number | null;
  notes_count: number | null;
  version: string | null;
  ip_stack: IpStack | null;
}, latestVersion: string | null): number {
  const normalizedUsers = normalizeLog(instance.users_count ?? 0, SCORING_CONFIG.CAPS.USERS);
  const normalizedPosts = normalizeLog(instance.notes_count ?? 0, SCORING_CONFIG.CAPS.POSTS);
  const versionScore = getVersionScore(instance.version, latestVersion);
  // 未判定は0
  const ipStackScore = instance.ip_stack ? SCORING_CONFIG.IP_STACK_SCORES[instance.ip_stack] : 0;

  const totalScore =
    (normalizedUsers * SCORING_CONFIG.WEIGHTS.USER_COUNT) +
    (normalizedPosts * SCORING_CONFIG.WEIGHTS.POST_VOLUME) +
    (versionScore * SCORING_CONFIG.WEIGHTS.VERSION) +
    (ipStackScore * SCORING_CONFIG.WEIGHTS.IP_STACK);

  // スケーリングされたスコアを返す (0-100)
  return Number((totalScore * 100).toFixed(2));
}

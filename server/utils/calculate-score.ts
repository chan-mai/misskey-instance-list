/**
 * おすすめスコアの重みと設定
 */
const SCORING_CONFIG = {
  WEIGHTS: {
    POST_VOLUME: 0.3,
    USER_COUNT: 0.2,
    ACTIVITY_RATE: 0.3,
    VERSION: 0.2
  },
  // 正規化の上限 (0-1スケーリングのための95パーセンタイル推定値)
  CAPS: {
    POSTS: 1000000,
    USERS: 10000,
    NOTES_PER_DAY: 1000
  },
  // バージョン新鮮さの減衰係数 (月数)
  VERSION_DECAY_MONTHS: 3
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

/**
 * インスタンスのおすすめスコアを計算する
 * スコアは0から100の間
 */
export function calculateRecommendationScore(instance: {
  users_count: number | null;
  notes_count: number | null;
  created_at: Date;
  version: string | null;
}, latestVersion: string | null): number {
  const users = instance.users_count || 0;
  const posts = instance.notes_count || 0;
  
  // 1. 正規化された投稿数 (0-1)
  const normalizedPosts = Math.min(posts / SCORING_CONFIG.CAPS.POSTS, 1);
  
  // 2. 正規化されたユーザー数 (0-1)
  const normalizedUsers = Math.min(users / SCORING_CONFIG.CAPS.USERS, 1);
  
  // 3. 活動率ヒューリスティック (1日あたりのノート数)
  const daysSinceCreation = Math.max(
    (Date.now() - new Date(instance.created_at).getTime()) / (1000 * 60 * 60 * 24),
    1 // ゼロ除算を回避
  );
  const notesPerDay = posts / daysSinceCreation;
  const normalizedActivity = Math.min(notesPerDay / SCORING_CONFIG.CAPS.NOTES_PER_DAY, 1);
  
  // 4. バージョン新鮮さ
  const versionScore = getVersionScore(instance.version, latestVersion);

  // 加重和を計算
  const totalScore = 
    (normalizedPosts * SCORING_CONFIG.WEIGHTS.POST_VOLUME) +
    (normalizedUsers * SCORING_CONFIG.WEIGHTS.USER_COUNT) +
    (normalizedActivity * SCORING_CONFIG.WEIGHTS.ACTIVITY_RATE) +
    (versionScore * SCORING_CONFIG.WEIGHTS.VERSION);
    
  // スケーリングされたスコアを返す (0-100)
  return Number((totalScore * 100).toFixed(2));
}

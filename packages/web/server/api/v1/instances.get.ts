import { searchInstances } from '@mil/core/repository';
import { OFFICIAL_REPOSITORY_URL } from '@mil/core/domain';
import { instancesQuerySchema } from '@mil/core/validation';

/**
 * インスタンス一覧取得API
 *
 * クエリパラメータ:
 * - sort: ソート項目 ('notes' | 'users' | 'createdAt' | 'recommended' | 'repository') (デフォルト: 'users')
 * - order: ソート順序 ('asc' | 'desc') (デフォルト: 'desc')
 * - limit: 1ページあたりの件数 (1-100) (デフォルト: 30)
 * - offset: オフセット (0以上) (デフォルト: 0)
 * - search: 検索クエリ (オプション)
 * - language: 言語コード (ISO 639-1) (オプション)
 * - repository: リポジトリURL (オプション)
 * - open_registrations: 登録開放状況 (true/false) (オプション)
 * - email_required: メールアドレス必須 (true/false) (オプション)
 * - ip_stack: IPスタック種別 ('v4' | 'v6' | 'dual') (オプション)
 * - min_users: 最小ユーザー数 (0以上) (オプション)
 * - max_users: 最大ユーザー数 (0以上) (オプション)
 *
 * レスポンス:
 * - items: インスタンス配列
 * - total: 総件数
 * - limit: 1ページあたりの件数
 * - offset: 現在のオフセット
 *
 * @throws 400 Bad Request (パラメータが許容値の範囲外)
 * @returns {Promise<InstancesResponse>} インスタンス一覧
 */
export default defineCachedEventHandler(async(event): Promise<InstancesResponse> => {
  const query = parseOrThrow(instancesQuerySchema, getQuery(event));

  const { total, rows } = await searchInstances(useDb(event), {
    ...query,
    repository: query.repository === 'official' ? OFFICIAL_REPOSITORY_URL : query.repository,
  });

  // レスポンス用に整形。
  // timestamp_ms列はDateで返るためNumber()でepoch msになる
  const items = rows.map((i) => ({
    host: i.id,
    name: i.node_name ?? i.id,
    users_count: i.users_count ?? 0,
    notes_count: i.notes_count ?? 0,
    created_at: i.created_at ? Number(i.created_at) : null,
    version: i.version,
    is_alive: i.is_alive,
    last_updated: i.last_updated ? Number(i.last_updated) : null,
    last_check_at: i.last_check_at ? Number(i.last_check_at) : null,
    banner_url: i.banner_url,
    icon_url: i.icon_url,
    recommendation_score: i.recommendation_score ?? null,
    suspension_state: i.suspension_state ?? 'none',
    repository_url: i.repository_url,
    language: i.language ?? null,
    open_registrations: i.open_registrations ?? null,
    email_required: i.email_required ?? null,
    ip_stack: i.ip_stack ?? null,
  }));

  return {
    items,
    total,
    limit: query.limit,
    offset: query.offset,
  };
}, {
  maxAge: 60 * 60, // 1時間間キャッシュ
});

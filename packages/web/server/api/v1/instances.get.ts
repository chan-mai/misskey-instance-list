import { and, asc, count, desc, eq, gte, like, lte, notExists, or, sql, type SQL } from 'drizzle-orm';
import { instances, excludedHosts } from '@mil/core/db';
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

  const db = useDb(event);

  // SQLiteのNULL順序はPostgresと逆のため, is nullを第1キーに置いて末尾固定する
  const sortColumns = {
    notes: instances.notes_count,
    users: instances.users_count,
    createdAt: instances.created_at,
    recommended: instances.recommendation_score,
    repository: instances.repository_url,
  };
  const sortColumn = sortColumns[query.sort];

  const orderBy = [
    sql`(${sortColumn} is null) asc`,
    query.order === 'asc' ? asc(sortColumn) : desc(sortColumn),
    // ページングを安定
    asc(instances.id),
  ];

  // 検索条件を構築
  const conditions: (SQL | undefined)[] = [eq(instances.is_alive, true)];

  // 除外ドメイン
  conditions.push(
    notExists(
      db
        .select({ x: sql`1` })
        .from(excludedHosts)
        .where(eq(excludedHosts.domain, instances.id)),
    ),
  );

  // 切り詰め後に空になる検索語はフィルタしない
  if (query.search) {
    conditions.push(
      or(like(instances.id, `%${query.search}%`), like(instances.node_name, `%${query.search}%`)),
    );
  }

  // リポジトリフィルタ
  if (query.repository) {
    conditions.push(eq(
      instances.repository_url,
      query.repository === 'official' ? 'https://github.com/misskey-dev/misskey' : query.repository,
    ));
  }

  // 言語フィルタ
  if (query.language) {
    conditions.push(eq(instances.language, query.language));
  }

  // 登録開放状況フィルタ
  if (query.open_registrations !== undefined) {
    conditions.push(eq(instances.open_registrations, query.open_registrations));
  }

  // メールアドレス必須フィルタ
  if (query.email_required !== undefined) {
    conditions.push(eq(instances.email_required, query.email_required));
  }

  // ユーザー数フィルタ
  if (query.min_users !== undefined) {
    conditions.push(gte(instances.users_count, query.min_users));
  }
  if (query.max_users !== undefined) {
    conditions.push(lte(instances.users_count, query.max_users));
  }

  const where = and(...conditions);

  // 総件数を取得
  const totalRows = await db.select({ value: count() }).from(instances).where(where);
  const total = totalRows[0]?.value ?? 0;

  // インスタンス一覧を取得
  const rows = await db
    .select()
    .from(instances)
    .where(where)
    .orderBy(...orderBy)
    .limit(query.limit)
    .offset(query.offset);

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

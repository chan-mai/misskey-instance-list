import { and, asc, count, desc, eq, gte, like, lte, notExists, or, sql, type SQL } from 'drizzle-orm';
import { instances, excludedHosts, clampLikeTerm } from '@mil/core/db';

/**
 * インスタンス一覧取得API
 *
 * クエリパラメータ:
 * - sort: ソート項目 ('notes' | 'users')
 * - order: ソート順序 ('asc' | 'desc')
 * - limit: 1ページあたりの件数 (デフォルト: 30)
 * - offset: オフセット (デフォルト: 0)
 * - search: 検索クエリ (オプション)
 * - language: 言語コード (ISO 639-1) (オプション)
 * - repository: リポジトリURL (オプション)
 * - open_registrations: 登録開放状況 (true/false) (オプション)
 * - email_required: メールアドレス必須 (true/false) (オプション)
 * - min_users: 最小ユーザー数 (オプション)
 * - max_users: 最大ユーザー数 (オプション)
 *
 * レスポンス:
 * - items: インスタンス配列
 * - total: 総件数
 * - limit: 1ページあたりの件数
 * - offset: 現在のオフセット
 *
 * @returns {Promise<InstancesResponse>} インスタンス一覧
 */
export default defineCachedEventHandler(async(event): Promise<InstancesResponse> => {
  const query = getQuery(event);

  // クエリパラメータを取得
  const sort = (query.sort as string) || 'users';
  const order = (query.order as string) === 'asc' ? 'asc' : 'desc';
  const limit = Math.min(
    Math.max(parseInt(query.limit as string) || 30, 1),
    100
  );
  const offset = Math.max(parseInt(query.offset as string) || 0, 0);
  const search = (query.search as string) || '';

  const db = useDb(event);

  // SQLiteのNULL順序はPostgresと逆のため, is nullを第1キーに置いて末尾固定する
  const sortColumn = {
    notes: instances.notes_count,
    users: instances.users_count,
    createdAt: instances.created_at,
    recommended: instances.recommendation_score,
    repository: instances.repository_url,
  }[sort] ?? instances.users_count;

  const orderBy = [
    sql`(${sortColumn} is null) asc`,
    order === 'asc' ? asc(sortColumn) : desc(sortColumn),
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

  // 検索クエリがある場合はフィルタを追加, D1のLIKEパターン50バイト上限に切り詰める
  if (search) {
    const term = clampLikeTerm(search);
    if (term) {
      conditions.push(
        or(like(instances.id, `%${term}%`), like(instances.node_name, `%${term}%`)),
      );
    }
  }

  // リポジトリフィルタ
  const repository = query.repository as string | undefined;
  if (repository) {
    conditions.push(eq(
      instances.repository_url,
      repository === 'official' ? 'https://github.com/misskey-dev/misskey' : repository,
    ));
  }

  // 言語フィルタ
  const language = query.language as string | undefined;
  if (language) {
    conditions.push(eq(instances.language, language));
  }

  // 登録開放状況フィルタ
  const openRegistrations = query.open_registrations as string | undefined;
  if (openRegistrations === 'true') {
    conditions.push(eq(instances.open_registrations, true));
  } else if (openRegistrations === 'false') {
    conditions.push(eq(instances.open_registrations, false));
  }

  // メールアドレス必須フィルタ
  const emailRequired = query.email_required as string | undefined;
  if (emailRequired === 'true') {
    conditions.push(eq(instances.email_required, true));
  } else if (emailRequired === 'false') {
    conditions.push(eq(instances.email_required, false));
  }

  // ユーザー数フィルタ
  const minUsers = parseInt(query.min_users as string);
  const maxUsers = parseInt(query.max_users as string);
  if (!isNaN(minUsers) && minUsers >= 0) {
    conditions.push(gte(instances.users_count, minUsers));
  }
  if (!isNaN(maxUsers) && maxUsers >= 0) {
    conditions.push(lte(instances.users_count, maxUsers));
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
    .limit(limit)
    .offset(offset);

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
    limit,
    offset,
  };
}, {
  maxAge: 60 * 60, // 1時間間キャッシュ
});

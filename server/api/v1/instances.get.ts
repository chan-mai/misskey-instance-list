import { prisma } from '~~/server/utils/prisma';

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
 */
export default defineCachedEventHandler(async(event) => {
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

  // ソート条件を設定
  type OrderByType = {
    notes_count?: 'asc' | 'desc';
    users_count?: 'asc' | 'desc';
    created_at?: 'asc' | 'desc';
    recommendation_score?: 'asc' | 'desc' | { sort: 'asc' | 'desc', nulls: 'last' | 'first' };
    repository_url?: 'asc' | 'desc' | { sort: 'asc' | 'desc', nulls: 'last' | 'first' };
  } | Array<{
    notes_count?: 'asc' | 'desc';
    users_count?: 'asc' | 'desc';
    created_at?: 'asc' | 'desc';
    recommendation_score?: 'asc' | 'desc' | { sort: 'asc' | 'desc', nulls: 'last' | 'first' };
    repository_url?: 'asc' | 'desc' | { sort: 'asc' | 'desc', nulls: 'last' | 'first' };
  }>;
  let orderBy: OrderByType;
  switch (sort) {
    case 'notes':
      orderBy = { notes_count: order };
      break;
    case 'createdAt':
      orderBy = { created_at: order };
      break;
    case 'recommended':
      orderBy = { recommendation_score: { sort: order, nulls: 'last' } };
      break;
    case 'repository':
      orderBy = { repository_url: { sort: order, nulls: 'last' } };
      break;
    case 'users':
    default:
      orderBy = { users_count: order };
      break;
  }

  // 除外ドメインを取得
  const denyDomains = (
    await prisma.denylist.findMany({ select: { domain: true } })
  ).map((d: { domain: string }) => d.domain);
  const ignoreDomains = (
    await prisma.ignoreHost.findMany({ select: { domain: true } })
  ).map((d: { domain: string }) => d.domain);
  const excluded = [...denyDomains, ...ignoreDomains];

  // 検索条件を構築
  interface WhereCondition {
    is_alive: boolean;
    id: { notIn: string[] };
    OR?: Array<{
      id?: { contains: string; mode: 'insensitive' };
      node_name?: { contains: string; mode: 'insensitive' };
    }>;
    repository_url?: string | { contains: string; mode: 'insensitive' };
    language?: string;
    open_registrations?: boolean;
    email_required?: boolean;
    users_count?: { gte?: number; lte?: number };
  }

  const where: WhereCondition = {
    is_alive: true,
    id: { notIn: excluded },
  };

  // 検索クエリがある場合はフィルタを追加
  if (search) {
    where.OR = [
      { id: { contains: search, mode: 'insensitive' } },
      { node_name: { contains: search, mode: 'insensitive' } },
    ];
  }

  // リポジトリフィルタ
  const repository = query.repository as string | undefined;
  if (repository) {
    if (repository === 'official') {
      where.repository_url = 'https://github.com/misskey-dev/misskey';
    } else {
      where.repository_url = repository;
    }
  }

  // 言語フィルタ
  const language = query.language as string | undefined;
  if (language) {
    where.language = language;
  }

  // 登録開放状況フィルタ
  const openRegistrations = query.open_registrations as string | undefined;
  if (openRegistrations === 'true') {
    where.open_registrations = true;
  } else if (openRegistrations === 'false') {
    where.open_registrations = false;
  }

  // メールアドレス必須フィルタ
  const emailRequired = query.email_required as string | undefined;
  if (emailRequired === 'true') {
    where.email_required = true;
  } else if (emailRequired === 'false') {
    where.email_required = false;
  }

  // ユーザー数フィルタ
  const minUsers = parseInt(query.min_users as string);
  const maxUsers = parseInt(query.max_users as string);
  if (!isNaN(minUsers) || !isNaN(maxUsers)) {
    where.users_count = {};
    if (!isNaN(minUsers) && minUsers >= 0) {
      where.users_count.gte = minUsers;
    }
    if (!isNaN(maxUsers) && maxUsers >= 0) {
      where.users_count.lte = maxUsers;
    }
  }

  // 総件数を取得
  const total = await prisma.instance.count({ where });

  // インスタンス一覧を取得
  const instances = await prisma.instance.findMany({
    where,
    orderBy,
    skip: offset,
    take: limit,
  });

  // レスポンス用に整形
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = instances.map((i: any) => ({
    id: i.id,
    node_name: i.node_name ?? i.id,
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
    repository_url: i.repository_url,
    language: i.language ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    open_registrations: (i as any).open_registrations ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    email_required: (i as any).email_required ?? null,
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

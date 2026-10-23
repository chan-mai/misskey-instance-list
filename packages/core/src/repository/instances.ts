import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  isNull,
  like,
  lte,
  ne,
  notExists,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import type { BatchItem } from 'drizzle-orm/batch';
import { instances, excludedHosts } from '../entity/schema.js';
import type { InstanceInsert, SuspensionState } from '../entity/schema.js';
import { chunkForD1, type Database } from '../db/index.js';
import type { InstancesQuery } from '../validation/request.js';

export const findInstance = async(db: Database, id: string) => {
  const [row] = await db.select().from(instances).where(eq(instances.id, id)).limit(1);
  return row;
};

export const findInstanceSummary = async(db: Database, id: string) => {
  const [row] = await db
    .select({
      id: instances.id,
      node_name: instances.node_name,
      version: instances.version,
      users_count: instances.users_count,
      notes_count: instances.notes_count,
      is_alive: instances.is_alive,
      suspension_state: instances.suspension_state,
      language: instances.language,
      repository_url: instances.repository_url,
      last_check_at: instances.last_check_at,
    })
    .from(instances)
    .where(eq(instances.id, id))
    .limit(1);
  return row;
};

export const countInstances = async(db: Database): Promise<number> => {
  const rows = await db.select({ total: count() }).from(instances);
  return rows[0]?.total ?? 0;
};

// 登録済みならfalse
export const insertInstanceIfAbsent = async(db: Database, id: string): Promise<boolean> => {
  const created = await db
    .insert(instances)
    .values({ id })
    .onConflictDoNothing({ target: instances.id })
    .returning({ id: instances.id });
  return created.length > 0;
};

export const insertInstanceIds = async(db: Database, ids: readonly string[]): Promise<void> => {
  // id + default付き4列(users_count/notes_count/is_alive/suspension_state)で5パラメータ
  for (const chunk of chunkForD1(ids, 5)) {
    await db
      .insert(instances)
      .values(chunk.map((id) => ({ id })))
      .onConflictDoNothing();
  }
};

export const deleteInstance = async(db: Database, id: string): Promise<void> => {
  await db.delete(instances).where(eq(instances.id, id));
};

export const deleteInstances = async(db: Database, ids: readonly string[]): Promise<void> => {
  for (const chunk of chunkForD1(ids, 1)) {
    await db.delete(instances).where(inArray(instances.id, chunk));
  }
};

export const sampleAliveInstanceIds = async(db: Database, limit: number): Promise<string[]> => {
  const rows = await db
    .select({ id: instances.id })
    .from(instances)
    .where(eq(instances.is_alive, true))
    .orderBy(sql`random()`)
    .limit(limit);
  return rows.map((row) => row.id);
};

// gone以外かつ未除外
const selectSyncTargetIds = (db: Database) =>
  db
    .select({ id: instances.id })
    .from(instances)
    .leftJoin(excludedHosts, eq(instances.id, excludedHosts.domain))
    .where(and(ne(instances.suspension_state, 'gone'), isNull(excludedHosts.domain)));

// 最終確認の古い順
export const listStaleSyncTargetIds = async(db: Database, limit: number): Promise<string[]> => {
  const rows = await selectSyncTargetIds(db).orderBy(asc(instances.last_check_at)).limit(limit);
  return rows.map((row) => row.id);
};

// 再試行時も同一順序
export const listAllSyncTargetIds = async(db: Database): Promise<string[]> => {
  const rows = await selectSyncTargetIds(db).orderBy(asc(instances.id));
  return rows.map((row) => row.id);
};

export type InstanceProbeUpdate = Pick<
  InstanceInsert,
  | 'node_name'
  | 'users_count'
  | 'notes_count'
  | 'version'
  | 'banner_url'
  | 'icon_url'
  | 'language'
  | 'repository_url'
  | 'open_registrations'
  | 'email_required'
  | 'ip_stack'
>;

export const markInstanceAlive = async(
  db: Database,
  id: string,
  now: Date,
  values: InstanceProbeUpdate,
): Promise<void> => {
  await db
    .update(instances)
    .set({ ...values, is_alive: true, last_check_at: now, suspension_state: 'none' })
    .where(eq(instances.id, id));
};

export const markInstanceDown = async(
  db: Database,
  id: string,
  now: Date,
  state: SuspensionState,
): Promise<void> => {
  await db
    .update(instances)
    .set({ is_alive: false, last_check_at: now, suspension_state: state })
    .where(eq(instances.id, id));
};

// idのキーセットページング
export const listAliveScoreInputs = (db: Database, limit: number, cursor?: string) =>
  db
    .select({
      id: instances.id,
      users_count: instances.users_count,
      notes_count: instances.notes_count,
      version: instances.version,
      ip_stack: instances.ip_stack,
    })
    .from(instances)
    .where(
      cursor === undefined
        ? eq(instances.is_alive, true)
        : and(eq(instances.is_alive, true), gt(instances.id, cursor)),
    )
    .orderBy(asc(instances.id))
    .limit(limit);

// D1のbatchは暗黙のトランザクション, 1文2パラメータ
export const updateRecommendationScores = async(
  db: Database,
  scores: readonly { id: string; score: number }[],
): Promise<void> => {
  if (scores.length === 0) return;
  const updates: BatchItem<'sqlite'>[] = scores.map(({ id, score }) =>
    db
      .update(instances)
      .set({ recommendation_score: score })
      .where(eq(instances.id, id)),
  );
  await db.batch(updates as [BatchItem<'sqlite'>, ...BatchItem<'sqlite'>[]]);
};

export const listAliveVersionsByRepository = async(
  db: Database,
  repositoryUrl: string,
): Promise<(string | null)[]> => {
  const rows = await db
    .selectDistinct({ version: instances.version })
    .from(instances)
    .where(and(eq(instances.is_alive, true), eq(instances.repository_url, repositoryUrl)));
  return rows.map((row) => row.version);
};

// repositoryは解決済みURL
export type InstanceSearch = Omit<InstancesQuery, 'repository'> & { repository?: string };

export const searchInstances = async(db: Database, query: InstanceSearch) => {
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
  if (query.repository) {
    conditions.push(eq(instances.repository_url, query.repository));
  }
  if (query.language) {
    conditions.push(eq(instances.language, query.language));
  }
  if (query.open_registrations !== undefined) {
    conditions.push(eq(instances.open_registrations, query.open_registrations));
  }
  if (query.email_required !== undefined) {
    conditions.push(eq(instances.email_required, query.email_required));
  }
  if (query.ip_stack !== undefined) {
    conditions.push(eq(instances.ip_stack, query.ip_stack));
  }
  if (query.min_users !== undefined) {
    conditions.push(gte(instances.users_count, query.min_users));
  }
  if (query.max_users !== undefined) {
    conditions.push(lte(instances.users_count, query.max_users));
  }

  const where = and(...conditions);

  const totalRows = await db.select({ value: count() }).from(instances).where(where);
  const total = totalRows[0]?.value ?? 0;

  const rows = await db
    .select()
    .from(instances)
    .where(where)
    .orderBy(...orderBy)
    .limit(query.limit)
    .offset(query.offset);

  return { total, rows };
};

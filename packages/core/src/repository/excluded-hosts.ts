import { and, count, desc, eq, inArray, like, or, type SQL } from 'drizzle-orm';
import { excludedHosts } from '../entity/schema.js';
import { ExcludedHostSource, type ExcludedHostInsert } from '../entity/schema.js';
import type { Database } from '../db/client.js';
import { chunkForD1 } from '../db/chunk.js';

export const findExclusion = async(db: Database, domain: string) => {
  const [row] = await db
    .select()
    .from(excludedHosts)
    .where(eq(excludedHosts.domain, domain))
    .limit(1);
  return row;
};

// source省略時は全件
export const listExcludedDomains = async(
  db: Database,
  source?: ExcludedHostSource,
): Promise<string[]> => {
  const rows = await db
    .select({ domain: excludedHosts.domain })
    .from(excludedHosts)
    .where(source === undefined ? undefined : eq(excludedHosts.source, source));
  return rows.map((row) => row.domain);
};

export const listExclusionReasons = (db: Database) =>
  db
    .select({
      domain: excludedHosts.domain,
      reason: excludedHosts.reason,
    })
    .from(excludedHosts);

export const searchExclusions = async(
  db: Database,
  { page, limit, search, source }: {
    page: number;
    limit: number;
    search?: string;
    source: ExcludedHostSource | 'all';
  },
) => {
  const conditions: (SQL | undefined)[] = [];

  if (source !== 'all') {
    conditions.push(eq(excludedHosts.source, source));
  }

  // 切り詰め後に空になる検索語はフィルタしない
  if (search) {
    conditions.push(
      or(like(excludedHosts.domain, `%${search}%`), like(excludedHosts.reason, `%${search}%`)),
    );
  }

  // and()は引数0件でundefinedを返す, 無条件時はWHERE句を出さない
  const where = and(...conditions);

  const [total, exclusions] = await Promise.all([
    db.select({ value: count() }).from(excludedHosts).where(where),
    db
      .select()
      .from(excludedHosts)
      .where(where)
      .orderBy(desc(excludedHosts.created_at))
      .limit(limit)
      .offset((page - 1) * limit),
  ]);

  // count()は常に1行返る
  return { total: total[0]!.value, exclusions };
};

// 登録済みならundefined
export const insertExclusion = async(db: Database, values: ExcludedHostInsert) => {
  const [row] = await db
    .insert(excludedHosts)
    .values(values)
    .onConflictDoNothing({ target: excludedHosts.domain })
    .returning();
  return row;
};

export const insertExclusionsIgnoringConflict = async(
  db: Database,
  rows: readonly ExcludedHostInsert[],
): Promise<void> => {
  // 1行3カラム
  for (const chunk of chunkForD1(rows, 3)) {
    await db.insert(excludedHosts).values(chunk).onConflictDoNothing();
  }
};

// 既存行はreasonのみ更新, sourceは維持, batch用に未実行で返す
export const upsertSystemExclusion = (db: Database, domain: string, reason: string) =>
  db
    .insert(excludedHosts)
    .values({ domain, reason, source: ExcludedHostSource.system })
    .onConflictDoUpdate({
      target: excludedHosts.domain,
      set: { reason },
    });

// 不在ならundefined
export const updateExclusionReason = async(db: Database, domain: string, reason: string) => {
  const [row] = await db
    .update(excludedHosts)
    .set({ reason })
    .where(eq(excludedHosts.domain, domain))
    .returning();
  return row;
};

// 不在ならundefined
export const deleteExclusion = async(db: Database, domain: string) => {
  const [row] = await db
    .delete(excludedHosts)
    .where(eq(excludedHosts.domain, domain))
    .returning();
  return row;
};

export const deleteExclusionsBySource = async(
  db: Database,
  domains: readonly string[],
  source: ExcludedHostSource,
): Promise<void> => {
  // domain分 + where句のsource分
  for (const chunk of chunkForD1(domains, 2)) {
    await db
      .delete(excludedHosts)
      .where(and(inArray(excludedHosts.domain, chunk), eq(excludedHosts.source, source)));
  }
};

import { and, asc, count, desc, eq, isNotNull, sum } from 'drizzle-orm';
import { instances, repositories, excludedHosts, ExcludedHostSource } from '../entity/schema.js';
import type { Database } from '../db/index.js';

const countKnown = (db: Database) => db.select({ value: count() }).from(instances);

const countActive = (db: Database) =>
  db.select({ value: count() }).from(instances).where(eq(instances.is_alive, true));

// sum()はドライバによって文字列を返すためmapWith(Number)で正規化する
const sumActiveUsers = (db: Database) =>
  db
    .select({ value: sum(instances.users_count).mapWith(Number) })
    .from(instances)
    .where(eq(instances.is_alive, true));

const countExclusions = (db: Database, source?: ExcludedHostSource) =>
  source === undefined
    ? db.select({ value: count() }).from(excludedHosts)
    : db.select({ value: count() }).from(excludedHosts).where(eq(excludedHosts.source, source));

// 公開統計の件数, 4件を1往復
export const getNetworkCounts = async(db: Database) => {
  const [known, active, exclusions, users] = await db.batch([
    countKnown(db),
    countActive(db),
    countExclusions(db),
    sumActiveUsers(db),
  ]);
  return {
    known: known[0]?.value ?? 0,
    active: active[0]?.value ?? 0,
    exclusions: exclusions[0]?.value ?? 0,
    // sumは0行でNULLを返す
    users: users[0]?.value ?? 0,
  };
};

// 管理画面の件数, 7件を1往復
export const getAdminCounts = async(db: Database) => {
  const [
    known,
    active,
    users,
    exclusionTotal,
    exclusionManual,
    exclusionSystem,
    exclusionJoinMisskey,
  ] = await db.batch([
    countKnown(db),
    countActive(db),
    sumActiveUsers(db),
    countExclusions(db),
    countExclusions(db, ExcludedHostSource.manual),
    countExclusions(db, ExcludedHostSource.system),
    countExclusions(db, ExcludedHostSource.joinmisskey),
  ]);

  // 集計クエリは常に1行返るため添字アクセスを断定する
  return {
    instances: {
      known: known[0]!.value,
      active: active[0]!.value,
    },
    // sum()は0行だとNULLを返す
    users: users[0]!.value ?? 0,
    exclusions: {
      total: exclusionTotal[0]!.value,
      manual: exclusionManual[0]!.value,
      system: exclusionSystem[0]!.value,
      joinmisskey: exclusionJoinMisskey[0]!.value,
    },
  };
};

export const listRepositoryUsage = (db: Database) =>
  db
    .select({
      url: instances.repository_url,
      name: repositories.name,
      description: repositories.description,
      count: count(instances.repository_url),
    })
    .from(instances)
    .leftJoin(repositories, eq(instances.repository_url, repositories.url))
    .where(and(eq(instances.is_alive, true), isNotNull(instances.repository_url)))
    .groupBy(instances.repository_url, repositories.name, repositories.description)
    // 同数時の順序を固定
    .orderBy(desc(count(instances.repository_url)), asc(instances.repository_url));

export const listLanguageUsage = (db: Database) =>
  db
    .select({ code: instances.language, count: count(instances.language) })
    .from(instances)
    .where(and(eq(instances.is_alive, true), isNotNull(instances.language)))
    .groupBy(instances.language)
    .orderBy(desc(count(instances.language)), asc(instances.language));

// NULLは未判定
export const listIpStackUsage = (db: Database) =>
  db
    .select({
      stack: instances.ip_stack,
      count: count(),
      users: sum(instances.users_count).mapWith(Number),
    })
    .from(instances)
    .where(eq(instances.is_alive, true))
    .groupBy(instances.ip_stack);

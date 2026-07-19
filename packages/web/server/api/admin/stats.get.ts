import { count, eq, sum } from 'drizzle-orm';
import { instances, excludedHosts, ExcludedHostSource } from '@mil/core/db';
import { useDb } from '~~/server/utils/db';

/**
 * GET /api/admin/stats
 *
 * 管理者ダッシュボード用の統計情報を取得します。
 * キャッシュは行いません。
 */
export default defineEventHandler(async(event) => {
  const db = useDb(event);

  // D1は1クエリ1往復のため, batchで7クエリを1往復にまとめる
  const [
    known,
    active,
    users,
    exclusionTotal,
    exclusionManual,
    exclusionSystem,
    exclusionJoinMisskey,
  ] = await db.batch([
    // 既知のインスタンス数
    db.select({ value: count() }).from(instances),

    // アクティブなインスタンス数
    db.select({ value: count() }).from(instances).where(eq(instances.is_alive, true)),

    // 総ユーザー数 (ユーザー数はアクティブなインスタンスからのみ集計するのが一般的だが、要件次第。一旦v1/statsと同様にaliveのみで集計)
    // sum()はドライバによって文字列を返すためmapWith(Number)で正規化する
    db
      .select({ value: sum(instances.users_count).mapWith(Number) })
      .from(instances)
      .where(eq(instances.is_alive, true)),

    // 除外ホスト総数
    db.select({ value: count() }).from(excludedHosts),

    // Excluded breakdown
    db
      .select({ value: count() })
      .from(excludedHosts)
      .where(eq(excludedHosts.source, ExcludedHostSource.manual)),
    db
      .select({ value: count() })
      .from(excludedHosts)
      .where(eq(excludedHosts.source, ExcludedHostSource.system)),
    db
      .select({ value: count() })
      .from(excludedHosts)
      .where(eq(excludedHosts.source, ExcludedHostSource.joinmisskey)),
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
});

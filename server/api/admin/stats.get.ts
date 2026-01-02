import { prisma } from '~~/server/utils/prisma';
import { ExcludedHostSource } from '~~/generated/prisma/enums';

/**
 * GET /api/admin/stats
 *
 * 管理者ダッシュボード用の統計情報を取得します。
 * キャッシュは行いません。
 */
export default defineEventHandler(async() => {
  // 並列でデータを取得
  const [
    known,
    active,
    users,
    exclusionTotal,
    exclusionManual,
    exclusionSystem,
    exclusionJoinMisskey
  ] = await Promise.all([
    // 既知のインスタンス数
    prisma.instance.count(),
    
    // アクティブなインスタンス数
    prisma.instance.count({ where: { is_alive: true } }),
    
    // 総ユーザー数 (ユーザー数はアクティブなインスタンスからのみ集計するのが一般的だが、要件次第。一旦v1/statsと同様にaliveのみで集計)
    prisma.instance.aggregate({
      where: { is_alive: true },
      _sum: { users_count: true }
    }),
    
    // 除外ホスト総数
    prisma.excludedHost.count(),
    
    // Excluded breakdown
    prisma.excludedHost.count({ where: { source: ExcludedHostSource.manual } }),
    prisma.excludedHost.count({ where: { source: ExcludedHostSource.system } }),
    prisma.excludedHost.count({ where: { source: ExcludedHostSource.joinmisskey } }),
  ]);

  return {
    instances: {
      known,
      active,
    },
    users: users._sum.users_count || 0,
    exclusions: {
      total: exclusionTotal,
      manual: exclusionManual,
      system: exclusionSystem,
      joinmisskey: exclusionJoinMisskey
    }
  };
});

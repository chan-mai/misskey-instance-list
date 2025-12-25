import { prisma } from '~~/server/utils/prisma';

export default defineCachedEventHandler(async() => {
  // 関知済みインスタンス数をカウント（停止中・消滅したものも含む）
  const known = await prisma.instance.count();

  // アクティブなインスタンス数をカウント
  const active = await prisma.instance.count({
    where: { is_alive: true }
  });

  // アクティブなインスタンスのリポジトリ使用状況を取得
  // InstanceテーブルでgroupByを行うことで、現在アクティブなノードの正確な統計を取得できる
  // 論理的にはrepository_urlフィールドを介してRepositoryテーブルと結合しているが
  // 正しいカウントを取得するためには、is_aliveがtrueであるInstanceテーブル上で
  // repository_urlごとにグループ化するのが効率的
  const repoStats = await prisma.instance.groupBy({
    by: ['repository_url'],
    where: {
      is_alive: true,
      repository_url: { not: null }
    },
    _count: {
      repository_url: true
    },
    orderBy: {
      _count: {
        repository_url: 'desc'
      }
    }
  });

  // リポジトリリストを整形
  const repositories = repoStats.map(stat => ({
    url: stat.repository_url as string,
    count: stat._count.repository_url
  }));

  return {
    counts: {
      known,
      active
    },
    repositories
  };
}, {
  maxAge: 60 * 60, // 1時間キャッシュ
});

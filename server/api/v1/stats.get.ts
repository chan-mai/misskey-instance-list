import { prisma } from '~~/server/utils/prisma';

export default defineCachedEventHandler(async() => {
  // 関知済みインスタンス数をカウント (停止中・消滅したものも含む)
  const known = await prisma.instance.count();

  // アクティブなインスタンス数をカウント
  const active = await prisma.instance.count({
    where: { is_alive: true }
  });

  // 除外リストのカウント
  const exclusionsCount = await prisma.excludedHost.count();

  // アクティブなインスタンスのリポジトリ使用状況を取得
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

  // リポジトリの詳細情報を取得
  const repoUrls = repoStats.map(s => s.repository_url as string);
  const repoDetails = await prisma.repository.findMany({
    where: {
      url: { in: repoUrls }
    }
  });

  // URLをキーにしたMapを作成し、検索を高速化
  const repoMap = new Map(repoDetails.map(r => [r.url, r]));

  // リポジトリリストを整形
  const repositories = repoStats.map(stat => {
    const detail = repoMap.get(stat.repository_url as string);
    return {
      url: stat.repository_url as string,
      name: detail?.name || null,
      description: detail?.description || null,
      count: stat._count.repository_url
    };
  });

  // 言語の使用状況を取得
  const langStats = await prisma.instance.groupBy({
    by: ['language'],
    where: {
      is_alive: true,
      language: { not: null }
    },
    _count: {
      language: true
    },
    orderBy: {
      _count: {
        language: 'desc'
      }
    }
  });

  const languages = langStats.map(stat => ({
    code: stat.language as string,
    count: stat._count.language
  }));

  return {
    counts: {
      known,
      active,
      exclusions: exclusionsCount
    },
    repositories,
    languages
  };
}, {
  maxAge: 60 * 60
});

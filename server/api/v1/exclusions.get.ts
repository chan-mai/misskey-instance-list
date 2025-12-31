import { prisma } from '~~/server/utils/prisma';

export default defineCachedEventHandler(async(_event) => {
  // すべての除外ホストを返す
  const exclusions = await prisma.excludedHost.findMany({ 
    select: { 
      domain: true, 
      reason: true 
    } 
  });
  return exclusions;
}, {
  maxAge: 60 * 60, // 1時間キャッシュ
});

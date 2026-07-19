import { prisma } from '@mil/core/db';

export default defineCachedEventHandler(async(_event): Promise<ExclusionResponse[]> => {
  // すべての除外ホストを返す
  const exclusions = await prisma.excludedHost.findMany({ 
    select: { 
      domain: true, 
      reason: true 
    } 
  });
  return exclusions;
}, {
  // sync:exclusionsタスクからの明示的なキャッシュ無効化がなくなったため短めにする
  maxAge: 10 * 60,
});

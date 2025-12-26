import { prisma } from '~~/server/utils/prisma';

export default defineCachedEventHandler(async(_event) => {
  const d = await prisma.denylist.findMany({ select: { domain: true, reason: true } });
  return d;
}, {
  maxAge: 60 * 60, // 1時間間キャッシュ
});

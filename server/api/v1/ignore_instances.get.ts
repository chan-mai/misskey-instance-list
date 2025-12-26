import { prisma } from '~~/server/utils/prisma';

export default defineCachedEventHandler(async(_event) => {
  const i = await prisma.ignoreHost.findMany({ select: { domain: true, reason: true } });
  return i;
}, {
  maxAge: 60 * 60, // 1時間間キャッシュ
});

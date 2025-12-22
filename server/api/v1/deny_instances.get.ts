import { prisma } from '~~/server/utils/prisma';

export default defineCachedEventHandler(async(_event) => {
  const d = await prisma.denylist.findMany({ select: { domain: true } });
  return d.map((r: { domain: string }) => r.domain);
}, {
  maxAge: 60 * 60, // 1時間間キャッシュ
});

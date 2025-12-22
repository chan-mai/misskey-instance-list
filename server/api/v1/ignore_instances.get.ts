import { prisma } from '~~/server/utils/prisma';

export default defineCachedEventHandler(async(_event) => {
  const d = await prisma.denylist.findMany({ select: { domain: true } });
  const i = await prisma.ignoreHost.findMany({ select: { domain: true } });
  const hosts = [...new Set([
    ...d.map((r: { domain: string }) => r.domain),
    ...i.map((r: { domain: string }) => r.domain)
  ])];
  return hosts;
}, {
  maxAge: 60 * 60, // 1時間間キャッシュ
});

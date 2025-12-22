import { prisma } from '~~/server/utils/prisma';

export default defineEventHandler(async(_event) => {
    const d = await prisma.denylist.findMany({ select: { domain: true }});
    return d.map((r: { domain: string }) => r.domain);
});

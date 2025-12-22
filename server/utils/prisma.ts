import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type SuspensionState } from '../../generated/prisma/client';
import pg from 'pg';

export type { PrismaClient, SuspensionState };

const { Pool } = pg;

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

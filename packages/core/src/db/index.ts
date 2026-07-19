export { prisma } from './client.js';

// enumは値としても使うためtype-onlyにしない
export { SuspensionState, ExcludedHostSource } from '../generated/client.js';

export type {
  PrismaClient,
  Instance,
  Repository,
  ExcludedHost,
} from '../generated/client.js';

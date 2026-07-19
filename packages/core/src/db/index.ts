export { createDb, type Database } from './client.js';

export * as schema from './schema.js';
export { instances, repositories, excludedHosts } from './schema.js';

// enumは値としても使うためtype-onlyにしない
export {
  SuspensionState,
  ExcludedHostSource,
  SUSPENSION_STATES,
  EXCLUDED_HOST_SOURCES,
  isSuspensionState,
  isExcludedHostSource,
} from './schema.js';

export type {
  Instance,
  Repository,
  ExcludedHost,
  InstanceInsert,
  RepositoryInsert,
  ExcludedHostInsert,
} from './schema.js';

export { chunkForD1, clampLikeTerm, D1_MAX_BOUND_PARAMS } from './chunk.js';

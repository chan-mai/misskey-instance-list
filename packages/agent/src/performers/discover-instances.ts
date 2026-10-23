import { Performer } from 'tsumugi/performer';
import { discoverInstances } from '@mil/core/domain';
import { buildCrawlContext } from '../crawl-context.js';
import type { Env } from '../env.js';

const DEFAULT_SAMPLE_SIZE = 5;

export interface DiscoverInstancesPayload {
  sampleSize?: number;
}

export interface DiscoverInstancesResult {
  sources: string[];
  discovered: number;
}

export class DiscoverInstances extends Performer<
  DiscoverInstancesPayload,
  DiscoverInstancesResult,
  object,
  Env
> {
  async perform({ sampleSize = DEFAULT_SAMPLE_SIZE }: DiscoverInstancesPayload): Promise<DiscoverInstancesResult> {
    return discoverInstances(buildCrawlContext(this.env), sampleSize);
  }
}

import yaml from 'js-yaml';
import { Performer } from 'tsumugi/performer';
import { and, asc, count, eq, isNull, ne } from 'drizzle-orm';
import { createDb, instances, excludedHosts, chunkForD1, type Database } from '@mil/core/db';
import { enqueuePlanStatsSync } from '../bindings.js';
import type { Env } from '../env.js';

const DEFAULT_LIMIT = 100;

export interface ListUpdateTargetsPayload {
  scheduledAt: number;
  limit?: number;
}

export interface ListUpdateTargetsResult {
  hosts: string[];
  seeded: number;
}

// 更新の古い順に再取得対象を返す, DBが空ならシードして統計同期を起こす
export class ListUpdateTargets extends Performer<
  ListUpdateTargetsPayload,
  ListUpdateTargetsResult,
  object,
  Env
> {
  async perform({ scheduledAt, limit = DEFAULT_LIMIT }: ListUpdateTargetsPayload): Promise<ListUpdateTargetsResult> {
    const db = createDb(this.env.DB);

    const countRows = await db.select({ total: count() }).from(instances);
    const total = countRows[0]?.total ?? 0;
    if (total === 0) {
      const seeded = await seed(db);
      await enqueuePlanStatsSync(this.env, scheduledAt);
      return { hosts: [], seeded };
    }

    const candidates = await db
      .select({ id: instances.id })
      .from(instances)
      .leftJoin(excludedHosts, eq(instances.id, excludedHosts.domain))
      .where(and(ne(instances.suspension_state, 'gone'), isNull(excludedHosts.domain)))
      .orderBy(asc(instances.last_check_at))
      .limit(limit);

    return { hosts: candidates.map((row) => row.id), seeded: 0 };
  }
}

async function seed(db: Database): Promise<number> {
  const res = await fetch('https://raw.githubusercontent.com/joinmisskey/api/main/data/instances.yml');
  if (!res.ok) {
    throw new Error(`Failed to fetch seed data: ${res.status}`);
  }

  const data = yaml.load(await res.text());
  if (!Array.isArray(data)) {
    throw new Error('Seed data is not an array');
  }

  const uniqueUrls = [...new Set(
    (data as { url?: string }[]).map((d) => d.url).filter((u): u is string => !!u),
  )];

  // joinmisskeyのリストは1000件超, アプリ最大の書き込み
  // id + default付き4列(users_count/notes_count/is_alive/suspension_state)で5パラメータ
  for (const chunk of chunkForD1(uniqueUrls, 5)) {
    await db
      .insert(instances)
      .values(chunk.map((url) => ({ id: url })))
      .onConflictDoNothing();
  }

  return uniqueUrls.length;
}

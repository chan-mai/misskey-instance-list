import { repositories } from '../entity/schema.js';
import type { RepositoryInsert } from '../entity/schema.js';
import type { Database } from '../db/index.js';

// name, descriptionは値がある場合のみ上書き
export const upsertRepository = async(
  db: Database,
  { url, name, description }: { url: string; name: string | null; description: string | null },
): Promise<void> => {
  // $onUpdateはonConflictDoUpdate内で発火しないため明示
  const set: Partial<RepositoryInsert> = { updated_at: new Date() };
  if (name) set.name = name;
  if (description) set.description = description;

  await db
    .insert(repositories)
    .values({ url, name, description })
    .onConflictDoUpdate({ target: repositories.url, set });
};

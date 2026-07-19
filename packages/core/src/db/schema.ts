import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real, index, check } from 'drizzle-orm/sqlite-core';

// SQLiteにenum型は無いのでtext({enum})だが型レベルの制約でしかない, DB層はCHECKで守る
export const SUSPENSION_STATES = ['none', 'suspended', 'gone'] as const;
export const EXCLUDED_HOST_SOURCES = ['joinmisskey', 'manual', 'system'] as const;

// CHECKはDDLに埋まりバインドパラメータを使えないためリテラル展開
const sqlLiteralList = (values: readonly string[]) =>
  sql.raw(values.map((v) => `'${v}'`).join(', '));

const nowMs = () => sql`(unixepoch() * 1000)`;

// 値と型の両方で使えるようconstオブジェクト + 同名型で宣言マージ
export const SuspensionState = {
  none: 'none',
  suspended: 'suspended',
  gone: 'gone',
} as const;
export type SuspensionState = (typeof SUSPENSION_STATES)[number];

export const ExcludedHostSource = {
  joinmisskey: 'joinmisskey',
  manual: 'manual',
  system: 'system',
} as const;
export type ExcludedHostSource = (typeof EXCLUDED_HOST_SOURCES)[number];

export const isSuspensionState = (v: unknown): v is SuspensionState =>
  typeof v === 'string' && (SUSPENSION_STATES as readonly string[]).includes(v);

export const isExcludedHostSource = (v: unknown): v is ExcludedHostSource =>
  typeof v === 'string' && (EXCLUDED_HOST_SOURCES as readonly string[]).includes(v);

export const repositories = sqliteTable('repositories', {
  url: text('url').primaryKey(),
  name: text('name'),
  description: text('description'),
  // $onUpdateはonConflictDoUpdate内で発火しない, upsert時はsetに明示すること
  updated_at: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(nowMs())
    .$onUpdate(() => new Date()),
  created_at: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(nowMs()),
});

export const instances = sqliteTable(
  'instances',
  {
    id: text('id').primaryKey(),
    node_name: text('node_name'),
    users_count: integer('users_count').default(0),
    notes_count: integer('notes_count').default(0),
    version: text('version'),
    is_alive: integer('is_alive', { mode: 'boolean' }).notNull().default(false),
    created_at: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(nowMs()),
    last_updated: integer('last_updated', { mode: 'timestamp_ms' })
      .default(nowMs())
      .$onUpdate(() => new Date()),
    last_check_at: integer('last_check_at', { mode: 'timestamp_ms' }),
    banner_url: text('banner_url'),
    icon_url: text('icon_url'),
    suspension_state: text('suspension_state', { enum: SUSPENSION_STATES })
      .notNull()
      .default('none'),
    recommendation_score: real('recommendation_score'),
    open_registrations: integer('open_registrations', { mode: 'boolean' }),
    email_required: integer('email_required', { mode: 'boolean' }),
    repository_url: text('repository_url').references(() => repositories.url, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    language: text('language'),
  },
  (t) => [
    index('instances_repository_url_idx').on(t.repository_url),
    index('instances_language_idx').on(t.language),
    check(
      'instances_suspension_state_check',
      sql`${t.suspension_state} in (${sqlLiteralList(SUSPENSION_STATES)})`,
    ),
  ],
);

export const excludedHosts = sqliteTable(
  'excluded_hosts',
  {
    domain: text('domain').primaryKey(),
    reason: text('reason'),
    source: text('source', { enum: EXCLUDED_HOST_SOURCES }).notNull().default('system'),
    created_at: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(nowMs()),
  },
  (t) => [
    check(
      'excluded_hosts_source_check',
      sql`${t.source} in (${sqlLiteralList(EXCLUDED_HOST_SOURCES)})`,
    ),
  ],
);

export type Instance = typeof instances.$inferSelect;
export type Repository = typeof repositories.$inferSelect;
export type ExcludedHost = typeof excludedHosts.$inferSelect;

export type InstanceInsert = typeof instances.$inferInsert;
export type RepositoryInsert = typeof repositories.$inferInsert;
export type ExcludedHostInsert = typeof excludedHosts.$inferInsert;

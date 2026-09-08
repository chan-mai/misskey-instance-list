import * as v from 'valibot';
import type { LocationQuery } from 'vue-router';

export const SORT_FIELDS = ['recommendedScore', 'notesCount', 'usersCount', 'createdAt'] as const;
export const SORT_ORDERS = ['asc', 'desc'] as const;
export const VIEW_MODES = ['grid', 'list'] as const;

export type SortField = (typeof SORT_FIELDS)[number];
export type SortOrder = (typeof SORT_ORDERS)[number];
export type ViewMode = (typeof VIEW_MODES)[number];

const textParam = v.fallback(v.optional(v.string(), ''), '');
const boolParam = v.fallback(
  v.nullish(v.pipe(v.picklist(['true', 'false']), v.transform((s) => s === 'true')), null),
  null
);
const userCountParam = v.fallback(
  v.nullish(v.pipe(v.string(), v.nonEmpty(), v.transform(Number), v.number(), v.integer(), v.minValue(0)), null),
  null
);

// 復元値はAPIクエリになる
export const filterConditionsSchema = v.object({
  q: textParam,
  repository: textParam,
  language: textParam,
  orderBy: v.fallback(v.optional(v.picklist(SORT_FIELDS), 'recommendedScore'), 'recommendedScore'),
  order: v.fallback(v.optional(v.picklist(SORT_ORDERS), 'desc'), 'desc'),
  openRegistrations: boolParam,
  emailRequired: boolParam,
  minUsers: userCountParam,
  maxUsers: userCountParam,
});

export type FilterConditions = v.InferOutput<typeof filterConditionsSchema>;

export const parseFilterQuery = (query: LocationQuery): FilterConditions => {
  const normalized = Object.fromEntries(
    Object.entries(query).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
  );
  return v.parse(filterConditionsSchema, normalized);
};

// デフォルト値は省略
export const toFilterQuery = (conditions: FilterConditions): Record<string, string> => {
  const query: Record<string, string> = {};
  if (conditions.q) query.q = conditions.q;
  if (conditions.repository) query.repository = conditions.repository;
  if (conditions.language) query.language = conditions.language;
  if (conditions.orderBy !== 'recommendedScore') query.orderBy = conditions.orderBy;
  if (conditions.order !== 'desc') query.order = conditions.order;
  if (conditions.openRegistrations !== null) query.openRegistrations = String(conditions.openRegistrations);
  if (conditions.emailRequired !== null) query.emailRequired = String(conditions.emailRequired);
  if (conditions.minUsers !== null) query.minUsers = String(conditions.minUsers);
  if (conditions.maxUsers !== null) query.maxUsers = String(conditions.maxUsers);
  return query;
};

const viewSettingsSchema = v.object({
  v_view: v.fallback(v.picklist(VIEW_MODES), 'grid'),
});

export const loadViewMode = (raw: string | null): ViewMode | null => {
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const result = v.safeParse(viewSettingsSchema, parsed);
  return result.success ? result.output.v_view : null;
};

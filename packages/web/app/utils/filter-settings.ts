import * as v from 'valibot';

export const SORT_FIELDS = ['recommendedScore', 'notesCount', 'usersCount', 'createdAt'] as const;
export const SORT_ORDERS = ['asc', 'desc'] as const;
export const VIEW_MODES = ['grid', 'list'] as const;

export type SortField = (typeof SORT_FIELDS)[number];
export type SortOrder = (typeof SORT_ORDERS)[number];
export type ViewMode = (typeof VIEW_MODES)[number];

const userCount = v.nullable(v.pipe(v.number(), v.integer(), v.minValue(0)));

// 復元値はAPIクエリになる
export const filterSettingsSchema = v.object({
  f_orderBy: v.fallback(v.picklist(SORT_FIELDS), 'recommendedScore'),
  f_order: v.fallback(v.picklist(SORT_ORDERS), 'desc'),
  v_view: v.fallback(v.picklist(VIEW_MODES), 'grid'),
  f_openRegistrations: v.fallback(v.nullable(v.boolean()), null),
  f_emailRequired: v.fallback(v.nullable(v.boolean()), null),
  f_minUsers: v.fallback(userCount, null),
  f_maxUsers: v.fallback(userCount, null),
});

export type FilterSettings = v.InferOutput<typeof filterSettingsSchema>;

export const loadFilterSettings = (raw: string | null): FilterSettings | null => {
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const result = v.safeParse(filterSettingsSchema, parsed);
  return result.success ? result.output : null;
};

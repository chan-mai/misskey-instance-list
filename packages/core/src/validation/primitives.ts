import * as v from 'valibot';
import { SUSPENSION_STATES, EXCLUDED_HOST_SOURCES } from '../db/schema.js';
import { clampLikeTerm } from '../db/chunk.js';
import { validateDomain } from '../net/domain-validation.js';

export const suspensionStateSchema = v.picklist(SUSPENSION_STATES);
export const excludedHostSourceSchema = v.picklist(EXCLUDED_HOST_SOURCES);

// validateDomainによる検証/正規化
export const domainSchema = v.pipe(
  v.string('Domain is required'),
  v.rawTransform<string, string>(({ dataset, addIssue, NEVER }) => {
    const { valid, normalized, error } = validateDomain(dataset.value);
    if (!valid || !normalized) {
      addIssue({ message: error });
      return NEVER;
    }
    return normalized;
  }),
);

// LIKEパターン切り詰め検索語
export const likeTermSchema = v.pipe(
  v.string(),
  v.transform((raw: string) => clampLikeTerm(raw)),
);

// 空文字の0化回避に正規表現を先置
export const integerParam = (
  { min = 0, max = Number.MAX_SAFE_INTEGER }: { min?: number; max?: number } = {},
) =>
  v.pipe(
    v.string(),
    v.regex(/^-?\d+$/, 'Must be an integer'),
    v.transform((raw: string) => Number(raw)),
    v.integer(),
    v.minValue(min),
    v.maxValue(max),
  );

export const booleanParam = v.pipe(
  v.picklist(['true', 'false'] as const, 'Must be "true" or "false"'),
  v.transform((raw) => raw === 'true'),
);

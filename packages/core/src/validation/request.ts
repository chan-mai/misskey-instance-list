import * as v from 'valibot';
import { EXCLUDED_HOST_SOURCES } from '../db/schema.js';
import {
  booleanParam,
  domainSchema,
  excludedHostSourceSchema,
  integerParam,
  likeTermSchema,
} from './primitives.js';

export const INSTANCE_SORT_KEYS = [
  'notes',
  'users',
  'createdAt',
  'recommended',
  'repository',
] as const;
export type InstanceSortKey = (typeof INSTANCE_SORT_KEYS)[number];

export const INSTANCES_LIMIT_MAX = 100;

export const instancesQuerySchema = v.object({
  sort: v.optional(v.picklist(INSTANCE_SORT_KEYS), 'users'),
  order: v.optional(v.picklist(['asc', 'desc'] as const), 'desc'),
  limit: v.optional(integerParam({ min: 1, max: INSTANCES_LIMIT_MAX }), '30'),
  offset: v.optional(integerParam({ min: 0 }), '0'),
  search: v.optional(likeTermSchema),
  repository: v.optional(v.pipe(v.string(), v.maxLength(512))),
  language: v.optional(v.pipe(v.string(), v.maxLength(32))),
  open_registrations: v.optional(booleanParam),
  email_required: v.optional(booleanParam),
  min_users: v.optional(integerParam({ min: 0 })),
  max_users: v.optional(integerParam({ min: 0 })),
});
export type InstancesQuery = v.InferOutput<typeof instancesQuerySchema>;

const LOOPBACK_HOSTS: readonly string[] = ['localhost', '127.0.0.1', '::1'];

export const checkQuerySchema = v.object({
  domain: v.pipe(
    v.custom<string>(
      (input) => typeof input === 'string',
      (issue) =>
        Array.isArray(issue.input)
          ? 'Multiple domain parameters are not allowed'
          : 'Domain parameter is required',
    ),
    v.nonEmpty('Domain parameter is required'),
    v.transform((raw) => raw.trim().toLowerCase()),
    // URL入力からホスト名抽出
    v.rawTransform<string, string>(({ dataset, addIssue, NEVER }) => {
      if (!dataset.value.includes('://')) return dataset.value;
      try {
        return new URL(dataset.value).hostname;
      } catch {
        addIssue({ message: 'Invalid URL format' });
        return NEVER;
      }
    }),
    v.regex(/^[a-z0-9.-]+$/, 'Domain parameter contains invalid characters'),
    v.check((host) => !LOOPBACK_HOSTS.includes(host), 'Localhost addresses are not allowed'),
  ),
});
export type CheckQuery = v.InferOutput<typeof checkQuerySchema>;

const REASON_MAX_LENGTH = 500;

export const adminExclusionsQuerySchema = v.object({
  page: v.optional(integerParam({ min: 1 }), '1'),
  limit: v.optional(integerParam({ min: 1, max: INSTANCES_LIMIT_MAX }), '20'),
  search: v.optional(likeTermSchema),
  source: v.optional(v.picklist([...EXCLUDED_HOST_SOURCES, 'all'] as const), 'all'),
});
export type AdminExclusionsQuery = v.InferOutput<typeof adminExclusionsQuerySchema>;

export const exclusionCreateBodySchema = v.object({
  domain: domainSchema,
  reason: v.optional(
    v.nullable(v.pipe(v.string('Reason must be a string'), v.maxLength(REASON_MAX_LENGTH))),
  ),
  source: v.optional(excludedHostSourceSchema, 'manual'),
});
export type ExclusionCreateBody = v.InferOutput<typeof exclusionCreateBodySchema>;

export const exclusionPatchBodySchema = v.object({
  reason: v.pipe(
    v.string('Reason must be a string'),
    v.trim(),
    v.nonEmpty('Reason cannot be empty'),
    v.maxLength(REASON_MAX_LENGTH, `Reason is too long (max ${REASON_MAX_LENGTH} chars)`),
  ),
});
export type ExclusionPatchBody = v.InferOutput<typeof exclusionPatchBodySchema>;

export const crawlBodySchema = v.object({ domain: domainSchema });
export type CrawlBody = v.InferOutput<typeof crawlBodySchema>;

export const domainParamSchema = v.object({ domain: domainSchema });
export type DomainParam = v.InferOutput<typeof domainParamSchema>;

// v.checkは前段の失敗後も実行
const isHttpUrl = (raw: string): boolean => {
  try {
    return ['http:', 'https:'].includes(new URL(raw).protocol);
  } catch {
    return false;
  }
};

export const imageQuerySchema = v.object({
  url: v.pipe(
    v.string('URL is required'),
    v.nonEmpty('URL is required'),
    v.check(isHttpUrl, 'Invalid URL'),
  ),
});
export type ImageQuery = v.InferOutput<typeof imageQuerySchema>;

// ホスト名正当性含め確認
export const metaQuerySchema = v.object({ host: domainSchema });
export type MetaQuery = v.InferOutput<typeof metaQuerySchema>;

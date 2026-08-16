import * as v from 'valibot';
import { suspensionStateSchema } from './primitives.js';

export const apiInstanceSchema = v.object({
  host: v.string(),
  name: v.nullable(v.string()),
  users_count: v.nullable(v.number()),
  notes_count: v.nullable(v.number()),
  version: v.nullable(v.string()),
  is_alive: v.boolean(),
  created_at: v.nullable(v.number()),
  last_updated: v.nullable(v.number()),
  last_check_at: v.nullable(v.number()),
  banner_url: v.nullable(v.string()),
  icon_url: v.nullable(v.string()),
  suspension_state: suspensionStateSchema,
  recommendation_score: v.nullable(v.number()),
  open_registrations: v.nullable(v.boolean()),
  email_required: v.nullable(v.boolean()),
  repository_url: v.nullable(v.string()),
  language: v.nullable(v.string()),
});
export type ApiInstance = v.InferOutput<typeof apiInstanceSchema>;

export const instancesResponseSchema = v.object({
  items: v.array(apiInstanceSchema),
  total: v.number(),
  limit: v.number(),
  offset: v.number(),
});
export type InstancesResponse = v.InferOutput<typeof instancesResponseSchema>;

export const exclusionResponseSchema = v.object({
  domain: v.string(),
  reason: v.nullable(v.string()),
});
export type ExclusionResponse = v.InferOutput<typeof exclusionResponseSchema>;

export const checkResponseSchema = v.object({
  is_misskey: v.boolean(),
  data: v.nullable(
    v.object({
      name: v.nullable(v.string()),
      version: v.nullable(v.string()),
      icon: v.nullable(v.string()),
      banner: v.nullable(v.string()),
      softwareName: v.nullable(v.string()),
      description: v.nullable(v.string()),
    }),
  ),
  is_embeddable: v.optional(v.boolean()),
  reason: v.optional(v.nullable(v.string())),
  source: v.picklist(['database', 'fetch', 'error'] as const),
  error: v.optional(v.string()),
});
export type CheckResponse = v.InferOutput<typeof checkResponseSchema>;

export const statsRepositorySchema = v.object({
  url: v.string(),
  name: v.nullable(v.string()),
  description: v.nullable(v.string()),
  count: v.number(),
});
export type StatsRepository = v.InferOutput<typeof statsRepositorySchema>;

export const statsResponseSchema = v.object({
  counts: v.object({
    known: v.number(),
    active: v.number(),
    exclusions: v.number(),
    users: v.number(),
  }),
  repositories: v.array(statsRepositorySchema),
  languages: v.array(v.object({ code: v.string(), count: v.number() })),
});
export type StatsResponse = v.InferOutput<typeof statsResponseSchema>;

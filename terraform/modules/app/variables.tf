variable "project_id" {
  description = "The Google Cloud Project ID"
  type        = string
}

variable "project_number" {
  description = "The Google Cloud Project Number"
  type        = string
}

variable "region" {
  description = "The Google Cloud region"
  type        = string
  default     = "asia-northeast1"
}

variable "service_name" {
  description = "The Cloud Run service name"
  type        = string
}

variable "environment" {
  description = "The environment name (prod, stg)"
  type        = string
}

variable "trigger_branch_regex" {
  description = "The regex for the branch to trigger Cloud Build"
  type        = string
}

variable "database_url" {
  description = "The database URL"
  type        = string
  sensitive   = true
}

variable "github_token" {
  description = "The GitHub token"
  type        = string
  sensitive   = true
}

variable "service_url" {
  description = "The base URL of the Cloud Run service for scheduler endpoints"
  type        = string
  sensitive   = true
}

variable "artifact_registry_id" {
  description = "The Artifact Registry repository ID"
  type        = string
}

variable "cloudbuild_trigger_name" {
  description = "The Cloud Build trigger name"
  type        = string
}

variable "custom_domain" {
  description = "Custom domain to map to the Cloud Run service (empty string to disable)"
  type        = string
  default     = ""
}

variable "zitadel_base_url" {
  description = "ZITADEL instance URL (e.g. https://example.zitadel.cloud)"
  type        = string
}

variable "zitadel_redirect_uri" {
  description = "OIDC callback URL (https://<service-url>/auth/zitadel/callback)"
  type        = string
}

variable "zitadel_client_id" {
  description = "ZITADEL application client ID"
  type        = string
  sensitive   = true
}

variable "zitadel_client_secret" {
  description = "ZITADEL application client secret"
  type        = string
  sensitive   = true
}

variable "oidc_session_secret" {
  description = "nuxt-oidc-auth session secret (48 chars or more)"
  type        = string
  sensitive   = true
}

variable "oidc_token_key" {
  description = "nuxt-oidc-auth token encryption key (base64 encoded AES-256 key)"
  type        = string
  sensitive   = true
}

variable "oidc_auth_session_secret" {
  description = "nuxt-oidc-auth auth session secret (48 chars or more)"
  type        = string
  sensitive   = true
}

variable "schedule_sync_recommendation_scores" {
  description = "Schedule for sync-recommendation-scores job"
  type        = string
  default     = "0 */6 * * *"
}

variable "schedule_sync_stats" {
  description = "Schedule for sync-stats job"
  type        = string
  default     = "0 */6 * * *"
}

variable "schedule_discovery" {
  description = "Schedule for discovery job"
  type        = string
  default     = "*/30 * * * *"
}

variable "schedule_update" {
  description = "Schedule for update job"
  type        = string
  default     = "*/10 * * * *"
}

variable "schedule_sync_exclusions" {
  description = "Schedule for sync-exclusions job"
  type        = string
  default     = "0 * * * *"
}

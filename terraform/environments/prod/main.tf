terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  default = "misskey-482105"
}

variable "region" {
  default = "asia-northeast1"
}

# Values come from terraform.tfvars
variable "database_url" {
  type      = string
  sensitive = true
}

variable "github_token" {
  type      = string
  sensitive = true
}

variable "service_url" {
  type      = string
  sensitive = true
}

variable "zitadel_base_url" {
  type = string
}

variable "zitadel_client_id" {
  type      = string
  sensitive = true
}

variable "zitadel_client_secret" {
  type      = string
  sensitive = true
}

variable "oidc_session_secret" {
  type      = string
  sensitive = true
}

variable "oidc_token_key" {
  type      = string
  sensitive = true
}

variable "oidc_auth_session_secret" {
  type      = string
  sensitive = true
}

module "app" {
  source = "../../modules/app"

  project_id           = var.project_id
  project_number       = "1023578240084"
  region               = var.region
  service_name         = "prod-misskey-instance-list"
  environment          = "prod"
  trigger_branch_regex = "^prod$"

  # Pass secrets
  database_url = var.database_url
  github_token = var.github_token

  # New variables for consistency
  service_url             = var.service_url
  artifact_registry_id    = "cloud-run-source-deploy-prod"
  cloudbuild_trigger_name = "misskey-instance-list-prod-trigger"

  # ZITADEL (OIDC)
  zitadel_base_url         = var.zitadel_base_url
  zitadel_redirect_uri     = "https://servers.misskey.ink/auth/zitadel/callback"
  zitadel_client_id        = var.zitadel_client_id
  zitadel_client_secret    = var.zitadel_client_secret
  oidc_session_secret      = var.oidc_session_secret
  oidc_token_key           = var.oidc_token_key
  oidc_auth_session_secret = var.oidc_auth_session_secret

  # カスタムドメイン
  custom_domain = "servers.misskey.ink"

  # Job Schedules
  schedule_sync_recommendation_scores = "0 */12 * * *" # Every 12 hours
  schedule_sync_stats                 = "0 */6 * * *"  # Every 6 hours
  schedule_discovery                  = "0 0 * * *"    # Daily
  schedule_update                     = "0 */12 * * *" # Every 12 hours
  schedule_sync_exclusions            = "0 0 * * *"    # Daily
}

output "service_url" {
  value = module.app.service_url
}

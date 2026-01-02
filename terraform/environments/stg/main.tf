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

variable "admin_user" {
  type      = string
  sensitive = true
}

variable "admin_password" {
  type      = string
  sensitive = true
}

module "app" {
  source = "../../modules/app"

  project_id           = var.project_id
  project_number       = "1023578240084"
  region               = var.region
  service_name         = "stg-misskey-instance-list"
  environment          = "stg"
  trigger_branch_regex = "^stg$"

  # Pass secrets
  database_url = var.database_url
  github_token = var.github_token
  
  # New variables for consistency
  service_url             = var.service_url
  artifact_registry_id    = "cloud-run-source-deploy-stg"
  cloudbuild_trigger_name = "misskey-instance-list-stg-trigger"

  # Basic Auth
  admin_user     = var.admin_user
  admin_password = var.admin_password

  # カスタムドメイン
  custom_domain = "stg.servers.misskey.ink"
}

output "service_url" {
  value = module.app.service_url
}

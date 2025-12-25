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
}

output "service_url" {
  value = module.app.service_url
}

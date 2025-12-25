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

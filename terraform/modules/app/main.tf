terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

# ------------------------------------------------------------------------------
# Secret Manager
# ------------------------------------------------------------------------------
locals {
  # Prefix: PROD_ or STG_
  secret_prefix = "${upper(var.environment)}_"
}

# --- DATABASE_URL ---
resource "google_secret_manager_secret" "database_url" {
  labels    = { managed-by-cnrm = "true" }
  project   = var.project_number
  secret_id = "${local.secret_prefix}DATABASE_URL"
  replication {
    auto {} 
  }
}

resource "google_secret_manager_secret_version" "database_url" {
  secret      = google_secret_manager_secret.database_url.id
  secret_data = var.database_url
}

# --- TASK_SECRET ---
# Generate random password for internal task authentication
resource "random_password" "task_secret" {
  length  = 32
  special = false
}

resource "google_secret_manager_secret" "task_secret" {
  labels    = { managed-by-cnrm = "true" }
  project   = var.project_number
  secret_id = "${local.secret_prefix}TASK_SECRET"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "task_secret" {
  secret      = google_secret_manager_secret.task_secret.id
  secret_data = random_password.task_secret.result
}

# --- GITHUB_TOKEN ---
resource "google_secret_manager_secret" "github_token" {
  labels    = { managed-by-cnrm = "true" }
  project   = var.project_number
  secret_id = "${local.secret_prefix}GITHUB_TOKEN"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "github_token" {
  secret      = google_secret_manager_secret.github_token.id
  secret_data = var.github_token
}

# Data source retrieval is no longer strictly necessary if we rely on the resource,
# but keeping it (or referring to resource directly) ensures we get the latest version.
# Referring to resource is safer for dependency management.
# However, Cloud Scheduler and Cloud Run env vars need the *value* or reference.

# ------------------------------------------------------------------------------
# Artifact Registry
# ------------------------------------------------------------------------------
resource "google_artifact_registry_repository" "cloud_run_source_deploy" {
  description   = "Cloud Run Source Deployments ${var.environment}"
  format        = "DOCKER"
  labels        = { managed-by-cnrm = "true" }
  location      = var.region
  mode          = "STANDARD_REPOSITORY"
  project       = var.project_id
  repository_id = var.environment == "prod" ? "cloud-run-source-deploy" : "cloud-run-source-deploy-${var.environment}"
}

# ------------------------------------------------------------------------------
# Cloud Run Service
# ------------------------------------------------------------------------------
resource "google_cloud_run_service" "main" {
  name     = var.service_name
  location = var.region
  project  = var.project_id

  template {
    spec {
      containers {
        # Deploy from Artifact Registry
        image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.cloud_run_source_deploy.repository_id}/${var.service_name}:latest"
        
        env {
          name = "DATABASE_URL"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.database_url.secret_id
              key  = "latest"
            }
          }
        }
        env {
          name = "TASK_SECRET"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.task_secret.secret_id
              key  = "latest"
            }
          }
        }
        env {
          name = "GITHUB_TOKEN"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.github_token.secret_id
              key  = "latest"
            }
          }
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# 未認証アクセスを許可
resource "google_cloud_run_service_iam_member" "noauth" {
  location = google_cloud_run_service.main.location
  project  = google_cloud_run_service.main.project
  service  = google_cloud_run_service.main.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ------------------------------------------------------------------------------
# Cloud Build Trigger
# ------------------------------------------------------------------------------
resource "google_cloudbuild_trigger" "main" {
  description = "Build and deploy to Cloud Run service ${var.service_name} on push to ${var.trigger_branch_regex}"
  filename    = "cloudbuild.yaml"
  location    = "global"
  name        = var.environment == "prod" ? "rmgpgab-misskey-instance-list-asia-northeast1-chan-mai-misskhac" : "misskey-instance-list-${var.environment}-trigger"
  project     = var.project_id
  
  github {
    name  = "misskey-instance-list"
    owner = "chan-mai"
    push {
      branch = var.trigger_branch_regex
    }
  }

  substitutions = {
    "_AR_HOSTNAME"   = "${var.region}-docker.pkg.dev"
    "_AR_PROJECT_ID" = var.project_id
    "_AR_REPOSITORY" = google_artifact_registry_repository.cloud_run_source_deploy.repository_id
    "_DEPLOY_REGION" = var.region
    "_PLATFORM"      = "managed"
    "_SERVICE_NAME"  = var.service_name
    "_SECRET_PREFIX" = local.secret_prefix
  }

  service_account    = "projects/${var.project_id}/serviceAccounts/1023578240084-compute@developer.gserviceaccount.com"
  include_build_logs = "INCLUDE_BUILD_LOGS_WITH_STATUS"

  tags = [
    "gcp-cloud-build-deploy-cloud-run",
    "gcp-cloud-build-deploy-cloud-run-managed",
    var.service_name
  ]
}

# ------------------------------------------------------------------------------
# Cloud Scheduler
# ------------------------------------------------------------------------------
resource "google_cloud_scheduler_job" "sync_recommendation_scores" {
  name             = "${local.secret_prefix}sync-recommendation-scores"
  region           = var.region
  description      = "Update instance recommendation scores (Version usage, Activity, etc.)"
  schedule         = "0 */6 * * *"
  time_zone        = "Asia/Tokyo"
  attempt_deadline = "180s"
  project          = var.project_id

  retry_config {
    max_backoff_duration = "3600s"
    max_doublings        = 5
    max_retry_duration   = "0s"
    min_backoff_duration = "5s"
  }

  http_target {
    http_method = "POST"
    uri         = "${google_cloud_run_service.main.status[0].url}/api/tasks/sync:recommendation-scores"
    headers = {
      # Use the automated TASK_SECRET value
      "Authorization" = "Bearer ${google_secret_manager_secret_version.task_secret.secret_data}"
    }
  }
}

resource "google_cloud_scheduler_job" "sync_stats" {
  name             = "${local.secret_prefix}sync-stats"
  region           = var.region
  schedule         = "0 */6 * * *"
  time_zone        = "Etc/UTC"
  attempt_deadline = "180s"
  project          = var.project_id

  retry_config {
    max_backoff_duration = "3600s"
    max_doublings        = 5
    max_retry_duration   = "0s"
    min_backoff_duration = "5s"
  }

  http_target {
    http_method = "POST"
    uri         = "${google_cloud_run_service.main.status[0].url}/api/tasks/sync:stats"
    body        = base64encode("{\"message\": \"from cloud scheduler\"}")
    headers = {
      "Authorization" = "Bearer ${google_secret_manager_secret_version.task_secret.secret_data}"
    }
  }
}

resource "google_cloud_scheduler_job" "discovery" {
  name             = "${local.secret_prefix}discovery"
  region           = var.region
  schedule         = "*/30 * * * *"
  time_zone        = "Etc/UTC"
  attempt_deadline = "180s"
  project          = var.project_id

  retry_config {
    max_backoff_duration = "3600s"
    max_doublings        = 5
    max_retry_duration   = "0s"
    min_backoff_duration = "5s"
  }

  http_target {
    http_method = "POST"
    uri         = "${google_cloud_run_service.main.status[0].url}/api/tasks/discovery"
    body        = base64encode("{\"message\": \"from cloud scheduler\"}")
    headers = {
      "Authorization" = "Bearer ${google_secret_manager_secret_version.task_secret.secret_data}"
    }
  }
}

resource "google_cloud_scheduler_job" "update" {
  name             = "${local.secret_prefix}update"
  region           = var.region
  schedule         = "*/10 * * * *"
  time_zone        = "Etc/UTC"
  attempt_deadline = "180s"
  project          = var.project_id

  retry_config {
    max_backoff_duration = "3600s"
    max_doublings        = 5
    max_retry_duration   = "0s"
    min_backoff_duration = "5s"
  }

  http_target {
    http_method = "POST"
    uri         = "${google_cloud_run_service.main.status[0].url}/api/tasks/update"
    body        = base64encode("{\"message\": \"from cloud scheduler\"}")
    headers = {
      "Authorization" = "Bearer ${google_secret_manager_secret_version.task_secret.secret_data}"
    }
  }
}

resource "google_cloud_scheduler_job" "sync_denylist" {
  name             = "${local.secret_prefix}sync-denylist"
  region           = var.region
  schedule         = "0 * * * *"
  time_zone        = "Etc/UTC"
  attempt_deadline = "180s"
  project          = var.project_id

  retry_config {
    max_backoff_duration = "3600s"
    max_doublings        = 5
    max_retry_duration   = "0s"
    min_backoff_duration = "5s"
  }

  http_target {
    http_method = "POST"
    uri         = "${google_cloud_run_service.main.status[0].url}/api/tasks/sync:denylist"
    body        = base64encode("{\"message\": \"from cloud scheduler\"}")
    headers = {
      "Authorization" = "Bearer ${google_secret_manager_secret_version.task_secret.secret_data}"
    }
  }
}

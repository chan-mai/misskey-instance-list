# ------------------------------------------------------------------------------
# Cloud Scheduler
# ------------------------------------------------------------------------------
# Note: Cloud Scheduler jobs continue to POST to /api/tasks/:name.
# The endpoint now enqueues the task to Cloud Tasks and returns 202 Accepted.
# This ensures that tasks are executed asynchronously and with concurrency control.
# No infrastructure changes are needed for these scheduler jobs themselves.

resource "google_cloud_scheduler_job" "sync_recommendation_scores" {
  name             = "${lower(var.environment)}_sync-recommendation-scores"
  region           = var.region
  description      = "Update instance recommendation scores (Version usage, Activity, etc.)"
  schedule         = "0 */6 * * *"
  time_zone        = "Asia/Tokyo"
  attempt_deadline = "1800s"
  project          = var.project_id

  retry_config {
    max_backoff_duration = "3600s"
    max_doublings        = 5
    max_retry_duration   = "0s"
    min_backoff_duration = "5s"
  }

  http_target {
    http_method = "POST"
    uri         = "${var.service_url}/api/tasks/sync:recommendation-scores"
    headers = {
      "Authorization" = "Bearer ${google_secret_manager_secret_version.task_secret.secret_data}"
    }
  }
}

resource "google_cloud_scheduler_job" "sync_stats" {
  name             = "${lower(var.environment)}_sync-stats"
  region           = var.region
  description      = "Sync instance statistics (users, notes, etc.)"
  schedule         = "0 */6 * * *"
  time_zone        = "Asia/Tokyo"
  attempt_deadline = "1800s"
  project          = var.project_id

  retry_config {
    max_backoff_duration = "3600s"
    max_doublings        = 5
    max_retry_duration   = "0s"
    min_backoff_duration = "5s"
  }

  http_target {
    http_method = "POST"
    uri         = "${var.service_url}/api/tasks/sync:stats"
    body        = base64encode("{\"message\": \"from cloud scheduler\"}")
    headers = {
      "Authorization" = "Bearer ${google_secret_manager_secret_version.task_secret.secret_data}"
    }
  }
}

resource "google_cloud_scheduler_job" "discovery" {
  name             = "${lower(var.environment)}_discovery"
  region           = var.region
  description      = "Discover new Misskey instances from known instances"
  schedule         = "*/30 * * * *"
  time_zone        = "Asia/Tokyo"
  attempt_deadline = "1800s"
  project          = var.project_id

  retry_config {
    max_backoff_duration = "3600s"
    max_doublings        = 5
    max_retry_duration   = "0s"
    min_backoff_duration = "5s"
  }

  http_target {
    http_method = "POST"
    uri         = "${var.service_url}/api/tasks/discovery"
    body        = base64encode("{\"message\": \"from cloud scheduler\"}")
    headers = {
      "Authorization" = "Bearer ${google_secret_manager_secret_version.task_secret.secret_data}"
    }
  }
}

resource "google_cloud_scheduler_job" "update" {
  name             = "${lower(var.environment)}_update"
  region           = var.region
  description      = "Update instance information (version, name, etc.)"
  schedule         = "*/10 * * * *"
  time_zone        = "Asia/Tokyo"
  attempt_deadline = "1800s"
  project          = var.project_id

  retry_config {
    max_backoff_duration = "3600s"
    max_doublings        = 5
    max_retry_duration   = "0s"
    min_backoff_duration = "5s"
  }

  http_target {
    http_method = "POST"
    uri         = "${var.service_url}/api/tasks/update"
    body        = base64encode("{\"message\": \"from cloud scheduler\"}")
    headers = {
      "Authorization" = "Bearer ${google_secret_manager_secret_version.task_secret.secret_data}"
    }
  }
}

resource "google_cloud_scheduler_job" "sync_exclusions" {
  name             = "${lower(var.environment)}_sync-exclusions"
  region           = var.region
  description      = "Sync exclusions from external source"
  schedule         = "0 * * * *"
  time_zone        = "Asia/Tokyo"
  attempt_deadline = "1800s"
  project          = var.project_id

  retry_config {
    max_backoff_duration = "3600s"
    max_doublings        = 5
    max_retry_duration   = "0s"
    min_backoff_duration = "5s"
  }

  http_target {
    http_method = "POST"
    uri         = "${var.service_url}/api/tasks/sync:exclusions"
    body        = base64encode("{\"message\": \"from cloud scheduler\"}")
    headers = {
      "Authorization" = "Bearer ${google_secret_manager_secret_version.task_secret.secret_data}"
    }
  }
}

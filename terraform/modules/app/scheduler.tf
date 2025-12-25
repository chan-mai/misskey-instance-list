# ------------------------------------------------------------------------------
# Cloud Scheduler
# ------------------------------------------------------------------------------
resource "google_cloud_scheduler_job" "sync_recommendation_scores" {
  name             = "${lower(var.environment)}_sync-recommendation-scores"
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
    uri         = "${var.service_url}/api/tasks/update"
    body        = base64encode("{\"message\": \"from cloud scheduler\"}")
    headers = {
      "Authorization" = "Bearer ${google_secret_manager_secret_version.task_secret.secret_data}"
    }
  }
}

resource "google_cloud_scheduler_job" "sync_denylist" {
  name             = "${lower(var.environment)}_sync-denylist"
  region           = var.region
  description      = "Sync denylist from external source"
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
    uri         = "${var.service_url}/api/tasks/sync:denylist"
    body        = base64encode("{\"message\": \"from cloud scheduler\"}")
    headers = {
      "Authorization" = "Bearer ${google_secret_manager_secret_version.task_secret.secret_data}"
    }
  }
}

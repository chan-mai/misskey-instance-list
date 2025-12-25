resource "google_cloud_scheduler_job" "sync_recommendation_scores" {
  name             = "sync-recommendation-scores"
  region           = "asia-northeast1"
  description      = "Update instance recommendation scores (Version usage, Activity, etc.)"
  schedule         = "0 */6 * * *"
  time_zone        = "Asia/Tokyo"
  attempt_deadline = "180s"
  project          = "misskey-482105"

  retry_config {
    max_backoff_duration = "3600s"
    max_doublings        = 5
    max_retry_duration   = "0s"
    min_backoff_duration = "5s"
  }

  http_target {
    http_method = "POST"
    uri         = "https://servers.misskey.ink/api/tasks/sync:recommendation-scores"
    headers = {
      # User-Agent is a default and causes drift if explicitly set but not returned by API
      # "User-Agent"    = "Google-Cloud-Scheduler"
      "Authorization" = "Bearer ${data.google_secret_manager_secret_version.task_secret.secret_data}"
    }
  }
}

resource "google_cloud_scheduler_job" "sync_stats" {
  name             = "sync-stats"
  region           = "asia-northeast1"
  schedule         = "0 */6 * * *"
  time_zone        = "Etc/UTC"
  attempt_deadline = "180s"
  project          = "misskey-482105"

  retry_config {
    max_backoff_duration = "3600s"
    max_doublings        = 5
    max_retry_duration   = "0s"
    min_backoff_duration = "5s"
  }

  http_target {
    http_method = "POST"
    uri         = "https://misskey-instance-list-oy5acq2dsa-an.a.run.app/api/tasks/sync:stats"
    body        = base64encode("{\"message\": \"from cloud scheduler\"}")
    headers = {
      # "Content-Type"  = "application/octet-stream"
      # "User-Agent"    = "Google-Cloud-Scheduler"
      "Authorization" = "Bearer ${data.google_secret_manager_secret_version.task_secret.secret_data}"
    }
  }
}

resource "google_cloud_scheduler_job" "discovery" {
  name             = "discovery"
  region           = "asia-northeast1"
  schedule         = "*/30 * * * *"
  time_zone        = "Etc/UTC"
  attempt_deadline = "180s"
  project          = "misskey-482105"

  retry_config {
    max_backoff_duration = "3600s"
    max_doublings        = 5
    max_retry_duration   = "0s"
    min_backoff_duration = "5s"
  }

  http_target {
    http_method = "POST"
    uri         = "https://misskey-instance-list-oy5acq2dsa-an.a.run.app/api/tasks/discovery"
    body        = base64encode("{\"message\": \"from cloud scheduler\"}")
    headers = {
      # "Content-Type"  = "application/octet-stream"
      # "User-Agent"    = "Google-Cloud-Scheduler"
      "Authorization" = "Bearer ${data.google_secret_manager_secret_version.task_secret.secret_data}"
    }
  }
}

resource "google_cloud_scheduler_job" "update" {
  name             = "update"
  region           = "asia-northeast1"
  schedule         = "*/10 * * * *"
  time_zone        = "Etc/UTC"
  attempt_deadline = "180s"
  project          = "misskey-482105"

  retry_config {
    max_backoff_duration = "3600s"
    max_doublings        = 5
    max_retry_duration   = "0s"
    min_backoff_duration = "5s"
  }

  http_target {
    http_method = "POST"
    uri         = "https://misskey-instance-list-oy5acq2dsa-an.a.run.app/api/tasks/update"
    body        = base64encode("{\"message\": \"from cloud scheduler\"}")
    headers = {
      # "Content-Type"  = "application/octet-stream"
      # "User-Agent"    = "Google-Cloud-Scheduler"
      "Authorization" = "Bearer ${data.google_secret_manager_secret_version.task_secret.secret_data}"
    }
  }
}

resource "google_cloud_scheduler_job" "sync_denylist" {
  name             = "sync-denylist"
  region           = "asia-northeast1"
  schedule         = "0 * * * *"
  time_zone        = "Etc/UTC"
  attempt_deadline = "180s"
  project          = "misskey-482105"

  retry_config {
    max_backoff_duration = "3600s"
    max_doublings        = 5
    max_retry_duration   = "0s"
    min_backoff_duration = "5s"
  }

  http_target {
    http_method = "POST"
    uri         = "https://misskey-instance-list-oy5acq2dsa-an.a.run.app/api/tasks/sync:denylist"
    body        = base64encode("{\"message\": \"from cloud scheduler\"}")
    headers = {
      # "Content-Type"  = "application/octet-stream"
      # "User-Agent"    = "Google-Cloud-Scheduler"
      "Authorization" = "Bearer ${data.google_secret_manager_secret_version.task_secret.secret_data}"
    }
  }
}

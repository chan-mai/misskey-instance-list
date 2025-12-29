# ------------------------------------------------------------------------------
# Cloud Tasks Queues
# ------------------------------------------------------------------------------

# Queue for instance updates
resource "google_cloud_tasks_queue" "update" {
  name     = "${var.service_name}-update-queue"
  location = var.region
  project  = var.project_id

  rate_limits {
    max_concurrent_dispatches = 1
  }

  retry_config {
    max_attempts       = 3
    min_backoff        = "10s"
    max_backoff        = "300s"
    max_doublings      = 2
  }
}

# Queue for discovery tasks
resource "google_cloud_tasks_queue" "discovery" {
  name     = "${var.service_name}-discovery-queue"
  location = var.region
  project  = var.project_id

  rate_limits {
    max_concurrent_dispatches = 1
  }

  retry_config {
    max_attempts       = 3
    min_backoff        = "10s"
    max_backoff        = "300s"
    max_doublings      = 2
  }
}

# Queue for stats sync
resource "google_cloud_tasks_queue" "sync_stats" {
  name     = "${var.service_name}-sync-stats-queue"
  location = var.region
  project  = var.project_id

  rate_limits {
    max_concurrent_dispatches = 1
  }

  retry_config {
    max_attempts       = 3
    min_backoff        = "10s"
    max_backoff        = "300s"
    max_doublings      = 2
  }
}

# Queue for recommendation scores sync
resource "google_cloud_tasks_queue" "sync_recommendation_scores" {
  name     = "${var.service_name}-rec-scores-queue"
  location = var.region
  project  = var.project_id

  rate_limits {
    max_concurrent_dispatches = 1
  }

  retry_config {
    max_attempts       = 3
    min_backoff        = "10s"
    max_backoff        = "300s"
    max_doublings      = 2
  }
}

# Queue for denylist sync
resource "google_cloud_tasks_queue" "sync_denylist" {
  name     = "${var.service_name}-sync-denylist-queue"
  location = var.region
  project  = var.project_id

  rate_limits {
    max_concurrent_dispatches = 1
  }

  retry_config {
    max_attempts       = 3
    min_backoff        = "10s"
    max_backoff        = "300s"
    max_doublings      = 2
  }
}

# ------------------------------------------------------------------------------
# IAM Permissions
# ------------------------------------------------------------------------------

# Use the Default Compute Service Account (used by Cloud Run by default)
# Format: [PROJECT_NUMBER]-compute@developer.gserviceaccount.com
locals {
  cloud_run_sa_email = "${var.project_number}-compute@developer.gserviceaccount.com"
}

# Enable the Cloud Run service account to enqueue tasks
resource "google_project_iam_member" "cloud_run_cloud_tasks_enqueuer" {
  project = var.project_id
  role    = "roles/cloudtasks.enqueuer"
  member  = "serviceAccount:${local.cloud_run_sa_email}"
}

# Enable Cloud Tasks to invoke Cloud Run
# We use the Cloud Run service account identity for the OIDC token in the Task.
# So the service account needs to be able to invoke the Cloud Run service.
resource "google_cloud_run_service_iam_member" "cloud_tasks_invoker" {
  location = google_cloud_run_service.main.location
  project  = google_cloud_run_service.main.project
  service  = google_cloud_run_service.main.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${local.cloud_run_sa_email}"
}

# Outputs for Queue IDs
output "queue_ids" {
  description = "The IDs of the created Cloud Tasks queues"
  value = {
    update                    = google_cloud_tasks_queue.update.id
    discovery                 = google_cloud_tasks_queue.discovery.id
    sync_stats                = google_cloud_tasks_queue.sync_stats.id
    sync_recommendation_scores = google_cloud_tasks_queue.sync_recommendation_scores.id
    sync_denylist             = google_cloud_tasks_queue.sync_denylist.id
  }
}

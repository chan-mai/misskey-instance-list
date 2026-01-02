# ------------------------------------------------------------------------------
# Cloud Run Service
# ------------------------------------------------------------------------------
resource "google_cloud_run_service" "main" {
  name     = var.service_name
  location = var.region
  project  = var.project_id

  template {
    spec {
      timeout_seconds = 1800
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
        env {
          name  = "GCP_PROJECT_ID"
          value = var.project_id
        }
        env {
          name  = "GCP_REGION"
          value = var.region
        }
        env {
          name  = "SERVICE_NAME"
          value = var.service_name
        }
        env {
          name = "ADMIN_USER"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.admin_user.secret_id
              key  = "latest"
            }
          }
        }
        env {
          name = "ADMIN_PASSWORD"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.admin_password.secret_id
              key  = "latest"
            }
          }
        }
        env {
          name  = "SERVICE_ACCOUNT_EMAIL"
          value = "${var.project_number}-compute@developer.gserviceaccount.com"
        }
        ports {
          container_port = 3000
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

# カスタムドメインマッピング
resource "google_cloud_run_domain_mapping" "custom_domain" {
  count    = var.custom_domain != "" ? 1 : 0
  location = google_cloud_run_service.main.location
  project  = google_cloud_run_service.main.project
  name     = var.custom_domain

  metadata {
    namespace = google_cloud_run_service.main.project
  }

  spec {
    route_name = google_cloud_run_service.main.name
  }
}

# Cloud Run Service
resource "google_cloud_run_service" "misskey_instance_list" {
  name     = "misskey-instance-list"
  location = "asia-northeast1"
  project  = "misskey-482105"

  template {
    spec {
      containers {
        image = "asia-northeast1-docker.pkg.dev/misskey-482105/cloud-run-source-deploy/misskey-instance-list:latest"
        
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
  location = google_cloud_run_service.misskey_instance_list.location
  project  = google_cloud_run_service.misskey_instance_list.project
  service  = google_cloud_run_service.misskey_instance_list.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

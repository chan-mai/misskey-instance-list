resource "google_secret_manager_secret" "database_url" {
  labels    = { managed-by-cnrm = "true" }
  project   = "1023578240084"
  secret_id = "DATABASE_URL"
  replication {
    auto {} 
  }
}

resource "google_secret_manager_secret" "task_secret" {
  labels    = { managed-by-cnrm = "true" }
  project   = "1023578240084"
  secret_id = "TASK_SECRET"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "github_token" {
  labels    = { managed-by-cnrm = "true" }
  project   = "1023578240084"
  secret_id = "GITHUB_TOKEN"
  replication {
    auto {}
  }
}

# 既存の TASK_SECRET の最新バージョンを取得
data "google_secret_manager_secret_version" "task_secret" {
  secret  = google_secret_manager_secret.task_secret.id
  version = "latest"
}

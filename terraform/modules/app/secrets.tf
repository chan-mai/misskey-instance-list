# ------------------------------------------------------------------------------
# Secret Manager
# ------------------------------------------------------------------------------

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

# --- SERVICE_URL ---
resource "google_secret_manager_secret" "service_url" {
  labels    = { managed-by-cnrm = "true" }
  project   = var.project_number
  secret_id = "${local.secret_prefix}SERVICE_URL"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "service_url" {
  secret      = google_secret_manager_secret.service_url.id
  secret_data = var.service_url
}

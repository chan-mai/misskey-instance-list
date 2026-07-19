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

# --- ZITADEL_CLIENT_ID ---
resource "google_secret_manager_secret" "zitadel_client_id" {
  labels    = { managed-by-cnrm = "true" }
  project   = var.project_number
  secret_id = "${local.secret_prefix}ZITADEL_CLIENT_ID"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "zitadel_client_id" {
  secret      = google_secret_manager_secret.zitadel_client_id.id
  secret_data = var.zitadel_client_id
}

# --- ZITADEL_CLIENT_SECRET ---
resource "google_secret_manager_secret" "zitadel_client_secret" {
  labels    = { managed-by-cnrm = "true" }
  project   = var.project_number
  secret_id = "${local.secret_prefix}ZITADEL_CLIENT_SECRET"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "zitadel_client_secret" {
  secret      = google_secret_manager_secret.zitadel_client_secret.id
  secret_data = var.zitadel_client_secret
}

# --- OIDC_SESSION_SECRET ---
resource "google_secret_manager_secret" "oidc_session_secret" {
  labels    = { managed-by-cnrm = "true" }
  project   = var.project_number
  secret_id = "${local.secret_prefix}OIDC_SESSION_SECRET"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "oidc_session_secret" {
  secret      = google_secret_manager_secret.oidc_session_secret.id
  secret_data = var.oidc_session_secret
}

# --- OIDC_TOKEN_KEY ---
resource "google_secret_manager_secret" "oidc_token_key" {
  labels    = { managed-by-cnrm = "true" }
  project   = var.project_number
  secret_id = "${local.secret_prefix}OIDC_TOKEN_KEY"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "oidc_token_key" {
  secret      = google_secret_manager_secret.oidc_token_key.id
  secret_data = var.oidc_token_key
}

# --- OIDC_AUTH_SESSION_SECRET ---
resource "google_secret_manager_secret" "oidc_auth_session_secret" {
  labels    = { managed-by-cnrm = "true" }
  project   = var.project_number
  secret_id = "${local.secret_prefix}OIDC_AUTH_SESSION_SECRET"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "oidc_auth_session_secret" {
  secret      = google_secret_manager_secret.oidc_auth_session_secret.id
  secret_data = var.oidc_auth_session_secret
}

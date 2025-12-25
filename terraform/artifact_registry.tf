resource "google_artifact_registry_repository" "cloud_run_source_deploy" {
  description   = "Cloud Run Source Deployments"
  format        = "DOCKER"
  labels        = { managed-by-cnrm = "true" }
  location      = "asia-northeast1"
  mode          = "STANDARD_REPOSITORY"
  project       = "misskey-482105"
  repository_id = "cloud-run-source-deploy"
}

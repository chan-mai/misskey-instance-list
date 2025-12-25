resource "google_cloudbuild_trigger" "misskey_instance_list" {
  description = "Build and deploy to Cloud Run service misskey-instance-list on push to \"^main$\""
  filename    = "cloudbuild.yaml"
  location    = "global"
  name        = "rmgpgab-misskey-instance-list-asia-northeast1-chan-mai-misskhac"
  project     = "misskey-482105"
  
  github {
    name  = "misskey-instance-list"
    owner = "chan-mai"
    push {
      branch = "^main$"
    }
  }

  substitutions = {
    "_AR_HOSTNAME"   = "asia-northeast1-docker.pkg.dev"
    "_AR_PROJECT_ID" = "misskey-482105"
    "_AR_REPOSITORY" = "cloud-run-source-deploy"
    "_DEPLOY_REGION" = "asia-northeast1"
    "_PLATFORM"      = "managed"
    "_SERVICE_NAME"  = "misskey-instance-list"
    "_TRIGGER_ID"    = "a68e27a3-9860-41ff-b3d6-dc7049f7ee96"
  }

  service_account    = "projects/misskey-482105/serviceAccounts/1023578240084-compute@developer.gserviceaccount.com"
  include_build_logs = "INCLUDE_BUILD_LOGS_WITH_STATUS"

  tags = [
    "gcp-cloud-build-deploy-cloud-run",
    "gcp-cloud-build-deploy-cloud-run-managed",
    "misskey-instance-list"
  ]
}

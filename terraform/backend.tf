terraform {
  backend "s3" {
    bucket = "REPLACEME"  # Will be overridden in GitHub Actions
    key    = "REPLACEME"
    region = "REPLACEME"
  }
}
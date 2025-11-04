# Minimal IaC skeleton for Volunbase

resource "aws_s3_bucket" "artifacts" {
  bucket = "volunbase-artifacts-${random_id.suffix.hex}"
  force_destroy = true
}

resource "random_id" "suffix" {
  byte_length = 4
}

output "artifacts_bucket" {
  value = aws_s3_bucket.artifacts.bucket
}


resource "random_id" "site_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "site" {
  bucket        = "volunbase-site-${random_id.site_suffix.hex}"
  force_destroy = true
}

# Optional website config (not used by CloudFront origin); keeping index/error for reference
#resource "aws_s3_bucket_website_configuration" "site" {
#  bucket = aws_s3_bucket.site.id
#  index_document {
#    suffix = "index.html"
#  }
#  error_document {
#    key = "404.html"
#  }
#}

resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "Volunbase CDN access"
}

resource "aws_s3_bucket_policy" "oai_read" {
  bucket = aws_s3_bucket.site.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Sid      = "AllowCloudFrontOAIRead",
      Effect   = "Allow",
      Principal = { CanonicalUser = aws_cloudfront_origin_access_identity.oai.s3_canonical_user_id },
      Action   = ["s3:GetObject"],
      Resource = ["${aws_s3_bucket.site.arn}/*"],
    }]
  })
}

resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.site.bucket
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = aws_s3_bucket.site.bucket
    viewer_protocol_policy = "redirect-to-https"
    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

output "site_bucket_name" {
  value = aws_s3_bucket.site.bucket
}

output "cdn_domain_name" {
  value = aws_cloudfront_distribution.cdn.domain_name
}

output "cdn_distribution_id" {
  value = aws_cloudfront_distribution.cdn.id
}

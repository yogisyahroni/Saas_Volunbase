resource "random_id" "site_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "site" {
  bucket        = "volunbase-site-${random_id.site_suffix.hex}"
  force_destroy = true
}

resource "aws_s3_bucket_website_configuration" "site" {
  bucket = aws_s3_bucket.site.id
  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "404.html"
  }
}

resource "aws_s3_bucket_policy" "public_read" {
  bucket = aws_s3_bucket.site.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Sid       = "PublicReadGetObject",
      Effect    = "Allow",
      Principal = "*",
      Action    = ["s3:GetObject"],
      Resource  = ["${aws_s3_bucket.site.arn}/*"],
    }]
  })
}

resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name = aws_s3_bucket_website_configuration.site.website_endpoint
    origin_id   = aws_s3_bucket.site.bucket
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


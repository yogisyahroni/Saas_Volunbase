variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "dynamo_table" {
  description = "DynamoDB table name"
  type        = string
  default     = "VolunbaseTable"
}

variable "ses_from_email" {
  description = "SES from email"
  type        = string
  default     = "no-reply@volunbase.com"
}


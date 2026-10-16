variable "aws_region" {
  description = "AWS region to deploy resources in"
  type        = string
  default     = "ap-south-1"
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "helpdesk-eks"
}

variable "environment" {
  description = "Deployment environment tag"
  type        = string
  default     = "dev"
}

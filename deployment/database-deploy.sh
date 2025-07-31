#!/bin/bash
set -e

# Database Deployment Script for SQLite with Litestream
# This script sets up an S3 bucket for SQLite replication with Litestream

# Prerequisites:
# 1. AWS CLI installed and configured: aws configure
# 2. Or another S3-compatible storage provider (MinIO, DigitalOcean Spaces, etc.)

# Configuration
BUCKET_NAME="only-fans-cam"
REGION="us-east-1"
S3_PROVIDER="aws" # Options: aws, minio, digitalocean, backblaze, etc.

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting database deployment setup for SQLite with Litestream...${NC}"

# Function to create AWS S3 bucket
create_aws_bucket() {
  echo -e "${YELLOW}Creating AWS S3 bucket...${NC}"
  
  # Check if bucket already exists
  if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
    echo -e "${YELLOW}Bucket $BUCKET_NAME already exists.${NC}"
  else
    # Create bucket with region-specific configuration
    if [[ "$REGION" != "us-east-1" ]]; then
      aws s3api create-bucket \
        --bucket "$BUCKET_NAME" \
        --region "$REGION" \
        --create-bucket-configuration LocationConstraint=$REGION || \
        { echo -e "${RED}Error: Failed to create S3 bucket${NC}"; exit 1; }
    else
      aws s3api create-bucket \
        --bucket "$BUCKET_NAME" \
        --region "$REGION" || \
        { echo -e "${RED}Error: Failed to create S3 bucket${NC}"; exit 1; }
    fi
    
    echo -e "${GREEN}S3 bucket $BUCKET_NAME created successfully!${NC}"
  fi
  
  # Enable versioning (optional but recommended)
  aws s3api put-bucket-versioning \
    --bucket "$BUCKET_NAME" \
    --versioning-configuration Status=Enabled || \
    echo -e "${YELLOW}Warning: Failed to enable bucket versioning${NC}"
  
  # Set lifecycle policy to expire old versions after 30 days (optional)
  echo -e "${YELLOW}Setting lifecycle policy...${NC}"
  cat > lifecycle.json << EOL
{
  "Rules": [
    {
      "ID": "ExpireOldVersions",
      "Status": "Enabled",
      "Filter": {
        "Prefix": ""
      },
      "NoncurrentVersionExpiration": {
        "NoncurrentDays": 30
      }
    }
  ]
}
EOL
  
  aws s3api put-bucket-lifecycle-configuration \
    --bucket "$BUCKET_NAME" \
    --lifecycle-configuration file://lifecycle.json || \
    echo -e "${YELLOW}Warning: Failed to set lifecycle policy${NC}"
  
  # Clean up
  rm -f lifecycle.json
}

# Function to create MinIO bucket (for local or self-hosted deployments)
create_minio_bucket() {
  echo -e "${YELLOW}For MinIO setup:${NC}"
  echo "1. Ensure MinIO server is running"
  echo "2. Use the MinIO Client (mc) to create a bucket:"
  echo "   mc config host add myminio http://MINIO_HOST:9000 MINIO_ACCESS_KEY MINIO_SECRET_KEY"
  echo "   mc mb myminio/$BUCKET_NAME"
  echo "3. Set the following environment variables in your backend deployment:"
  echo "   - LITESTREAM_BUCKET=$BUCKET_NAME"
  echo "   - AWS_ACCESS_KEY_ID=your_minio_access_key"
  echo "   - AWS_SECRET_ACCESS_KEY=your_minio_secret_key"
  echo "   - AWS_REGION=us-east-1"
  echo "   - AWS_ENDPOINT=http://MINIO_HOST:9000"
  echo "   - AWS_S3_FORCE_PATH_STYLE=true"
}

# Function to create DigitalOcean Spaces bucket
create_do_bucket() {
  echo -e "${YELLOW}For DigitalOcean Spaces setup:${NC}"
  echo "1. Create a Space in the DigitalOcean dashboard"
  echo "2. Create API keys in the DigitalOcean dashboard"
  echo "3. Set the following environment variables in your backend deployment:"
  echo "   - LITESTREAM_BUCKET=$BUCKET_NAME"
  echo "   - AWS_ACCESS_KEY_ID=your_do_spaces_key"
  echo "   - AWS_SECRET_ACCESS_KEY=your_do_spaces_secret"
  echo "   - AWS_REGION=your_do_region (e.g., nyc3)"
  echo "   - AWS_ENDPOINT=https://your_do_region.digitaloceanspaces.com"
}

# Function to create Backblaze B2 bucket
create_b2_bucket() {
  echo -e "${YELLOW}For Backblaze B2 setup:${NC}"
  echo "1. Create a bucket in the Backblaze B2 dashboard"
  echo "2. Create application keys in the Backblaze B2 dashboard"
  echo "3. Set the following environment variables in your backend deployment:"
  echo "   - LITESTREAM_BUCKET=$BUCKET_NAME"
  echo "   - AWS_ACCESS_KEY_ID=your_b2_key_id"
  echo "   - AWS_SECRET_ACCESS_KEY=your_b2_application_key"
  echo "   - AWS_REGION=us-west-002"
  echo "   - AWS_ENDPOINT=https://s3.us-west-002.backblazeb2.com"
}

# Create bucket based on selected provider
case "$S3_PROVIDER" in
  aws)
    create_aws_bucket
    ;;
  minio)
    create_minio_bucket
    ;;
  digitalocean)
    create_do_bucket
    ;;
  backblaze)
    create_b2_bucket
    ;;
  *)
    echo -e "${RED}Error: Unsupported S3 provider: $S3_PROVIDER${NC}"
    echo -e "${YELLOW}Supported providers: aws, minio, digitalocean, backblaze${NC}"
    exit 1
    ;;
esac

# Instructions for Litestream configuration
echo -e "${GREEN}S3 bucket setup completed!${NC}"
echo -e "${YELLOW}Litestream Configuration:${NC}"
echo "1. Ensure the following environment variables are set in your backend deployment:"
echo "   - LITESTREAM_BUCKET=$BUCKET_NAME"
echo "   - AWS_ACCESS_KEY_ID=your_access_key"
echo "   - AWS_SECRET_ACCESS_KEY=your_secret_key"
echo "   - AWS_REGION=$REGION"

echo -e "${YELLOW}Note: The SQLite database will be automatically replicated to the S3 bucket by Litestream.${NC}"
echo -e "${YELLOW}In case of a disaster, the database will be automatically restored from the S3 bucket.${NC}"
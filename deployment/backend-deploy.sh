#!/bin/bash
set -e

# Backend Deployment Script for Render
# This script prepares and deploys the Node.js/Express backend to Render

# Prerequisites:
# 1. Render account created
# 2. Render CLI installed (if available) or use Render Dashboard
# 3. Docker installed (for local testing)

# Configuration
BACKEND_DIR="../back-end"
SERVICE_NAME="onlyfans-backend"
RENDER_YAML="render.yaml"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting backend deployment preparation for Render...${NC}"

# Navigate to backend directory
cd "$BACKEND_DIR" || { echo -e "${RED}Error: Backend directory not found${NC}"; exit 1; }

# Create render.yaml configuration file
echo -e "${YELLOW}Creating Render configuration file...${NC}"
cat > "$RENDER_YAML" << EOL
services:
  - type: web
    name: ${SERVICE_NAME}
    env: docker
    dockerfilePath: ./Dockerfile
    region: oregon # Change to your preferred region
    plan: standard # Change to your preferred plan
    branch: main # Change to your deployment branch
    numInstances: 1
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: JWT_SECRET
        sync: false # This will be set manually in the Render dashboard
      - key: LITESTREAM_BUCKET
        sync: false # This will be set manually in the Render dashboard
      - key: AWS_ACCESS_KEY_ID
        sync: false # This will be set manually in the Render dashboard
      - key: AWS_SECRET_ACCESS_KEY
        sync: false # This will be set manually in the Render dashboard
      - key: AWS_REGION
        value: us-east-1 # Change to your preferred region
    disk:
      name: data
      mountPath: /app/data
      sizeGB: 1
    disk:
      name: uploads
      mountPath: /app/uploads
      sizeGB: 10
EOL

echo -e "${GREEN}Render configuration file created: $RENDER_YAML${NC}"

# Test Docker build locally
echo -e "${YELLOW}Testing Docker build locally...${NC}"
if docker build -t ${SERVICE_NAME}:local .; then
  echo -e "${GREEN}Docker build successful!${NC}"
else
  echo -e "${RED}Docker build failed. Please fix the issues before deploying.${NC}"
  exit 1
fi

git add .
git commit -m "deployment commit"
git push origin main

# Instructions for deployment
echo -e "${GREEN}Preparation completed!${NC}"
echo -e "${YELLOW}To deploy to Render:${NC}"
echo "1. Create a new Web Service in the Render Dashboard"
echo "2. Connect your GitHub/GitLab repository"
echo "3. Select 'Docker' as the environment"
echo "4. Set the following environment variables in the Render Dashboard:"
echo "   - JWT_SECRET (generate a secure random string)"
echo "   - LITESTREAM_BUCKET (your S3 bucket name)"
echo "   - AWS_ACCESS_KEY_ID (your AWS access key)"
echo "   - AWS_SECRET_ACCESS_KEY (your AWS secret key)"
echo "   - AWS_REGION (your AWS region)"
echo "5. Configure the disks for data and uploads"
echo "6. Click 'Create Web Service'"

echo -e "${YELLOW}Alternatively, if you have the Render CLI installed:${NC}"
echo "Run: render blueprint apply"
echo "This will create all the resources defined in the render.yaml file."

echo -e "${YELLOW}Your backend will be available at: https://${SERVICE_NAME}.onrender.com${NC}"
echo -e "${YELLOW}You can also set up a custom domain in the Render dashboard.${NC}"

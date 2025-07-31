#!/bin/bash
set -e

# Frontend Deployment Script for Netlify
# This script builds and deploys the React frontend to Netlify

# Prerequisites:
# 1. Node.js and npm installed
# 2. Netlify CLI installed: npm install -g netlify-cli
# 3. Netlify account and site created
# 4. Netlify CLI authenticated: netlify login

# Configuration
FRONTEND_DIR="../front-end"
SITE_NAME="onlyfans-frontend" # Change this to your Netlify site name

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting frontend deployment to Netlify...${NC}"

# Navigate to frontend directory
cd "$FRONTEND_DIR" || { echo -e "${RED}Error: Frontend directory not found${NC}"; exit 1; }

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install || { echo -e "${RED}Error: Failed to install dependencies${NC}"; exit 1; }

# Build the project
echo -e "${YELLOW}Building the project...${NC}"
npm run build || { echo -e "${RED}Error: Build failed${NC}"; exit 1; }

# Deploy to Netlify
echo -e "${YELLOW}Deploying to Netlify...${NC}"
if netlify deploy --prod --dir=build --site="$SITE_NAME"; then
  echo -e "${GREEN}Frontend successfully deployed to Netlify!${NC}"
else
  # If the deploy command fails, try the manual deploy option
  echo -e "${YELLOW}Automatic deployment failed. Trying manual deployment...${NC}"
  netlify deploy --prod --dir=build
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Frontend successfully deployed to Netlify!${NC}"
  else
    echo -e "${RED}Error: Deployment to Netlify failed${NC}"
    echo -e "${YELLOW}You can try manual deployment:${NC}"
    echo "1. Create a new site on Netlify: netlify sites:create"
    echo "2. Deploy the build folder: netlify deploy --prod --dir=build"
    exit 1
  fi
fi

# Output deployment information
echo -e "${GREEN}Deployment completed!${NC}"
echo -e "${YELLOW}Your site should be available at: https://$SITE_NAME.netlify.app${NC}"
echo -e "${YELLOW}You can also set up a custom domain in the Netlify dashboard.${NC}"
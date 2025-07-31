#!/bin/bash
set -e

# Main Deployment Script for OnlyFans Application
# This script orchestrates the deployment of all components

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Print header
echo -e "${BLUE}=======================================================${NC}"
echo -e "${BLUE}       OnlyFans Application Deployment Script          ${NC}"
echo -e "${BLUE}=======================================================${NC}"
echo

# Function to display usage
usage() {
  echo -e "${YELLOW}Usage:${NC}"
  echo "  $0 [options]"
  echo
  echo -e "${YELLOW}Options:${NC}"
  echo "  --all                Deploy all components"
  echo "  --frontend           Deploy only the frontend"
  echo "  --backend            Deploy only the backend"
  echo "  --database           Deploy only the database"
  echo "  --help               Display this help message"
  echo
  echo -e "${YELLOW}Examples:${NC}"
  echo "  $0 --all             # Deploy all components"
  echo "  $0 --frontend        # Deploy only the frontend"
  echo
}

# Parse command line arguments
if [ $# -eq 0 ]; then
  usage
  exit 1
fi

DEPLOY_FRONTEND=false
DEPLOY_BACKEND=false
DEPLOY_DATABASE=false

while [ $# -gt 0 ]; do
  case "$1" in
    --all)
      DEPLOY_FRONTEND=true
      DEPLOY_BACKEND=true
      DEPLOY_DATABASE=true
      ;;
    --frontend)
      DEPLOY_FRONTEND=true
      ;;
    --backend)
      DEPLOY_BACKEND=true
      ;;
    --database)
      DEPLOY_DATABASE=true
      ;;
    --help)
      usage
      exit 0
      ;;
    *)
      echo -e "${RED}Error: Unknown option: $1${NC}"
      usage
      exit 1
      ;;
  esac
  shift
done

# Function to deploy a component
deploy_component() {
  local component=$1
  local script=$2
  
  echo -e "${BLUE}=======================================================${NC}"
  echo -e "${BLUE}Deploying $component...${NC}"
  echo -e "${BLUE}=======================================================${NC}"
  
  if [ -f "$script" ]; then
    chmod +x "$script"
    "$script"
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}$component deployment completed successfully!${NC}"
    else
      echo -e "${RED}$component deployment failed!${NC}"
      exit 1
    fi
  else
    echo -e "${RED}Error: Deployment script not found: $script${NC}"
    exit 1
  fi
  
  echo
}

# Deploy database if requested
if [ "$DEPLOY_DATABASE" = true ]; then
  deploy_component "Database" "$SCRIPT_DIR/database-deploy.sh"
fi

# Deploy backend if requested
if [ "$DEPLOY_BACKEND" = true ]; then
  deploy_component "Backend" "$SCRIPT_DIR/backend-deploy.sh"
fi

# Deploy frontend if requested
if [ "$DEPLOY_FRONTEND" = true ]; then
  deploy_component "Frontend" "$SCRIPT_DIR/frontend-deploy.sh"
fi

# Print summary
echo -e "${BLUE}=======================================================${NC}"
echo -e "${BLUE}Deployment Summary${NC}"
echo -e "${BLUE}=======================================================${NC}"
echo

if [ "$DEPLOY_DATABASE" = true ]; then
  echo -e "${GREEN}✓${NC} Database deployed"
else
  echo -e "${YELLOW}✗${NC} Database not deployed"
fi

if [ "$DEPLOY_BACKEND" = true ]; then
  echo -e "${GREEN}✓${NC} Backend deployed"
else
  echo -e "${YELLOW}✗${NC} Backend not deployed"
fi

if [ "$DEPLOY_FRONTEND" = true ]; then
  echo -e "${GREEN}✓${NC} Frontend deployed"
else
  echo -e "${YELLOW}✗${NC} Frontend not deployed"
fi

echo
echo -e "${GREEN}Deployment process completed!${NC}"
echo -e "${YELLOW}For more information, please refer to the deployment documentation in README.md${NC}"
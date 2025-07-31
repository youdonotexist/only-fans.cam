# OnlyFans Application Deployment Guide

This guide provides instructions for deploying the OnlyFans application, which consists of a React frontend, Node.js/Express backend, and SQLite database with Litestream replication.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Deployment Architecture](#deployment-architecture)
- [Deployment Scripts](#deployment-scripts)
- [Deployment Steps](#deployment-steps)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

## Overview

The OnlyFans application is a web application for users to upload photos of their favorite fans (box fans, ceiling fans, industrial fans, etc.) along with descriptions. The application consists of three main components:

1. **Frontend**: React application
2. **Backend**: Node.js/Express API with TypeScript
3. **Database**: SQLite with Litestream replication for backup and disaster recovery

## Prerequisites

Before deploying the application, ensure you have the following:

- **For all deployments**:
  - Git repository with the application code
  - Node.js and npm installed locally

- **For frontend deployment**:
  - Netlify account
  - Netlify CLI installed: `npm install -g netlify-cli`
  - Netlify CLI authenticated: `netlify login`

- **For backend deployment**:
  - Render account
  - Docker installed locally (for testing)
  - For macOS users: Colima installed and running (`brew install colima` and `colima start`)

- **For database deployment**:
  - AWS account or another S3-compatible storage provider
  - AWS CLI installed and configured (if using AWS)

## Deployment Architecture

The application is deployed using the following architecture:

- **Frontend**: Deployed to Netlify, a static site hosting service
- **Backend**: Deployed to Render as a Docker container
- **Database**: SQLite database with Litestream replication to an S3-compatible storage

This architecture provides a good balance of simplicity, cost-effectiveness, and reliability.

## Deployment Scripts

The deployment process is automated using the following scripts:

- `deploy.sh`: Main deployment script that orchestrates the deployment of all components
- `frontend-deploy.sh`: Deploys the React frontend to Netlify
- `backend-deploy.sh`: Prepares and deploys the Node.js/Express backend to Render
- `database-deploy.sh`: Sets up an S3 bucket for SQLite replication with Litestream

## Deployment Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd onlyfans
```

### 2. Deploy the Database

The database deployment script sets up an S3 bucket for SQLite replication with Litestream.

```bash
cd deployment
chmod +x database-deploy.sh
./database-deploy.sh
```

Follow the instructions provided by the script to configure the S3 bucket for your chosen provider.

### 3. Deploy the Backend

The backend deployment script prepares and deploys the Node.js/Express backend to Render.

```bash
cd deployment
chmod +x backend-deploy.sh
./backend-deploy.sh
```

Follow the instructions provided by the script to complete the deployment on Render.

### 4. Deploy the Frontend

The frontend deployment script builds and deploys the React frontend to Netlify.

```bash
cd deployment
chmod +x frontend-deploy.sh
./frontend-deploy.sh
```

### 5. Deploy All Components at Once

Alternatively, you can use the main deployment script to deploy all components at once:

```bash
cd deployment
chmod +x deploy.sh
./deploy.sh --all
```

Or deploy specific components:

```bash
./deploy.sh --frontend  # Deploy only the frontend
./deploy.sh --backend   # Deploy only the backend
./deploy.sh --database  # Deploy only the database
```

## Environment Variables

### Frontend Environment Variables

Create a `.env` file in the `front-end` directory with the following variables:

```
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

### Backend Environment Variables

Set the following environment variables in the Render dashboard:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=your_jwt_secret
LITESTREAM_BUCKET=your_s3_bucket_name
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
```

## Troubleshooting

### Frontend Deployment Issues

- **Build fails**: Check the build logs in Netlify for errors. Common issues include missing dependencies or syntax errors.
- **API connection issues**: Ensure the `REACT_APP_API_URL` environment variable is set correctly.

### Backend Deployment Issues

- **Docker build fails**: Check the Dockerfile for errors. Ensure all dependencies are correctly specified.
- **Docker daemon connection issues**: For macOS users, ensure Colima is running with `colima status`. If not running, start it with `colima start`.
- **Application crashes**: Check the logs in the Render dashboard for errors.
- **Database connection issues**: Ensure the database file path is correct and the application has write permissions.

### Database Replication Issues

- **Replication fails**: Check the Litestream logs for errors. Ensure the S3 bucket exists and the AWS credentials are correct.
- **Restore fails**: Ensure the backup exists in the S3 bucket and the AWS credentials have read permissions.

## Maintenance

### Updating the Application

1. Push changes to the Git repository
2. Re-run the deployment scripts for the affected components

### Monitoring

- **Frontend**: Use Netlify analytics to monitor traffic and performance
- **Backend**: Use Render logs and metrics to monitor the application
- **Database**: Check the Litestream logs to ensure replication is working correctly

### Backup and Restore

The SQLite database is automatically backed up to the S3 bucket by Litestream. In case of a disaster, the database will be automatically restored from the S3 bucket when the application starts.

To manually restore the database:

1. Stop the application
2. Delete the existing database file
3. Start the application (Litestream will automatically restore the database)
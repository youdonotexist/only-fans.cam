# Only Fans Backend

This is the backend for the Only Fans application, a website for users to upload photos of their favorite fans (box fans, ceiling fans, industrial fans, desk fans, floor fans, old timey fans, etc) along with descriptions.

## Technologies Used

- Node.js
- TypeScript
- Express.js
- SQLite
- Litestream (for SQLite replication)
- Docker
- Kubernetes

## Project Structure

```
back-end/
├── src/                  # Source code
│   ├── database/         # Database initialization and utilities
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   └── index.ts          # Application entry point
├── k8s/                  # Kubernetes deployment files
├── data/                 # SQLite database files (gitignored)
├── uploads/              # Uploaded media files (gitignored)
├── dist/                 # Compiled TypeScript (gitignored)
├── Dockerfile            # Docker image definition
├── docker-compose.yml    # Local development with Docker
├── litestream.yml        # Litestream configuration
├── start.sh              # Container startup script
├── package.json          # Node.js dependencies
└── tsconfig.json         # TypeScript configuration
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Users

- `GET /api/users/me` - Get current user profile
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/me` - Update current user profile
- `DELETE /api/users/me` - Delete current user
- `GET /api/users` - Search users

### Fans

- `POST /api/fans` - Create a new fan post
- `GET /api/fans` - Get all fans with pagination
- `GET /api/fans/:id` - Get a fan by ID
- `PUT /api/fans/:id` - Update a fan
- `DELETE /api/fans/:id` - Delete a fan
- `GET /api/fans/user/:userId` - Get all fans by a specific user
- `POST /api/fans/:id/like` - Like a fan
- `DELETE /api/fans/:id/like` - Unlike a fan
- `POST /api/fans/:id/comment` - Comment on a fan

### Follows

- `POST /api/follows/:userId` - Follow a user
- `DELETE /api/follows/:userId` - Unfollow a user
- `GET /api/follows/followers/:userId` - Get followers of a user
- `GET /api/follows/following/:userId` - Get users that a user is following
- `GET /api/follows/check/:userId` - Check if current user is following a specific user

### Media

- `POST /api/media/upload/:fanId` - Upload media for a fan
- `GET /api/media/:id` - Get media by ID
- `GET /api/media/fan/:fanId` - Get all media for a fan
- `DELETE /api/media/:id` - Delete media
- `GET /api/media/serve/:filename` - Serve media file

## Development

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Docker and Docker Compose (for local development with containers)

### Local Development

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file with the following variables:

```
NODE_ENV=development
PORT=3000
JWT_SECRET=your_jwt_secret
```

3. Start the development server:

```bash
npm run dev
```

### Using Docker Compose

1. Start the services:

```bash
docker-compose up -d
```

2. View logs:

```bash
docker-compose logs -f
```

3. Stop the services:

```bash
docker-compose down
```

## Deployment to Kubernetes

### Prerequisites

- Kubernetes cluster
- kubectl configured to access your cluster
- Docker registry to store the container image

### Deployment Steps

1. Build and push the Docker image:

```bash
docker build -t your-registry/onlyfans-backend:latest .
docker push your-registry/onlyfans-backend:latest
```

2. Update the image reference in `k8s/deployment.yaml`:

```yaml
image: your-registry/onlyfans-backend:latest
```

3. Update the host in `k8s/service.yaml`:

```yaml
- host: api.your-domain.com
```

4. Create the Kubernetes resources:

```bash
kubectl apply -f k8s/config.yaml
kubectl apply -f k8s/storage.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

5. Check the status:

```bash
kubectl get pods
kubectl get services
kubectl get ingress
```

## Litestream Configuration

Litestream is used to replicate the SQLite database to an S3-compatible storage for backup and disaster recovery. To enable Litestream:

1. Set the following environment variables:
   - `LITESTREAM_BUCKET`: The S3 bucket name
   - `AWS_ACCESS_KEY_ID`: Your AWS access key ID
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key
   - `AWS_REGION`: The AWS region (e.g., us-east-1)

2. For local development with Docker Compose, uncomment the Litestream environment variables in `docker-compose.yml`.

3. For Kubernetes deployment, update the values in `k8s/config.yaml`.
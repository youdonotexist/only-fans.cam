# Use Node.js as base image
FROM node:18-alpine

# Install dependencies
RUN apk add --no-cache bash curl unzip

# Install Litestream
RUN curl -L https://github.com/benbjohnson/litestream/releases/download/v0.3.9/litestream-v0.3.9-linux-amd64.tar.gz | tar -xz && \
    mv litestream /usr/local/bin/litestream

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Make start script executable
RUN chmod +x start.sh

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Start the application with Litestream
CMD ["./start.sh"]
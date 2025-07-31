#!/bin/bash
set -e

# Environment variables
DB_PATH="./TEMP/app/data/onlyfans.db"
LITESTREAM_CONFIG="./litestream.yml"

# Create data directory if it doesn't exist
mkdir -p ./TEMP/app/data

# Check if we need to restore the database from S3
if [ ! -f "$DB_PATH" ] && [ -n "$LITESTREAM_BUCKET" ]; then
  echo "Database file not found, attempting to restore from S3..."
  litestream restore -config "$LITESTREAM_CONFIG" "$DB_PATH" || true
fi

const testFolder = '.';
const fs = require('fs');

fs.readdir(testFolder, (err, files) => {
  files.forEach(file => {
    // will also include directory names
    console.log(file);
  });
});

# Start Litestream replication in the background if bucket is configured
if [ -n "$LITESTREAM_BUCKET" ]; then
  echo "Starting Litestream replication..."
  litestream replicate -config "$LITESTREAM_CONFIG" &
  LITESTREAM_PID=$!
fi

# Start the Node.js application
echo "Starting Node.js application..."
node dist/index.js &
NODE_PID=$!

# Handle shutdown signals
trap 'kill $LITESTREAM_PID $NODE_PID; exit 0' SIGINT SIGTERM

# Wait for processes to exit
wait
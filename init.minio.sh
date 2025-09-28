#!/bin/sh
# init.minio.sh

# Set variables
MINIO_ROOT_USER=${MINIO_ROOT_USER:-superAdmin}
MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD:-sadmin1990}
BUCKET_NAME="sistema-archivos-simr"

echo "Starting MinIO server in background..."
minio server /data --console-address ":9001" &
MINIO_PID=$!

echo "Waiting for MinIO to start..."
until mc alias set minio http://localhost:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD > /dev/null 2>&1; do
    echo "Waiting for MinIO connection..."
    sleep 2
done

echo "MinIO is ready, creating bucket..."

# Create bucket if it doesn't exist
if ! mc ls minio/$BUCKET_NAME > /dev/null 2>&1; then
    mc mb minio/$BUCKET_NAME
    echo "Bucket '$BUCKET_NAME' created successfully"
else
    echo "Bucket '$BUCKET_NAME' already exists"
fi

# Set policy to allow public read access
mc anonymous set public minio/$BUCKET_NAME

echo "MinIO initialization complete"

# Wait for MinIO process
wait $MINIO_PID
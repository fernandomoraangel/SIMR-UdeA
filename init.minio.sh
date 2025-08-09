#!/bin/bash
# init.minio.sh

# Install mc
apt-get update
apt-get install -y mc

# Set variables
MINIO_ROOT_USER=${MINIO_ROOT_USER:-superAdmin}
MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD:-sadmin1990}
BUCKET_NAME="sistema-archivos-simr"

# Wait for MinIO to start
until $(curl --silent --fail http://localhost:9000/minio/health/live > /dev/null 2>&1); do
    printf '.'
    sleep 1
done

# Create bucket
mc alias set minio http://localhost:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD
mc mb -p minio/$BUCKET_NAME

# Set policy
mc policy set public minio/$BUCKET_NAME

echo "MinIO initialization complete"
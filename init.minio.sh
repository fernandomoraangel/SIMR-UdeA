#!/bin/sh
# init.minio.sh - Script para inicializar buckets en MinIO

# Set variables
MINIO_ROOT_USER=${MINIO_ROOT_USER:-superAdmin}
MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD:-sadmin1990}
BUCKET_NAME="sistema-archivos-simr"
MINIO_HOST="minio:9000"

echo "Waiting for MinIO to be ready..."
until mc alias set myminio http://$MINIO_HOST $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD > /dev/null 2>&1; do
    echo "MinIO is not ready yet, waiting 3 seconds..."
    sleep 3
done

echo "MinIO is ready, creating bucket '$BUCKET_NAME'..."

# Create bucket if it doesn't exist
if ! mc ls myminio/$BUCKET_NAME > /dev/null 2>&1; then
    mc mb myminio/$BUCKET_NAME
    echo "✅ Bucket '$BUCKET_NAME' created successfully"
else
    echo "ℹ️  Bucket '$BUCKET_NAME' already exists"
fi

# Set policy to allow public read access
mc anonymous set public myminio/$BUCKET_NAME
echo "✅ Bucket policy set to public"

echo "✅ MinIO initialization complete"
exit 0
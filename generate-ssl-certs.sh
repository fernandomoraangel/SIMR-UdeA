#!/bin/bash

# Script para generar certificados SSL autofirmados para desarrollo
# Ejecutar desde el directorio raíz del proyecto

echo "Generando certificados SSL autofirmados para desarrollo..."

# Crear directorio SSL si no existe
mkdir -p ssl

# Generar clave privada
openssl genrsa -out ssl/key.pem 2048

# Generar certificado autofirmado
openssl req -new -x509 -key ssl/key.pem -out ssl/cert.pem -days 365 -subj "/C=CO/ST=Antioquia/L=Medellin/O=UdeA/OU=SIMR/CN=localhost"

echo "Certificados SSL generados en el directorio ssl/"
echo "- Certificado: ssl/cert.pem"
echo "- Clave privada: ssl/key.pem"
echo ""
echo "Para usar HTTPS, descomenta la configuración SSL en nginx.prod.conf"
echo "y actualiza el volumen en docker-compose.prod.yml a:"
echo "- ./ssl:/etc/ssl/certs:ro"
# Script PowerShell para generar certificados SSL autofirmados para desarrollo
# Ejecutar desde el directorio raíz del proyecto

Write-Host "Generando certificados SSL autofirmados para desarrollo..." -ForegroundColor Green

# Crear directorio SSL si no existe
if (!(Test-Path "ssl")) {
    New-Item -ItemType Directory -Name "ssl"
}

# Verificar si OpenSSL está disponible
try {
    $null = Get-Command openssl -ErrorAction Stop
    
    # Generar clave privada
    openssl genrsa -out ssl/key.pem 2048
    
    # Generar certificado autofirmado
    openssl req -new -x509 -key ssl/key.pem -out ssl/cert.pem -days 365 -subj "/C=CO/ST=Antioquia/L=Medellin/O=UdeA/OU=SIMR/CN=localhost"
    
    Write-Host "Certificados SSL generados en el directorio ssl/" -ForegroundColor Green
    Write-Host "- Certificado: ssl/cert.pem" -ForegroundColor Yellow
    Write-Host "- Clave privada: ssl/key.pem" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Para usar HTTPS, descomenta la configuración SSL en nginx.prod.conf" -ForegroundColor Cyan
    Write-Host "y actualiza el volumen en docker-compose.prod.yml a:" -ForegroundColor Cyan
    Write-Host "- ./ssl:/etc/ssl/certs:ro" -ForegroundColor Cyan
}
catch {
    Write-Host "OpenSSL no está disponible. Instalando usando chocolatey..." -ForegroundColor Yellow
    
    # Verificar si chocolatey está instalado
    try {
        $null = Get-Command choco -ErrorAction Stop
        choco install openssl -y
        Write-Host "OpenSSL instalado. Ejecuta el script nuevamente." -ForegroundColor Green
    }
    catch {
        Write-Host "Error: OpenSSL no está disponible y chocolatey no está instalado." -ForegroundColor Red
        Write-Host "Opciones:" -ForegroundColor Yellow
        Write-Host "1. Instalar OpenSSL manualmente desde: https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor Yellow
        Write-Host "2. Usar WSL (Windows Subsystem for Linux) y ejecutar generate-ssl-certs.sh" -ForegroundColor Yellow
        Write-Host "3. Usar la configuración HTTP (puerto 80) temporalmente" -ForegroundColor Yellow
    }
}
# Script para iniciar SIMR en modo debug
Write-Host "Iniciando SIMR en modo debug..." -ForegroundColor Green

# Detener contenedores si están corriendo
Write-Host "Deteniendo contenedores existentes..." -ForegroundColor Yellow
docker-compose down

# Iniciar en modo debug
Write-Host "Iniciando contenedores en modo debug..." -ForegroundColor Yellow
docker-compose -f docker-compose.yml -f docker-compose.debug.yml up -d

# Mostrar logs del backend
Write-Host "Contenedores iniciados. Mostrando logs del backend..." -ForegroundColor Green
Write-Host "Puedes conectar el debugger de VS Code ahora (puerto 9229)" -ForegroundColor Cyan
Write-Host "Usa Ctrl+C para ver logs en tiempo real o cierra esta ventana" -ForegroundColor Yellow

# Seguir logs del backend
docker-compose logs -f simr-back
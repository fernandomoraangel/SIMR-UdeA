# Script para insertar/actualizar la lista nNormalizados en la base de datos
# Ejecutar desde la raíz del proyecto SIMR-UdeA

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Insertar Lista nNormalizados en MongoDB" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-Not (Test-Path "simr-back\scripts\insert-nNormalizados-lista.js")) {
    Write-Host "Error: Este script debe ejecutarse desde la raíz del proyecto SIMR-UdeA" -ForegroundColor Red
    Write-Host "Directorio actual: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

# Cambiar al directorio simr-back
Set-Location simr-back

Write-Host "Directorio de trabajo: simr-back" -ForegroundColor Green
Write-Host ""

# Verificar que Node.js esté instalado
try {
    $nodeVersion = node --version
    Write-Host "Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js no está instalado o no está en el PATH" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Ejecutando script de inserción..." -ForegroundColor Yellow
Write-Host ""

# Ejecutar el script
node scripts\insert-nNormalizados-lista.js

$exitCode = $LASTEXITCODE

Write-Host ""
if ($exitCode -eq 0) {
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  ✓ Script ejecutado exitosamente" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos pasos:" -ForegroundColor Cyan
    Write-Host "1. Reiniciar el servidor backend (si está corriendo)" -ForegroundColor White
    Write-Host "2. Abrir la aplicación en el navegador" -ForegroundColor White
    Write-Host "3. Ir a /#!/recursos/create" -ForegroundColor White
    Write-Host "4. Expandir la sección 'Números normalizados'" -ForegroundColor White
    Write-Host "5. Verificar que el dropdown muestra las opciones" -ForegroundColor White
} else {
    Write-Host "================================================" -ForegroundColor Red
    Write-Host "  ✗ Error al ejecutar el script" -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Verificar:" -ForegroundColor Yellow
    Write-Host "- MongoDB está corriendo" -ForegroundColor White
    Write-Host "- La configuración de conexión en config/config.js es correcta" -ForegroundColor White
    Write-Host "- Revisa los mensajes de error arriba" -ForegroundColor White
}

# Volver al directorio original
Set-Location ..

Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

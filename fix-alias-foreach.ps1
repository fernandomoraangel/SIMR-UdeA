Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  CORREGIR this.alias EN forEach" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$basePath = "c:\Users\ferna\Documents\Desarrollo\SIMR-UdeA\simr-back\public"
$files = @(
    "sistemas\controllers\sistemas.client.controller.js",
    "generos\controllers\generos.client.controller.js",
    "generosnomusicales\controllers\generosnomusicales.client.controller.js",
    "materias\controllers\materias.client.controller.js"
)

$totalChanges = 0
$filesModified = 0

foreach ($fileName in $files) {
    $filePath = Join-Path $basePath $fileName
    
    if (Test-Path $filePath) {
        $lines = Get-Content $filePath -Encoding UTF8
        $modified = $false
        
        for ($i = 0; $i -lt $lines.Count; $i++) {
            # Buscar la línea problemática: this.alias = ""; dentro de forEach
            if ($lines[$i] -match '^\s+this\.alias\s*=\s*"";' -and $i -gt 0) {
                # Verificar que está dentro de un forEach
                $inForEach = $false
                for ($j = $i - 1; $j -ge [Math]::Max(0, $i - 10); $j--) {
                    if ($lines[$j] -match 'forEach\s*\(\s*function') {
                        $inForEach = $true
                        break
                    }
                }
                
                if ($inForEach) {
                    Write-Host "  $fileName - Línea $($i + 1): Eliminando 'this.alias = """";' del forEach" -ForegroundColor Yellow
                    $lines[$i] = ""
                    $modified = $true
                    $totalChanges++
                }
            }
        }
        
        if ($modified) {
            # Filtrar líneas vacías duplicadas
            $content = $lines -join "`n"
            Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
            $filesModified++
            Write-Host "✓ $([System.IO.Path]::GetFileName($fileName))" -ForegroundColor Green
            Write-Host ""
        }
    } else {
        Write-Host "✗ No se encontró: $fileName" -ForegroundColor Red
    }
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Archivos modificados: $filesModified" -ForegroundColor Yellow
Write-Host "Total de cambios: $totalChanges" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan

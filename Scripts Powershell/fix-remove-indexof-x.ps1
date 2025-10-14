Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  ELIMINAR CÓDIGO MUERTO indexOf(x)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$basePath = "c:\Users\ferna\Documents\Desarrollo\SIMR-UdeA\simr-back\public"
$files = Get-ChildItem -Path $basePath -Filter "*controller*.js" -Recurse

$totalChanges = 0
$filesModified = 0

foreach ($file in $files) {
    $lines = Get-Content $file.FullName -Encoding UTF8
    $modified = $false
    $fileChanges = 0
    $newLines = @()
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        # Si la línea contiene .indexOf(x) === -1 dentro de un if, eliminarla
        if ($lines[$i] -match 'if\s*\(\s*\$scope\.\w+\.indexOf\(x\)\s*===\s*-1\s*\)\s*\{') {
            # Encontrar la línea de cierre del if
            $braceCount = 1
            $i++  # Saltar la línea actual
            
            # Buscar hasta encontrar el cierre del bloque if
            while ($i -lt $lines.Count -and $braceCount -gt 0) {
                if ($lines[$i] -match '\{') {
                    $braceCount++
                }
                if ($lines[$i] -match '\}') {
                    $braceCount--
                }
                $i++
            }
            $i--  # Retroceder uno porque el bucle principal incrementará
            $modified = $true
            $fileChanges++
        } else {
            $newLines += $lines[$i]
        }
    }
    
    if ($modified) {
        $content = $newLines -join "`n"
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        $filesModified++
        $totalChanges += $fileChanges
        Write-Host "✓ $($file.Name): $fileChanges bloques eliminados" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Archivos modificados: $filesModified" -ForegroundColor Yellow
Write-Host "Total de cambios: $totalChanges" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan

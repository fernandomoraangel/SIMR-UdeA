Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  CORREGIR var existe DUPLICADAS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$basePath = "c:\Users\ferna\Documents\Desarrollo\SIMR-UdeA\simr-back\public"
$files = Get-ChildItem -Path $basePath -Filter "*controller*.js" -Recurse

$totalChanges = 0
$filesModified = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $lines = Get-Content $file.FullName -Encoding UTF8
    $modified = $false
    $fileChanges = 0
    
    # Buscar funciones que declaran var existe al inicio
    for ($i = 0; $i -lt $lines.Count; $i++) {
        # Si encontramos una función que declara var existe
        if ($lines[$i] -match '^\s+var existe = false;') {
            $functionStart = $i - 1
            # Buscar el cierre de la función (puede estar muchas líneas después)
            $braceCount = 0
            $inFunction = $false
            
            for ($j = $functionStart; $j -lt $lines.Count; $j++) {
                if ($lines[$j] -match '\{') {
                    $braceCount++
                    $inFunction = $true
                }
                if ($lines[$j] -match '\}') {
                    $braceCount--
                    if ($inFunction -and $braceCount -eq 0) {
                        # Encontramos el final de la función
                        $functionEnd = $j
                        
                        # Buscar var existe = true dentro de esta función
                        for ($k = $i + 1; $k -lt $functionEnd; $k++) {
                            if ($lines[$k] -match '^\s+var existe = true;') {
                                # Reemplazar var existe = true; por existe = true;
                                $lines[$k] = $lines[$k] -replace 'var existe = true;', 'existe = true;'
                                $modified = $true
                                $fileChanges++
                                Write-Host "  Línea $($k + 1): var existe = true; → existe = true;" -ForegroundColor Yellow
                            }
                        }
                        break
                    }
                }
            }
        }
    }
    
    if ($modified) {
        $newContent = $lines -join "`n"
        Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8 -NoNewline
        $filesModified++
        $totalChanges += $fileChanges
        Write-Host "✓ $($file.Name): $fileChanges cambios" -ForegroundColor Green
        Write-Host ""
    }
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Archivos modificados: $filesModified" -ForegroundColor Yellow
Write-Host "Total de cambios: $totalChanges" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan

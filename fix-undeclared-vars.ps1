Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  CORREGIR VARIABLES SIN DECLARAR" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$basePath = "c:\Users\ferna\Documents\Desarrollo\SIMR-UdeA\simr-back\public"
$files = Get-ChildItem -Path $basePath -Filter "*controller*.js" -Recurse

$totalChanges = 0
$filesModified = 0

# Patrones a buscar y corregir
$patterns = @(
    @{Pattern = '^\s+existe\s*=\s*false;'; Replacement = '      var existe = false;'},
    @{Pattern = '^\s+existe\s*=\s*true;'; Replacement = '              var existe = true;'},
    @{Pattern = '^\s+x\s*=\s*"'; Replacement = '      var x = "'},
    @{Pattern = '^\s+control\s*=\s*1;'; Replacement = '        var control = 1;'}
)

foreach ($file in $files) {
    $lines = Get-Content $file.FullName -Encoding UTF8
    $modified = $false
    $fileChanges = 0
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        # Verificar cada patrón
        foreach ($pattern in $patterns) {
            if ($lines[$i] -match $pattern.Pattern) {
                # Verificar que la línea NO comience con 'var', 'let', o 'const'
                if ($lines[$i] -notmatch '^\s*(var|let|const)\s+') {
                    # Verificar contexto: debe estar dentro de una función
                    $inFunction = $false
                    for ($j = $i - 1; $j -ge 0 -and $j -ge ($i - 50); $j--) {
                        if ($lines[$j] -match '(function\s*\(|=\s*function\s*\()') {
                            $inFunction = $true
                            break
                        }
                    }
                    
                    if ($inFunction) {
                        # Extraer la parte después del =
                        if ($lines[$i] -match '^\s+(\w+)\s*=\s*(.+)$') {
                            $varName = $matches[1]
                            $value = $matches[2]
                            $indent = $lines[$i] -replace '^\s+.*', ''
                            $indentMatch = $lines[$i] -match '^(\s+)'
                            if ($indentMatch) {
                                $indent = $matches[1]
                            }
                            
                            # Crear nueva línea con var
                            $newLine = "$indent" + "var $varName = $value"
                            
                            if ($lines[$i] -ne $newLine) {
                                $lines[$i] = $newLine
                                $modified = $true
                                $fileChanges++
                            }
                        }
                    }
                }
            }
        }
    }
    
    if ($modified) {
        $content = $lines -join "`n"
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        $filesModified++
        $totalChanges += $fileChanges
        Write-Host "✓ $($file.Name): $fileChanges cambios" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Archivos modificados: $filesModified" -ForegroundColor Yellow
Write-Host "Total de cambios: $totalChanges" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  BUSCAR VARIABLES SIN DECLARAR (var/let/const)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Variables comunes que no están definidas
$commonUndeclared = @(
    'precision', 'alias', 'y', 'control', 'existe', 
    'fInicio', 'fFin', 'ano', 'mes', 'dia',
    'precisionFecha', 'fechayPrecision'
)

$basePath = "c:\Users\ferna\Documents\Desarrollo\SIMR-UdeA\simr-back\public"
$files = Get-ChildItem -Path $basePath -Filter "*.js" -Recurse | Where-Object { $_.Name -like "*controller*" }

$results = @{}

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $lines = Get-Content $file.FullName -Encoding UTF8
    
    foreach ($varName in $commonUndeclared) {
        # Buscar asignaciones sin var/let/const
        $pattern = "^\s+$varName\s*="
        
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match $pattern) {
                # Verificar si NO está precedido por var, let, o const en la línea
                if ($lines[$i] -notmatch "^\s*(var|let|const)\s+$varName\s*=") {
                    $lineNum = $i + 1
                    $key = "$($file.Name):$lineNum"
                    if (-not $results.ContainsKey($key)) {
                        $results[$key] = @{
                            File = $file.Name
                            FullPath = $file.FullName
                            Line = $lineNum
                            Variable = $varName
                            Content = $lines[$i].Trim()
                        }
                    }
                }
            }
        }
    }
}

Write-Host "Variables sin declarar encontradas:" -ForegroundColor Yellow
Write-Host ""

$grouped = $results.Values | Group-Object -Property File | Sort-Object Name

foreach ($group in $grouped) {
    Write-Host "$($group.Name):" -ForegroundColor Green
    $group.Group | Sort-Object Line | ForEach-Object {
        Write-Host "  Línea $($_.Line): $($_.Variable) = ..." -ForegroundColor White
        Write-Host "    $($_.Content)" -ForegroundColor Gray
    }
    Write-Host ""
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Total de ocurrencias: $($results.Count)" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan

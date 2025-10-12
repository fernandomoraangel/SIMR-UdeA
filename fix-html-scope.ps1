Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  CORREGIR \$scope en archivos HTML" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$basePath = "c:\Users\ferna\Documents\Desarrollo\SIMR-UdeA\simr-back\public"
$files = Get-ChildItem -Path $basePath -Filter "*.html" -Recurse

$totalChanges = 0
$filesModified = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $fileChanges = 0
    
    # Reemplazar todos los patrones $scope.update* dentro de ng-mouseup, ng-click, ng-mouseover
    # Patrón: ng-mouseup="$scope.updateXXX()"
    $pattern1 = '(ng-mouseup=")(\$scope\.)(update[^"]+)'
    if ($content -match $pattern1) {
        $content = $content -replace $pattern1, '$1$3'
        $fileChanges++
    }
    
    # Patrón: ng-click="$scope.updateXXX()"
    $pattern2 = '(ng-click=")(\$scope\.)(update[^"]+)'
    if ($content -match $pattern2) {
        $content = $content -replace $pattern2, '$1$3'
        $fileChanges++
    }
    
    # Patrón: ng-Click="$scope.updateXXX()" (con C mayúscula)
    $pattern3 = '(ng-Click=")(\$scope\.)(update[^"]+)'
    if ($content -match $pattern3) {
        $content = $content -replace $pattern3, '$1$3'
        $fileChanges++
    }
    
    # Patrón: ng-mouseover="$scope.updateXXX()"
    $pattern4 = '(ng-mouseover=")(\$scope\.)(update[^"]+)'
    if ($content -match $pattern4) {
        $content = $content -replace $pattern4, '$1$3'
        $fileChanges++
    }
    
    if ($content -ne $originalContent) {
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

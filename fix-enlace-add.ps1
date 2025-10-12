Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  CORREGIR FUNCIONES enlaceAdd" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$basePath = "c:\Users\ferna\Documents\Desarrollo\SIMR-UdeA\simr-back\public"
$files = Get-ChildItem -Path $basePath -Filter "*controller*.js" -Recurse

$totalChanges = 0
$filesModified = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $modified = $false
    
    # Patrón específico para enlaceAdd con split("*")
    $pattern = '(?s)var x = "etiqueta\*" \+ this\.eEtiqueta \+ ",url\*" \+ this\.eUrl;\s+var properties = x\.split\(","\);\s+var obj = \{\};\s+properties\.forEach\(function \(property\) \{\s+var tup = property\.split\("\*"\);\s+obj\[tup\[0\]\] = tup\[1\];\s+\}\);'
    
    $replacement = 'var obj = { etiqueta: this.eEtiqueta, url: this.eUrl };'
    
    if ($content -match $pattern) {
        $content = $content -replace $pattern, $replacement
        $modified = $true
        Write-Host "✓ $($file.Name): Corregido enlaceAdd" -ForegroundColor Green
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        $filesModified++
        $totalChanges++
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Archivos modificados: $filesModified" -ForegroundColor Yellow
Write-Host "Total de cambios: $totalChanges" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan

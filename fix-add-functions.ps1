Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  CORREGIR FUNCIONES *Add PROBLEMÁTICAS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$basePath = "c:\Users\ferna\Documents\Desarrollo\SIMR-UdeA\simr-back\public"
$files = Get-ChildItem -Path $basePath -Filter "*controller*.js" -Recurse

$totalChanges = 0
$filesModified = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $modified = $false
    $fileChanges = 0
    
    # Patrón a buscar y reemplazar:
    # De:
    #   var x = "PROP:" + this.VAR;
    #   var properties = x.split(",");
    #   var obj = {};
    #   properties.forEach(function (property) {
    #     var tup = property.split(":");
    #     obj[tup[0]] = tup[1];
    #   });
    # A:
    #   var obj = { PROP: this.VAR };
    
    # Regex para capturar el patrón completo
    $pattern = '(?s)(var x = "(\w+):" \+ this\.(\w+);)\s+var properties = x\.split\(","\);\s+var obj = \{\};\s+properties\.forEach\(function \(property\) \{[^}]+\}\);'
    
    $matches = [regex]::Matches($content, $pattern)
    
    if ($matches.Count -gt 0) {
        Write-Host "$($file.Name):" -ForegroundColor Yellow
        
        foreach ($match in $matches) {
            $fullMatch = $match.Groups[0].Value
            $propName = $match.Groups[2].Value
            $varName = $match.Groups[3].Value
            
            # Crear el reemplazo simplificado
            $replacement = "var obj = { $propName`: this.$varName };"
            
            $content = $content.Replace($fullMatch, $replacement)
            $modified = $true
            $fileChanges++
            Write-Host "  ✓ Corregido: var obj = { $propName`: this.$varName };" -ForegroundColor Green
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        $filesModified++
        $totalChanges += $fileChanges
        Write-Host ""
    }
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Archivos modificados: $filesModified" -ForegroundColor Yellow
Write-Host "Total de cambios: $totalChanges" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan

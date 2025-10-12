Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  CORREGIR FUNCIONES *Add RESTANTES" -ForegroundColor Cyan
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
    
    # Patrón para casos con UNA propiedad (sin comas en la cadena original)
    # Ejemplo: var x = "id:" + this.padre;
    $pattern1 = '(?s)var x = "(\w+):" \+ this\.(\w+);[^\n]*\n\s+(?://[^\n]*\n\s+)?var properties = x\.split\(","\);\s+var obj = \{\};\s+properties\.forEach\(function \(property\) \{[^}]+\}\);'
    
    $regexMatches = [regex]::Matches($content, $pattern1)
    
    if ($regexMatches.Count -gt 0) {
        Write-Host "$($file.Name):" -ForegroundColor Yellow
        
        foreach ($match in $regexMatches) {
            $fullMatch = $match.Groups[0].Value
            $propName = $match.Groups[1].Value
            $varName = $match.Groups[2].Value
            
            # Crear el reemplazo simplificado
            $replacement = "var obj = { $propName`: this.$varName };"
            
            $content = $content.Replace($fullMatch, $replacement)
            $modified = $true
            $fileChanges++
            Write-Host "  ✓ Corregido: var obj = { $propName`: this.$varName };" -ForegroundColor Green
        }
    }
    
    # Ahora corregir casos con MÚLTIPLES propiedades (con comas)
    # Ejemplo: var x = "etiqueta:" + this.dEtiqueta + ",contenido:" + this.dContenido;
    $pattern2 = '(?s)var x = "(\w+):" \+ this\.(\w+) \+ ",(\w+):" \+ this\.(\w+);[^\n]*\n\s+var properties = x\.split\(","\);\s+var obj = \{\};\s+properties\.forEach\(function \(property\) \{[^}]+\}\);'
    
    $regexMatches2 = [regex]::Matches($content, $pattern2)
    
    if ($regexMatches2.Count -gt 0) {
        if ($fileChanges -eq 0) {
            Write-Host "$($file.Name):" -ForegroundColor Yellow
        }
        
        foreach ($match in $regexMatches2) {
            $fullMatch = $match.Groups[0].Value
            $prop1Name = $match.Groups[1].Value
            $var1Name = $match.Groups[2].Value
            $prop2Name = $match.Groups[3].Value
            $var2Name = $match.Groups[4].Value
            
            # Crear el reemplazo simplificado
            $replacement = "var obj = { $prop1Name`: this.$var1Name, $prop2Name`: this.$var2Name };"
            
            $content = $content.Replace($fullMatch, $replacement)
            $modified = $true
            $fileChanges++
            Write-Host "  ✓ Corregido: var obj = { $prop1Name`: this.$var1Name, $prop2Name`: this.$var2Name };" -ForegroundColor Green
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

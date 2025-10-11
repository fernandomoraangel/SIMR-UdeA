$base = "c:\Users\ferna\Documents\Desarrollo\SIMR-UdeA\simr-back\public"
$replacements = @{
    ">EDITAR PROYECTO<" = ">Editar proyecto<"
    ">EDITAR MATERIA<" = ">Editar materia<"
    ">EDITAR MEDIO SONORO (FORMATO)<" = ">Editar medio sonoro (formato)<"
    ">EDITAR INSTRUMENTO MUSICAL<" = ">Editar instrumento musical<"
    ">EDITAR GÉNERO-FORMA NO MUSICAL<" = ">Editar género-forma no musical<"
    ">EDITAR IDIOMA<" = ">Editar idioma<"
    ">EDITAR FONDO<" = ">Editar fondo<"
    ">EDITAR GÉNERO-FORMA (MUSICAL)<" = ">Editar género-forma (musical)<"
    ">EDITAR EJEMPLAR<" = ">Editar ejemplar<"
    ">EDITAR CAMPO EN DICCIONARIO DE DATOS<" = ">Editar campo en diccionario de datos<"
    ">EDITAR COLECCIÓN<" = ">Editar colección<"
    ">EDITAR ACTOR<" = ">Editar actor<"
}

$htmlFiles = Get-ChildItem -Path $base -Filter "*.html" -Recurse
$count = 0

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $modified = $false
    
    foreach ($old in $replacements.Keys) {
        if ($content.Contains($old)) {
            $content = $content.Replace($old, $replacements[$old])
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "✓ $($file.Name)" -ForegroundColor Green
        $count++
    }
}

Write-Host "`nTotal archivos modificados: $count" -ForegroundColor Yellow

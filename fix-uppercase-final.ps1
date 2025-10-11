# Script final para corrección masiva de mayúsculas
$basePath = "c:\Users\ferna\Documents\Desarrollo\SIMR-UdeA\simr-back\public"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "CORRECCIÓN MASIVA DE MAYÚSCULAS EN HTML" -ForegroundColor Yellow  
Write-Host "========================================`n" -ForegroundColor Cyan

# Reemplazos usando .Replace() que es más simple
$replacements = @{
    '>EDITAR RECURSO<' = '>Editar recurso<'
    '>EDITAR PROYECTO<' = '>Editar proyecto<'
    '>EDITAR MATERIA<' = '>Editar materia<'
    '>EDITAR MEDIO SONORO (FORMATO)<' = '>Editar medio sonoro (formato)<'
    '>EDITAR INSTRUMENTO MUSICAL<' = '>Editar instrumento musical<'
    '>EDITAR GÉNERO-FORMA NO MUSICAL<' = '>Editar género-forma no musical<'
    '>EDITAR IDIOMA<' = '>Editar idioma<'
    '>EDITAR GÉNERO-FORMA (MUSICAL)<' = '>Editar género-forma (musical)<'
    '>EDITAR FONDO<' = '>Editar fondo<'
    '>EDITAR EJEMPLAR<' = '>Editar ejemplar<'
    '>EDITAR CAMPO EN DICCIONARIO DE DATOS<' = '>Editar campo en diccionario de datos<'
    '>EDITAR COLECCIÓN<' = '>Editar colección<'
    '>EDITAR ACTOR<' = '>Editar actor<'
    '>CREAR MEDIO SONORO (FORMATO)<' = '>Crear medio sonoro (formato)<'
    '>CREAR INSTRUMENTO MUSICAL<' = '>Crear instrumento musical<'
    '>CREAR GÉNERO-FORMA NO MUSICAL<' = '>Crear género-forma no musical<'
    '>CREAR GÉNERO-FORMA (MUSICAL)<' = '>Crear género-forma (musical)<'
    '>CREAR CAMPO EN DICCIONARIO DE DATOS<' = '>Crear campo en diccionario de datos<'
    '>CREAR COLECCIÓN<' = '>Crear colección<'
    '>CREAR FONDO<' = '>Crear fondo<'
    '>CREAR EJEMPLAR<' = '>Crear ejemplar<'
    '>CREAR MATERIA<' = '>Crear materia<'
    '>CREAR IDIOMA<' = '>Crear idioma<'
    '>CREAR PROYECTO<' = '>Crear proyecto<'
    '>CREAR RECURSO<' = '>Crear recurso<'
    '>CREAR ACTOR<' = '>Crear actor<'
    '>GÉNEROS O FORMAS NO MUSICALES<' = '>Géneros o formas no musicales<'
    '>GÉNEROS O FORMAS MUSICALES<' = '>Géneros o formas musicales<'
    '>COLECCIONES DOCUMENTALES<' = '>Colecciones documentales<'
    '>FONDOS DOCUMENTALES<' = '>Fondos documentales<'
    '>DICCIONARIO DE DATOS<' = '>Diccionario de datos<'
    '>INSTRUMENTOS MUSICALES<' = '>Instrumentos musicales<'
    '>MEDIOS SONOROS<' = '>Medios sonoros<'
    '>SISTEMAS SONOROS<' = '>Sistemas sonoros<'
    '>EJEMPLARES<' = '>Ejemplares<'
    '>MATERIAS<' = '>Materias<'
    '>PROYECTOS<' = '>Proyectos<'
    '>RECURSOS<' = '>Recursos<'
    '>IDIOMAS<' = '>Idiomas<'
    '>ACTORES<' = '>Actores<'
    '>OBRAS<' = '>Obras<'
    '>GÉNEROS-FORMAS-ESPECIES (MUSICALES)<' = '>Géneros-formas-especies (musicales)<'
    '>GÉNEROS-FORMAS NO MUSICALES<' = '>Géneros-formas no musicales<'
    '>MEDIOS SONOROS-FORMATOS ASOCIADOS<' = '>Medios sonoros-formatos asociados<'
    '>SISTEMAS SONOROS ASOCIADOS<' = '>Sistemas sonoros asociados<'
    '>CENTRO DE SISTEMA SONORO (TONALIDAD)<' = '>Centro de sistema sonoro (tonalidad)<'
    '>PROYECTOS ASOCIADOS<' = '>Proyectos asociados<'
    '>DESCRIPTORES LIBRES<' = '>Descriptores libres<'
    '>ENLACES Y ARCHIVOS<' = '>Enlaces y archivos<'
    '>DESCRIPCIÓN TÉCNICA<' = '>Descripción técnica<'
    '>NOMBRE/ROL<' = '>Nombre/rol<'
    '>MATERIA<' = '>Materia<'
    '>DENOMINACIÓN(ES) REGIONAL-SOCIO-CULTURAL(ES)<' = '>Denominación(es) regional-socio-cultural(es)<'
    '>ASIENTO LIGADO<' = '>Asiento ligado<'
    '>CONTENEDORES<' = '>Contenedores<'
    '>ANOTACIONES CARTOGRÁFICO TEMPORALES<' = '>Anotaciones cartográfico temporales<'
    '>IDIOMAS ASOCIADOS AL GÉNERO<' = '>Idiomas asociados al género<'
    '>TÍTULO UNIFORME*<' = '>Título uniforme*<'
    '>DESCRIPCIÓN<' = '>Descripción<'
    '>TIPO<' = '>Tipo<'
    '>OBRAS RELACIONADAS*<' = '>Obras relacionadas*<'
    '>NÚMEROS NORMALIZADOS<' = '>Números normalizados<'
    '>FACETA<' = '>Faceta<'
    '>MENCIONES DE RESPONSABILIDAD<' = '>Menciones de responsabilidad<'
    '>CONTENEDOR (RECURSOS)<' = '>Contenedor (recursos)<'
    '>FUENTE<' = '>Fuente<'
    '>TIPO DE RECURSO<' = '>Tipo de recurso<'
    '>MATERIAL ACOMPAÑANTE<' = '>Material acompañante<'
    '>MENCIÓN DE SERIE<' = '>Mención de serie<'
    '>TÍTULO DEL RECURSO*<' = '>Título del recurso*<'
}

$htmlFiles = Get-ChildItem -Path $basePath -Filter "*.html" -Recurse -File
$totalFiles = 0
$totalReplacements = 0
$modifiedFiles = @()

foreach ($file in $htmlFiles) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        $originalContent = $content
        $fileReplacements = 0
        
        foreach ($old in $replacements.Keys) {
            if ($content -like "*$old*") {
                $content = $content.Replace($old, $replacements[$old])
                $fileReplacements++
            }
        }
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
            $relativePath = $file.FullName.Replace($basePath + "\", "")
            $modifiedFiles += [PSCustomObject]@{
                File = $relativePath
                Changes = $fileReplacements
            }
            Write-Host "✓ " -ForegroundColor Green -NoNewline
            Write-Host $relativePath -ForegroundColor White -NoNewline
            Write-Host " ($fileReplacements cambios)" -ForegroundColor Yellow
            $totalFiles++
            $totalReplacements += $fileReplacements
        }
    }
    catch {
        Write-Host "✗ Error: $($file.Name)" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "RESUMEN:" -ForegroundColor Yellow  
Write-Host "  Archivos modificados: " -NoNewline -ForegroundColor White
Write-Host $totalFiles -ForegroundColor Green
Write-Host "  Total de reemplazos:  " -NoNewline -ForegroundColor White
Write-Host $totalReplacements -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

if ($modifiedFiles.Count -gt 0) {
    Write-Host "TOP 10 archivos con más cambios:" -ForegroundColor Cyan
    $modifiedFiles | Sort-Object -Property Changes -Descending | Select-Object -First 10 | ForEach-Object {
        Write-Host "  $($_.Changes) cambios - " -NoNewline -ForegroundColor Yellow
        Write-Host $_.File -ForegroundColor White
    }
    Write-Host ""
}

Write-Host "✓ Corrección masiva completada!`n" -ForegroundColor Green

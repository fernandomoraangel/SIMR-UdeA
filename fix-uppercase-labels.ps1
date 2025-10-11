# Script para corregir mayúsculas sostenidas en archivos HTML
# Autor: GitHub Copilot
# Fecha: Octubre 2025

$basePath = "c:\Users\ferna\Documents\Desarrollo\SIMR-UdeA\simr-back\public"

# Función para convertir texto a capitalización inicial
function Convert-ToTitleCase {
    param([string]$text)
    
    # Convertir a minúsculas y luego capitalizar primera letra
    $words = $text.ToLower() -split '\s+'
    $result = ($words | ForEach-Object {
        if ($_.Length -gt 0) {
            $_.Substring(0,1).ToUpper() + $_.Substring(1)
        }
    }) -join ' '
    
    return $result
}

# Diccionario de reemplazos para tituloVista
$tituloVistaReplacements = @{
    'CREAR OBRA' = 'Crear obra'
    'EDITAR OBRA' = 'Editar obra'
    'OBRAS' = 'Obras'
    'CREAR ACTOR' = 'Crear actor'
    'EDITAR ACTOR' = 'Editar actor'
    'ACTORES' = 'Actores'
    'CREAR RECURSO' = 'Crear recurso'
    'EDITAR RECURSO' = 'Editar recurso'
    'RECURSOS' = 'Recursos'
    'CREAR PROYECTO' = 'Crear proyecto'
    'EDITAR PROYECTO' = 'Editar proyecto'
    'PROYECTOS' = 'Proyectos'
    'CREAR MATERIA' = 'Crear materia'
    'EDITAR MATERIA' = 'Editar materia'
    'MATERIAS' = 'Materias'
    'CREAR MEDIO SONORO (FORMATO)' = 'Crear medio sonoro (formato)'
    'EDITAR MEDIO SONORO (FORMATO)' = 'Editar medio sonoro (formato)'
    'MEDIOS SONOROS' = 'Medios sonoros'
    'CREAR INSTRUMENTO MUSICAL' = 'Crear instrumento musical'
    'EDITAR INSTRUMENTO MUSICAL' = 'Editar instrumento musical'
    'INSTRUMENTOS MUSICALES' = 'Instrumentos musicales'
    'CREAR IDIOMA' = 'Crear idioma'
    'EDITAR IDIOMA' = 'Editar idioma'
    'IDIOMAS' = 'Idiomas'
    'CREAR GÉNERO-FORMA (MUSICAL)' = 'Crear género-forma (musical)'
    'EDITAR GÉNERO-FORMA (MUSICAL)' = 'Editar género-forma (musical)'
    'GÉNEROS O FORMAS MUSICALES' = 'Géneros o formas musicales'
    'CREAR GÉNERO-FORMA NO MUSICAL' = 'Crear género-forma no musical'
    'EDITAR GÉNERO-FORMA NO MUSICAL' = 'Editar género-forma no musical'
    'GÉNEROS O FORMAS NO MUSICALES' = 'Géneros o formas no musicales'
    'CREAR FONDO' = 'Crear fondo'
    'EDITAR FONDO' = 'Editar fondo'
    'FONDOS DOCUMENTALES' = 'Fondos documentales'
    'CREAR EJEMPLAR' = 'Crear ejemplar'
    'EDITAR EJEMPLAR' = 'Editar ejemplar'
    'EJEMPLARES' = 'Ejemplares'
    'CREAR COLECCIÓN' = 'Crear colección'
    'EDITAR COLECCIÓN' = 'Editar colección'
    'COLECCIONES DOCUMENTALES' = 'Colecciones documentales'
    'DICCIONARIO DE DATOS' = 'Diccionario de datos'
    'CREAR CAMPO EN DICCIONARIO DE DATOS' = 'Crear campo en diccionario de datos'
    'EDITAR CAMPO EN DICCIONARIO DE DATOS' = 'Editar campo en diccionario de datos'
    'SISTEMAS SONOROS' = 'Sistemas sonoros'
}

# Diccionario de reemplazos para class="seccion" y class="campo"
$labelReplacements = @{
    'ACTORES' = 'Actores'
    'GÉNEROS-FORMAS-ESPECIES (MUSICALES)' = 'Géneros-formas-especies (musicales)'
    'GÉNEROS-FORMAS NO MUSICALES' = 'Géneros-formas no musicales'
    'MATERIA' = 'Materia'
    'MEDIOS SONOROS-FORMATOS ASOCIADOS' = 'Medios sonoros-formatos asociados'
    'SISTEMAS SONOROS ASOCIADOS' = 'Sistemas sonoros asociados'
    'CENTRO DE SISTEMA SONORO (TONALIDAD)' = 'Centro de sistema sonoro (tonalidad)'
    'PROYECTOS ASOCIADOS' = 'Proyectos asociados'
    'DESCRIPTORES LIBRES' = 'Descriptores libres'
    'ENLACES Y ARCHIVOS' = 'Enlaces y archivos'
    'NOMBRE/ROL' = 'Nombre/rol'
    'DESCRIPCIÓN TÉCNICA' = 'Descripción técnica'
    'TÍTULO UNIFORME*' = 'Título uniforme*'
    'DESCRIPCIÓN' = 'Descripción'
    'TIPO' = 'Tipo'
    'CONTENEDORES' = 'Contenedores'
    'ASIENTO LIGADO' = 'Asiento ligado'
    'IDIOMAS ASOCIADOS AL GÉNERO' = 'Idiomas asociados al género'
    'ANOTACIONES CARTOGRÁFICO TEMPORALES' = 'Anotaciones cartográfico temporales'
    'DENOMINACIÓN(ES) REGIONAL-SOCIO-CULTURAL(ES)' = 'Denominación(es) regional-socio-cultural(es)'
}

Write-Host "Buscando archivos HTML en $basePath..." -ForegroundColor Cyan

# Obtener todos los archivos HTML
$htmlFiles = Get-ChildItem -Path $basePath -Filter "*.html" -Recurse

$totalFiles = 0
$totalReplacements = 0

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $fileReplacements = 0
    
    # Aplicar reemplazos de tituloVista
    foreach ($key in $tituloVistaReplacements.Keys) {
        $oldPattern = "class=`"tituloVista`">$key<"
        $newPattern = "class=`"tituloVista`">$($tituloVistaReplacements[$key])<"
        if ($content -match [regex]::Escape($oldPattern)) {
            $content = $content -replace [regex]::Escape($oldPattern), $newPattern
            $fileReplacements++
        }
    }
    
    # Aplicar reemplazos de labels con class="seccion" o class="campo"
    foreach ($key in $labelReplacements.Keys) {
        $oldPattern1 = "class=`"seccion`">$key<"
        $newPattern1 = "class=`"seccion`">$($labelReplacements[$key])<"
        if ($content -match [regex]::Escape($oldPattern1)) {
            $content = $content -replace [regex]::Escape($oldPattern1), $newPattern1
            $fileReplacements++
        }
        
        $oldPattern2 = "class=`"campo`">$key<"
        $newPattern2 = "class=`"campo`">$($labelReplacements[$key])<"
        if ($content -match [regex]::Escape($oldPattern2)) {
            $content = $content -replace [regex]::Escape($oldPattern2), $newPattern2
            $fileReplacements++
        }
        
        # También buscar sin class (solo <label>)
        $oldPattern3 = "<label>$key<"
        $newPattern3 = "<label>$($labelReplacements[$key])<"
        if ($content -match [regex]::Escape($oldPattern3)) {
            $content = $content -replace [regex]::Escape($oldPattern3), $newPattern3
            $fileReplacements++
        }
    }
    
    # Si hubo cambios, guardar el archivo
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "✓ $($file.Name): $fileReplacements reemplazos" -ForegroundColor Green
        $totalFiles++
        $totalReplacements += $fileReplacements
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Resumen:" -ForegroundColor Yellow
Write-Host "  Archivos modificados: $totalFiles" -ForegroundColor White
Write-Host "  Total de reemplazos: $totalReplacements" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan

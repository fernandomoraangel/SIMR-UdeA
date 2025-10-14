# Script simple para corregir mayúsculas en archivos HTML
$basePath = "c:\Users\ferna\Documents\Desarrollo\SIMR-UdeA\simr-back\public"

# Mapa de reemplazos exactos
$replacements = @{
    'class="tituloVista">EDITAR RECURSO</' = 'class="tituloVista">Editar recurso</'
    'class="tituloVista">EDITAR PROYECTO</' = 'class="tituloVista">Editar proyecto</'
    'class="tituloVista">EDITAR MATERIA</' = 'class="tituloVista">Editar materia</'
    'class="tituloVista">EDITAR MEDIO SONORO (FORMATO)</' = 'class="tituloVista">Editar medio sonoro (formato)</'
    'class="tituloVista">EDITAR INSTRUMENTO MUSICAL</' = 'class="tituloVista">Editar instrumento musical</'
    'class="tituloVista">EDITAR GÉNERO-FORMA NO MUSICAL</' = 'class="tituloVista">Editar género-forma no musical</'
    'class="tituloVista">EDITAR IDIOMA</' = 'class="tituloVista">Editar idioma</'
    'class="tituloVista">EDITAR GÉNERO-FORMA (MUSICAL)</' = 'class="tituloVista">Editar género-forma (musical)</'
    'class="tituloVista">EDITAR FONDO</' = 'class="tituloVista">Editar fondo</'
    'class="tituloVista">EDITAR EJEMPLAR</' = 'class="tituloVista">Editar ejemplar</'
    'class="tituloVista">EDITAR CAMPO EN DICCIONARIO DE DATOS</' = 'class="tituloVista">Editar campo en diccionario de datos</'
    'class="tituloVista">EDITAR COLECCIÓN</' = 'class="tituloVista">Editar colección</'
    'class="tituloVista">EDITAR ACTOR</' = 'class="tituloVista">Editar actor</'
    
    'class="tituloVista">CREAR RECURSO</' = 'class="tituloVista">Crear recurso</'
    'class="tituloVista">CREAR PROYECTO</' = 'class="tituloVista">Crear proyecto</'
    'class="tituloVista">CREAR MATERIA</' = 'class="tituloVista">Crear materia</'
    'class="tituloVista">CREAR MEDIO SONORO (FORMATO)</' = 'class="tituloVista">Crear medio sonoro (formato)</'
    'class="tituloVista">CREAR INSTRUMENTO MUSICAL</' = 'class="tituloVista">Crear instrumento musical</'
    'class="tituloVista">CREAR GÉNERO-FORMA NO MUSICAL</' = 'class="tituloVista">Crear género-forma no musical</'
    'class="tituloVista">CREAR IDIOMA</' = 'class="tituloVista">Crear idioma</'
    'class="tituloVista">CREAR GÉNERO-FORMA (MUSICAL)</' = 'class="tituloVista">Crear género-forma (musical)</'
    'class="tituloVista">CREAR FONDO</' = 'class="tituloVista">Crear fondo</'
    'class="tituloVista">CREAR EJEMPLAR</' = 'class="tituloVista">Crear ejemplar</'
    'class="tituloVista">CREAR CAMPO EN DICCIONARIO DE DATOS</' = 'class="tituloVista">Crear campo en diccionario de datos</'
    'class="tituloVista">CREAR COLECCIÓN</' = 'class="tituloVista">Crear colección</'
    'class="tituloVista">CREAR ACTOR</' = 'class="tituloVista">Crear actor</'
    
    'class="tituloVista">RECURSOS</' = 'class="tituloVista">Recursos</'
    'class="tituloVista">PROYECTOS</' = 'class="tituloVista">Proyectos</'
    'class="tituloVista">MATERIAS</' = 'class="tituloVista">Materias</'
    'class="tituloVista">MEDIOS SONOROS</' = 'class="tituloVista">Medios sonoros</'
    'class="tituloVista">INSTRUMENTOS MUSICALES</' = 'class="tituloVista">Instrumentos musicales</'
    'class="tituloVista">GÉNEROS O FORMAS NO MUSICALES</' = 'class="tituloVista">Géneros o formas no musicales</'
    'class="tituloVista">IDIOMAS</' = 'class="tituloVista">Idiomas</'
    'class="tituloVista">GÉNEROS O FORMAS MUSICALES</' = 'class="tituloVista">Géneros o formas musicales</'
    'class="tituloVista">FONDOS DOCUMENTALES</' = 'class="tituloVista">Fondos documentales</'
    'class="tituloVista">EJEMPLARES</' = 'class="tituloVista">Ejemplares</'
    'class="tituloVista">DICCIONARIO DE DATOS</' = 'class="tituloVista">Diccionario de datos</'
    'class="tituloVista">COLECCIONES DOCUMENTALES</' = 'class="tituloVista">Colecciones documentales</'
    'class="tituloVista">ACTORES</' = 'class="tituloVista">Actores</'
    'class="tituloVista">OBRAS</' = 'class="tituloVista">Obras</'
    'class="tituloVista">SISTEMAS SONOROS</' = 'class="tituloVista">Sistemas sonoros</'
    
    'class="seccion">ACTORES</' = 'class="seccion">Actores</'
    'class="seccion">GÉNEROS-FORMAS-ESPECIES (MUSICALES)</' = 'class="seccion">Géneros-formas-especies (musicales)</'
    'class="seccion">GÉNEROS-FORMAS NO MUSICALES</' = 'class="seccion">Géneros-formas no musicales</'
    'class="seccion">MATERIA</' = 'class="seccion">Materia</'
    'class="seccion">MEDIOS SONOROS-FORMATOS ASOCIADOS</' = 'class="seccion">Medios sonoros-formatos asociados</'
    'class="seccion">SISTEMAS SONOROS ASOCIADOS</' = 'class="seccion">Sistemas sonoros asociados</'
    'class="seccion">CENTRO DE SISTEMA SONORO (TONALIDAD)</' = 'class="seccion">Centro de sistema sonoro (tonalidad)</'
    'class="seccion">PROYECTOS ASOCIADOS</' = 'class="seccion">Proyectos asociados</'
    'class="seccion">DESCRIPTORES LIBRES</' = 'class="seccion">Descriptores libres</'
    'class="seccion">ENLACES Y ARCHIVOS</' = 'class="seccion">Enlaces y archivos</'
    'class="seccion">NOMBRE/ROL</' = 'class="seccion">Nombre/rol</'
    'class="seccion">DESCRIPCIÓN TÉCNICA</' = 'class="seccion">Descripción técnica</'
    
    'class="campo">DENOMINACIÓN(ES) REGIONAL-SOCIO-CULTURAL(ES)</' = 'class="campo">Denominación(es) regional-socio-cultural(es)</'
    'class="campo">TIPO</' = 'class="campo">Tipo</'
    'class="campo">CONTENEDORES</' = 'class="campo">Contenedores</'
    'class="campo">ASIENTO LIGADO</' = 'class="campo">Asiento ligado</'
    'class="campo">IDIOMAS ASOCIADOS AL GÉNERO</' = 'class="campo">Idiomas asociados al género</'
    'class="campo">ANOTACIONES CARTOGRÁFICO TEMPORALES</' = 'class="campo">Anotaciones cartográfico temporales</'
    
    '<label>TÍTULO UNIFORME*</' = '<label>Título uniforme*</'
    '<label>DESCRIPCIÓN</' = '<label>Descripción</'
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "CORRECCIÓN MASIVA DE MAYÚSCULAS" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

$htmlFiles = Get-ChildItem -Path $basePath -Filter "*.html" -Recurse -File
$totalFiles = 0
$totalReplacements = 0

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $fileReplacements = 0
    
    foreach ($key in $replacements.Keys) {
        if ($content.Contains($key)) {
            $content = $content.Replace($key, $replacements[$key])
            $fileReplacements++
        }
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        $relativePath = $file.FullName.Replace($basePath + "\", "")
        Write-Host "✓ $relativePath" -ForegroundColor Green -NoNewline
        Write-Host " ($fileReplacements cambios)" -ForegroundColor Yellow
        $totalFiles++
        $totalReplacements += $fileReplacements
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "RESUMEN:" -ForegroundColor Yellow
Write-Host "  Archivos modificados: $totalFiles" -ForegroundColor White
Write-Host "  Total de reemplazos:  $totalReplacements" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan

# Script mejorado para corregir mayúsculas sostenidas en archivos HTML
# Usa expresiones regulares para encontrar y reemplazar textos en mayúsculas

$basePath = "c:\Users\ferna\Documents\Desarrollo\SIMR-UdeA\simr-back\public"

# Lista de archivos a procesar (los más importantes primero)
$targetFiles = @(
    "obras\views\edit-obra.client.view.html",
    "obras\views\list-obra.client.view.html",
    "actores\views\create-actor.client.view.html",
    "actores\views\edit-actor.client.view.html",
    "actores\views\list-actor.client.view.html",
    "recursos\views\create-recurso.client.view.html",
    "recursos\views\edit-recurso.client.view.html",
    "recursos\views\list-recurso.client.view.html"
)

# Función para aplicar todos los reemplazos a un archivo
function Fix-HTMLFile {
    param([string]$filePath)
    
    if (-not (Test-Path $filePath)) {
        Write-Host "✗ No encontrado: $filePath" -ForegroundColor Red
        return 0
    }
    
    $content = Get-Content -Path $filePath -Raw -Encoding UTF8
    $originalContent = $content
    
    # Reemplazos específicos
    $replacements = @(
        @('GÉNEROS-FORMAS-ESPECIES \(MUSICALES\)', 'Géneros-formas-especies (musicales)'),
        @('GÉNEROS-FORMAS NO MUSICALES', 'Géneros-formas no musicales'),
        @('MATERIA', 'Materia'),
        @('MEDIOS SONOROS-FORMATOS ASOCIADOS', 'Medios sonoros-formatos asociados'),
        @('SISTEMAS SONOROS ASOCIADOS', 'Sistemas sonoros asociados'),
        @('CENTRO DE SISTEMA SONORO \(TONALIDAD\)', 'Centro de sistema sonoro (tonalidad)'),
        @('PROYECTOS ASOCIADOS', 'Proyectos asociados'),
        @('DESCRIPTORES LIBRES', 'Descriptores libres'),
        @('ENLACES Y ARCHIVOS', 'Enlaces y archivos'),
        @('NOMBRE/ROL', 'Nombre/rol'),
        @('DESCRIPCIÓN TÉCNICA', 'Descripción técnica'),
        @('TÍTULO UNIFORME\*', 'Título uniforme*'),
        @('DESCRIPCIÓN', 'Descripción'),
        @('TIPO', 'Tipo'),
        @('CONTENEDORES', 'Contenedores'),
        @('ASIENTO LIGADO', 'Asiento ligado'),
        @('IDIOMAS ASOCIADOS AL GÉNERO', 'Idiomas asociados al género'),
        @('ANOTACIONES CARTOGRÁFICO TEMPORALES', 'Anotaciones cartográfico temporales'),
        @('DENOMINACIÓN\(ES\) REGIONAL-SOCIO-CULTURAL\(ES\)', 'Denominación(es) regional-socio-cultural(es)'),
        @('EDITAR OBRA', 'Editar obra'),
        @('OBRAS', 'Obras'),
        @('CREAR ACTOR', 'Crear actor'),
        @('EDITAR ACTOR', 'Editar actor'),
        @('ACTORES', 'Actores'),
        @('CREAR RECURSO', 'Crear recurso'),
        @('EDITAR RECURSO', 'Editar recurso'),
        @('RECURSOS', 'Recursos'),
        @('CREAR PROYECTO', 'Crear proyecto'),
        @('EDITAR PROYECTO', 'Editar proyecto'),
        @('PROYECTOS', 'Proyectos'),
        @('CREAR MATERIA', 'Crear materia'),
        @('EDITAR MATERIA', 'Editar materia'),
        @('MATERIAS', 'Materias'),
        @('CREAR MEDIO SONORO \(FORMATO\)', 'Crear medio sonoro (formato)'),
        @('EDITAR MEDIO SONORO \(FORMATO\)', 'Editar medio sonoro (formato)'),
        @('MEDIOS SONOROS', 'Medios sonoros'),
        @('CREAR INSTRUMENTO MUSICAL', 'Crear instrumento musical'),
        @('EDITAR INSTRUMENTO MUSICAL', 'Editar instrumento musical'),
        @('INSTRUMENTOS MUSICALES', 'Instrumentos musicales'),
        @('CREAR IDIOMA', 'Crear idioma'),
        @('EDITAR IDIOMA', 'Editar idioma'),
        @('IDIOMAS', 'Idiomas'),
        @('CREAR GÉNERO-FORMA \(MUSICAL\)', 'Crear género-forma (musical)'),
        @('EDITAR GÉNERO-FORMA \(MUSICAL\)', 'Editar género-forma (musical)'),
        @('GÉNEROS O FORMAS MUSICALES', 'Géneros o formas musicales'),
        @('CREAR GÉNERO-FORMA NO MUSICAL', 'Crear género-forma no musical'),
        @('EDITAR GÉNERO-FORMA NO MUSICAL', 'Editar género-forma no musical'),
        @('GÉNEROS O FORMAS NO MUSICALES', 'Géneros o formas no musicales'),
        @('CREAR FONDO', 'Crear fondo'),
        @('EDITAR FONDO', 'Editar fondo'),
        @('FONDOS DOCUMENTALES', 'Fondos documentales'),
        @('CREAR EJEMPLAR', 'Crear ejemplar'),
        @('EDITAR EJEMPLAR', 'Editar ejemplar'),
        @('EJEMPLARES', 'Ejemplares'),
        @('CREAR COLECCIÓN', 'Crear colección'),
        @('EDITAR COLECCIÓN', 'Editar colección'),
        @('COLECCIONES DOCUMENTALES', 'Colecciones documentales'),
        @('DICCIONARIO DE DATOS', 'Diccionario de datos'),
        @('CREAR CAMPO EN DICCIONARIO DE DATOS', 'Crear campo en diccionario de datos'),
        @('EDITAR CAMPO EN DICCIONARIO DE DATOS', 'Editar campo en diccionario de datos'),
        @('SISTEMAS SONOROS', 'Sistemas sonoros')
    )
    
    $count = 0
    foreach ($pair in $replacements) {
        $oldText = $pair[0]
        $newText = $pair[1]
        
        # Buscar en labels con diferentes clases
        $patterns = @(
            "(<label[^>]*class=`"tituloVista`"[^>]*>)$oldText(<)",
            "(<label[^>]*class=`"seccion`"[^>]*>)$oldText(<)",
            "(<label[^>]*class=`"campo`"[^>]*>)$oldText(<)",
            "(<label[^>]*>)$oldText(<)"
        )
        
        foreach ($pattern in $patterns) {
            if ($content -match $pattern) {
                $content = $content -replace $pattern, "`$1$newText`$2"
                $count++
            }
        }
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
        return $count
    }
    
    return 0
}

Write-Host "`nCorrigiendo mayúsculas en archivos HTML..." -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$totalReplacements = 0

foreach ($relPath in $targetFiles) {
    $fullPath = Join-Path $basePath $relPath
    $count = Fix-HTMLFile -filePath $fullPath
    
    if ($count -gt 0) {
        Write-Host "✓ $(Split-Path $relPath -Leaf): $count reemplazos" -ForegroundColor Green
        $totalReplacements += $count
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Total de reemplazos: $totalReplacements" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

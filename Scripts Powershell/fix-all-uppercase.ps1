# Script para corregir TODAS las mayúsculas sostenidas en TODOS los archivos HTML
# Autor: GitHub Copilot
# Fecha: Octubre 2025
# Procesa todos los archivos .html en simr-back/public/

$basePath = "c:\Users\ferna\Documents\Desarrollo\SIMR-UdeA\simr-back\public"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  CORRECCIÓN MASIVA DE MAYÚSCULAS" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

# Diccionario de reemplazos - ORDEN IMPORTANTE: más específicos primero
$replacements = @(
    # Títulos de vistas muy específicos
    @('CREAR CAMPO EN DICCIONARIO DE DATOS', 'Crear campo en diccionario de datos'),
    @('EDITAR CAMPO EN DICCIONARIO DE DATOS', 'Editar campo en diccionario de datos'),
    @('CREAR MEDIO SONORO \(FORMATO\)', 'Crear medio sonoro (formato)'),
    @('EDITAR MEDIO SONORO \(FORMATO\)', 'Editar medio sonoro (formato)'),
    @('CREAR GÉNERO-FORMA \(MUSICAL\)', 'Crear género-forma (musical)'),
    @('EDITAR GÉNERO-FORMA \(MUSICAL\)', 'Editar género-forma (musical)'),
    @('CREAR GÉNERO-FORMA NO MUSICAL', 'Crear género-forma no musical'),
    @('EDITAR GÉNERO-FORMA NO MUSICAL', 'Editar género-forma no musical'),
    @('GÉNEROS O FORMAS NO MUSICALES', 'Géneros o formas no musicales'),
    @('GÉNEROS O FORMAS MUSICALES', 'Géneros o formas musicales'),
    @('GÉNEROS-FORMAS-ESPECIES \(MUSICALES\)', 'Géneros-formas-especies (musicales)'),
    @('GÉNEROS-FORMAS NO MUSICALES', 'Géneros-formas no musicales'),
    @('MEDIOS SONOROS-FORMATOS ASOCIADOS', 'Medios sonoros-formatos asociados'),
    @('CENTRO DE SISTEMA SONORO \(TONALIDAD\)', 'Centro de sistema sonoro (tonalidad)'),
    @('IDIOMAS ASOCIADOS AL GÉNERO', 'Idiomas asociados al género'),
    @('ANOTACIONES CARTOGRÁFICO TEMPORALES', 'Anotaciones cartográfico temporales'),
    @('DENOMINACIÓN\(ES\) REGIONAL-SOCIO-CULTURAL\(ES\)', 'Denominación(es) regional-socio-cultural(es)'),
    @('CREAR INSTRUMENTO MUSICAL', 'Crear instrumento musical'),
    @('EDITAR INSTRUMENTO MUSICAL', 'Editar instrumento musical'),
    @('INSTRUMENTOS MUSICALES', 'Instrumentos musicales'),
    @('SISTEMAS SONOROS ASOCIADOS', 'Sistemas sonoros asociados'),
    @('COLECCIONES DOCUMENTALES', 'Colecciones documentales'),
    @('FONDOS DOCUMENTALES', 'Fondos documentales'),
    @('DICCIONARIO DE DATOS', 'Diccionario de datos'),
    @('PROYECTOS ASOCIADOS', 'Proyectos asociados'),
    @('DESCRIPTORES LIBRES', 'Descriptores libres'),
    @('ENLACES Y ARCHIVOS', 'Enlaces y archivos'),
    @('DESCRIPCIÓN TÉCNICA', 'Descripción técnica'),
    @('TÍTULO UNIFORME\*', 'Título uniforme*'),
    
    # Títulos de operaciones CRUD
    @('CREAR COLECCIÓN', 'Crear colección'),
    @('EDITAR COLECCIÓN', 'Editar colección'),
    @('CREAR EJEMPLAR', 'Crear ejemplar'),
    @('EDITAR EJEMPLAR', 'Editar ejemplar'),
    @('CREAR FONDO', 'Crear fondo'),
    @('EDITAR FONDO', 'Editar fondo'),
    @('CREAR IDIOMA', 'Crear idioma'),
    @('EDITAR IDIOMA', 'Editar idioma'),
    @('CREAR MATERIA', 'Crear materia'),
    @('EDITAR MATERIA', 'Editar materia'),
    @('CREAR PROYECTO', 'Crear proyecto'),
    @('EDITAR PROYECTO', 'Editar proyecto'),
    @('CREAR RECURSO', 'Crear recurso'),
    @('EDITAR RECURSO', 'Editar recurso'),
    @('CREAR ACTOR', 'Crear actor'),
    @('EDITAR ACTOR', 'Editar actor'),
    @('CREAR OBRA', 'Crear obra'),
    @('EDITAR OBRA', 'Editar obra'),
    
    # Etiquetas de sección/campo genéricas
    @('ASIENTO LIGADO', 'Asiento ligado'),
    @('CONTENEDORES', 'Contenedores'),
    @('DESCRIPCIÓN', 'Descripción'),
    @('NOMBRE/ROL', 'Nombre/rol'),
    @('MEDIOS SONOROS', 'Medios sonoros'),
    @('SISTEMAS SONOROS', 'Sistemas sonoros'),
    @('EJEMPLARES', 'Ejemplares'),
    @('MATERIAS', 'Materias'),
    @('PROYECTOS', 'Proyectos'),
    @('RECURSOS', 'Recursos'),
    @('ACTORES', 'Actores'),
    @('IDIOMAS', 'Idiomas'),
    @('OBRAS', 'Obras'),
    @('TIPO', 'Tipo')
)

# Función para aplicar reemplazos a un archivo
function Fix-HTMLFile {
    param([string]$filePath)
    
    if (-not (Test-Path $filePath)) {
        return 0
    }
    
    try {
        $content = Get-Content -Path $filePath -Raw -Encoding UTF8
        $originalContent = $content
        $count = 0
        
        foreach ($pair in $replacements) {
            $oldText = $pair[0]
            $newText = $pair[1]
            
            # Patrones para diferentes contextos de labels
            $patterns = @(
                # Labels con diferentes clases
                "(<label[^>]*class=`"tituloVista`"[^>]*>)$oldText(<)",
                "(<label[^>]*class=`"seccion`"[^>]*>)$oldText(<)",
                "(<label[^>]*class=`"campo`"[^>]*>)$oldText(<)",
                "(<label[^>]*>)$oldText(<)"
            )
            
            foreach ($pattern in $patterns) {
                $regex = [regex]$pattern
                if ($regex.IsMatch($content)) {
                    $newContent = $regex.Replace($content, "`$1$newText`$2")
                    if ($newContent -ne $content) {
                        $content = $newContent
                        $count++
                    }
                }
            }
        }
        
        if ($content -ne $originalContent) {
            Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
            return $count
        }
        
        return 0
    }
    catch {
        Write-Host "✗ Error procesando: $filePath" -ForegroundColor Red
        Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
        return 0
    }
}

# Obtener TODOS los archivos HTML recursivamente
Write-Host "Buscando archivos HTML en: $basePath" -ForegroundColor Cyan
$htmlFiles = Get-ChildItem -Path $basePath -Filter "*.html" -Recurse -File

Write-Host "Encontrados $($htmlFiles.Count) archivos HTML`n" -ForegroundColor White

$processedFiles = 0
$modifiedFiles = 0
$totalReplacements = 0
$fileResults = @()

# Procesar cada archivo
foreach ($file in $htmlFiles) {
    $processedFiles++
    $count = Fix-HTMLFile -filePath $file.FullName
    
    if ($count -gt 0) {
        $modifiedFiles++
        $totalReplacements += $count
        $relativePath = $file.FullName.Replace($basePath + "\", "")
        $fileResults += [PSCustomObject]@{
            File = $relativePath
            Replacements = $count
        }
        Write-Host "✓ " -ForegroundColor Green -NoNewline
        Write-Host "$relativePath " -ForegroundColor White -NoNewline
        Write-Host "($count reemplazos)" -ForegroundColor Yellow
    }
    
    # Mostrar progreso cada 10 archivos
    if ($processedFiles % 10 -eq 0) {
        Write-Host "  Procesados: $processedFiles/$($htmlFiles.Count)..." -ForegroundColor DarkGray
    }
}

# Mostrar resumen
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  RESUMEN DE CORRECCIONES" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Archivos procesados:  " -NoNewline -ForegroundColor White
Write-Host $processedFiles -ForegroundColor Cyan
Write-Host "Archivos modificados: " -NoNewline -ForegroundColor White
Write-Host $modifiedFiles -ForegroundColor Green
Write-Host "Total de reemplazos:  " -NoNewline -ForegroundColor White
Write-Host $totalReplacements -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

if ($fileResults.Count -gt 0) {
    Write-Host "Archivos modificados (TOP 10):" -ForegroundColor Cyan
    $fileResults | Sort-Object -Property Replacements -Descending | Select-Object -First 10 | ForEach-Object {
        Write-Host "  • $($_.File): " -NoNewline -ForegroundColor White
        Write-Host "$($_.Replacements) cambios" -ForegroundColor Yellow
    }
    Write-Host ""
}

Write-Host "✓ Proceso completado exitosamente!`n" -ForegroundColor Green

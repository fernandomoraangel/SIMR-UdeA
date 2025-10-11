Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  CORRECCIÓN DE LABELS INTERNOS (CAMPOS)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$replacements = @{
    "MENCIONES DE RESPONSABILIDAD" = "Menciones de responsabilidad"
    "CONTENEDOR (RECURSOS)" = "Contenedor (recursos)"
    "CONTENEDOR (ACTORES EN REUNIÓN)" = "Contenedor (actores en reunión)"
    "TIPO DE RECURSO" = "Tipo de recurso"
    "ANOTACIONES CARTOGRÁFICO TEMPORALES" = "Anotaciones cartográfico temporales"
    "MATERIAL ACOMPAÑANTE" = "Material acompañante"
    "PROYECTOS ASOCIADOS" = "Proyectos asociados"
    "DESCRIPTORES LIBRES" = "Descriptores libres"
    "ENLACES Y ARCHIVOS" = "Enlaces y archivos"
    "NOMBRES ALTERNATIVOS (ALIAS)" = "Nombres alternativos (alias)"
    "INSTRUMENTOS (MEDIOS)" = "Instrumentos (medios)"
    "NOMBRE DEL PROYECTO" = "Nombre del proyecto"
    "ESTADO DEL PROYECTO" = "Estado del proyecto"
    "FECHAS ASOCIADAS AL PROYECTO" = "Fechas asociadas al proyecto"
    "MEDIOS SONOROS ASOCIADOS" = "Medios sonoros asociados"
    "SISTEMAS SONOROS ASOCIADOS" = "Sistemas sonoros asociados"
    "IDIOMAS ASOCIADOS AL GÉNERO" = "Idiomas asociados al género"
    "IDENTIFICADOR DE EJEMPLAR" = "Identificador de ejemplar"
    "DISPONIBILIDAD" = "Disponibilidad"
    "PROCEDENCIA" = "Procedencia"
    "SISTEMAS RELACIONADOS" = "Sistemas relacionados"
    "SISTEMAS PADRE" = "Sistemas padre"
    "SISTEMAS HIJOS" = "Sistemas hijos"
    "MATERIAS RELACIONADAS" = "Materias relacionadas"
    "MATERIAS PADRE" = "Materias padre"
    "MATERIAS HIJAS" = "Materias hijas"
    "CLASIFICACIÓN HORNBOSTEL-SACHS" = "Clasificación Hornbostel-Sachs"
    "PROYECTO ASOCIADO" = "Proyecto asociado"
    "DESCRIPTOR LIBRE" = "Descriptor libre"
    "DESCRIPCIÓN" = "Descripción"
    "DESCRIPCIÓN TÉCNICA" = "Descripción técnica"
    "MENCIÓN DE SERIE" = "Mención de serie"
    "NÚMEROS NORMALIZADOS" = "Números normalizados"
    "FECHA DE CREACIÓN" = "Fecha de creación"
    "TIPO DE COLECCIÓN" = "Tipo de colección"
    "NOMBRE DE REUNIÓN" = "Nombre de reunión"
    "CAMPO ABREVIADO" = "Campo abreviado"
    "CAMPO LARGO" = "Campo largo"
    "DEFINICIÓN" = "Definición"
    "TIPOS DE RECURSO" = "Tipos de recurso"
    "CREAR SISTEMA SONORO" = "Crear sistema sonoro"
    "EDITAR SISTEMA SONORO" = "Editar sistema sonoro"
    "GÉNEROS RELACIONADOS" = "Géneros relacionados"
    "GÉNEROS PADRE" = "Géneros padre"
    "GÉNEROS HIJO" = "Géneros hijo"
    "GÉNEROS HIJOS" = "Géneros hijos"
    "ROL DENTRO DEL MEDIO" = "Rol dentro del medio"
    "AMPLITUD O COBERTURA" = "Amplitud o cobertura"
    "FECHA DE INICIO" = "Fecha de inicio"
    "FECHA DE FINALIZACIÓN" = "Fecha de finalización"
}

$basePath = "c:\Users\ferna\Documents\Desarrollo\SIMR-UdeA\simr-back\public"
$files = Get-ChildItem -Path $basePath -Filter "*.html" -Recurse

$filesModified = 0
$totalChanges = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $fileChanges = 0
    
    foreach ($key in $replacements.Keys) {
        $oldPattern = ">$key<"
        $newPattern = ">$($replacements[$key])<"
        
        if ($content -like "*$oldPattern*") {
            $content = $content.Replace($oldPattern, $newPattern)
            $count = ([regex]::Matches($originalContent, [regex]::Escape($oldPattern))).Count
            $fileChanges += $count
        }
    }
    
    if ($fileChanges -gt 0) {
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

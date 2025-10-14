# Script DEFINITIVO de corrección masiva - Versión simplificada
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  CORRECCIÓN MASIVA FINAL DE MAYÚSCULAS" -ForegroundColor Yellow
Write-Host "============================================`n" -ForegroundColor Cyan

$base = "c:\Users\ferna\Documents\Desarrollo\SIMR-UdeA\simr-back\public"

# TODOS los reemplazos posibles
$allReplacements = @(
    @(">EDITAR PROYECTO<", ">Editar proyecto<"),
    @(">EDITAR MATERIA<", ">Editar materia<"),
    @(">EDITAR MEDIO SONORO (FORMATO)<", ">Editar medio sonoro (formato)<"),
    @(">EDITAR INSTRUMENTO MUSICAL<", ">Editar instrumento musical<"),
    @(">EDITAR GÉNERO-FORMA NO MUSICAL<", ">Editar género-forma no musical<"),
    @(">EDITAR IDIOMA<", ">Editar idioma<"),
    @(">EDITAR FONDO<", ">Editar fondo<"),
    @(">EDITAR GÉNERO-FORMA (MUSICAL)<", ">Editar género-forma (musical)<"),
    @(">EDITAR EJEMPLAR<", ">Editar ejemplar<"),
    @(">EDITAR CAMPO EN DICCIONARIO DE DATOS<", ">Editar campo en diccionario de datos<"),
    @(">EDITAR COLECCIÓN<", ">Editar colección<"),
    @(">EDITAR ACTOR<", ">Editar actor<"),
    @(">CREAR MEDIO SONORO (FORMATO)<", ">Crear medio sonoro (formato)<"),
    @(">CREAR INSTRUMENTO MUSICAL<", ">Crear instrumento musical<"),
    @(">CREAR GÉNERO-FORMA NO MUSICAL<", ">Crear género-forma no musical<"),
    @(">CREAR GÉNERO-FORMA (MUSICAL)<", ">Crear género-forma (musical)<"),
    @(">CREAR CAMPO EN DICCIONARIO DE DATOS<", ">Crear campo en diccionario de datos<"),
    @(">CREAR COLECCIÓN<", ">Crear colección<"),
    @(">CREAR FONDO<", ">Crear fondo<"),
    @(">CREAR EJEMPLAR<", ">Crear ejemplar<"),
    @(">CREAR IDIOMA<", ">Crear idioma<"),
    @(">CREAR PROYECTO<", ">Crear proyecto<"),
    @(">CREAR RECURSO<", ">Crear recurso<"),
    @(">CREAR ACTOR<", ">Crear actor<"),
    @(">GÉNEROS O FORMAS NO MUSICALES<", ">Géneros o formas no musicales<"),
    @(">GÉNEROS O FORMAS MUSICALES<", ">Géneros o formas musicales<"),
    @(">COLECCIONES DOCUMENTALES<", ">Colecciones documentales<"),
    @(">FONDOS DOCUMENTALES<", ">Fondos documentales<"),
    @(">DICCIONARIO DE DATOS<", ">Diccionario de datos<"),
    @(">INSTRUMENTOS MUSICALES<", ">Instrumentos musicales<"),
    @(">MEDIOS SONOROS<", ">Medios sonoros<"),
    @(">SISTEMAS SONOROS<", ">Sistemas sonoros<"),
    @(">EJEMPLARES<", ">Ejemplares<"),
    @(">MATERIAS<", ">Materias<"),
    @(">PROYECTOS<", ">Proyectos<"),
    @(">RECURSOS<", ">Recursos<"),
    @(">IDIOMAS<", ">Idiomas<"),
    @(">ACTORES<", ">Actores<"),
    @(">OBRAS<", ">Obras<"),
    @(">GÉNEROS-FORMAS-ESPECIES (MUSICALES)<", ">Géneros-formas-especies (musicales)<"),
    @(">GÉNEROS-FORMAS NO MUSICALES<", ">Géneros-formas no musicales<"),
    @(">MEDIOS SONOROS-FORMATOS ASOCIADOS<", ">Medios sonoros-formatos asociados<"),
    @(">SISTEMAS SONOROS ASOCIADOS<", ">Sistemas sonoros asociados<"),
    @(">CENTRO DE SISTEMA SONORO (TONALIDAD)<", ">Centro de sistema sonoro (tonalidad)<"),
    @(">PROYECTOS ASOCIADOS<", ">Proyectos asociados<"),
    @(">DESCRIPTORES LIBRES<", ">Descriptores libres<"),
    @(">ENLACES Y ARCHIVOS<", ">Enlaces y archivos<"),
    @(">DESCRIPCIÓN TÉCNICA<", ">Descripción técnica<"),
    @(">NOMBRE/ROL<", ">Nombre/rol<"),
    @(">MATERIA<", ">Materia<"),
    @(">DENOMINACIÓN(ES) REGIONAL-SOCIO-CULTURAL(ES)<", ">Denominación(es) regional-socio-cultural(es)<"),
    @(">ASIENTO LIGADO<", ">Asiento ligado<"),
    @(">CONTENEDORES<", ">Contenedores<"),
    @(">ANOTACIONES CARTOGRÁFICO TEMPORALES<", ">Anotaciones cartográfico temporales<"),
    @(">IDIOMAS ASOCIADOS AL GÉNERO<", ">Idiomas asociados al género<"),
    @(">TÍTULO UNIFORME*<", ">Título uniforme*<"),
    @(">DESCRIPCIÓN<", ">Descripción<"),
    @(">TIPO<", ">Tipo<")
)

$totalFiles = 0
$totalChanges = 0

Get-ChildItem -Path $base -Filter "*.html" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    $original = $content
    
    foreach ($pair in $allReplacements) {
        $content = $content.Replace($pair[0], $pair[1])
    }
    
    if ($content -ne $original) {
        Set-Content $_.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "✓ $($_.Name)" -ForegroundColor Green
        $totalFiles++
        # Contar cambios
        foreach ($pair in $allReplacements) {
            $totalChanges += ([regex]::Matches($original, [regex]::Escape($pair[0]))).Count
        }
    }
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Archivos modificados: $totalFiles" -ForegroundColor Green
Write-Host "Total de cambios: $totalChanges" -ForegroundColor Yellow
Write-Host "============================================`n" -ForegroundColor Cyan

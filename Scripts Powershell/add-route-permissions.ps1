# Script para agregar permisos a todas las rutas de recursos
# Este script actualiza todos los archivos de rutas para agregar permisos create/list/read/edit

$routesPath = "c:\Users\ferna\Documents\Desarrollo\SIMR-UdeA\simr-back\public"

# Recursos que necesitan permisos (todos excepto core, authentication, admin)
$recursos = @(
    "actores", "archivos", "colecciones", "diccionarios", "ejemplares",
    "fondos", "generos", "generosnomusicales", "idiomas", "instrumentos",
    "materias", "medios", "proyectos", "recursos", "sistemas"
)

foreach ($recurso in $recursos) {
    $routeFile = Join-Path $routesPath "$recurso\config\$recurso.client.routes.js"
    
    if (Test-Path $routeFile) {
        Write-Host "Procesando: $recurso" -ForegroundColor Green
        
        $content = Get-Content $routeFile -Raw
        
        # Agregar permisos a ruta de listado
        $content = $content -replace `
            "(\.when\(`"/$recurso`",\s*\{[\s\S]*?templateUrl:\s*`"$recurso/views/list-$recurso\.client\.view\.html`")([\s\S]*?\})", `
            "`$1,`n        permission: `"list`",`n        resource: `"$recurso`"`$2"
        
        # Agregar permisos a ruta de creación
        $content = $content -replace `
            "(\.when\(`"/$recurso/create`",\s*\{[\s\S]*?templateUrl:\s*`"$recurso/views/create-$recurso\.client\.view\.html`")([\s\S]*?\})", `
            "`$1,`n        permission: `"create`",`n        resource: `"$recurso`"`$2"
        
        # Agregar permisos a ruta de vista individual
        $content = $content -replace `
            "(\.when\(`"/$recurso/:${recurso}Id`",\s*\{[\s\S]*?templateUrl:\s*`"$recurso/views/view-$recurso\.client\.view\.html`")([\s\S]*?\})", `
            "`$1,`n        permission: `"read`",`n        resource: `"$recurso`"`$2"
        
        # Agregar permisos a ruta de edición
        $content = $content -replace `
            "(\.when\(`"/$recurso/:${recurso}Id/edit`",\s*\{[\s\S]*?templateUrl:\s*`"$recurso/views/edit-$recurso\.client\.view\.html`")([\s\S]*?\})", `
            "`$1,`n        permission: `"edit`",`n        resource: `"$recurso`"`$2"
        
        # Guardar el archivo actualizado
        $content | Set-Content $routeFile -NoNewline
        
        Write-Host "  ✓ Actualizado: $routeFile" -ForegroundColor Cyan
    } else {
        Write-Host "  ✗ No encontrado: $routeFile" -ForegroundColor Yellow
    }
}

Write-Host "`nProceso completado!" -ForegroundColor Green

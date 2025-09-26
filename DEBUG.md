# 🐛 Debug SIMR con VS Code y Docker

## Configuración de Debug

### Opción 1: Usar Script Automático (Recomendado)

```powershell
.\start-debug.ps1
```

### Opción 2: Manual

1. **Iniciar contenedores en modo debug:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.debug.yml up -d
```

2. **En VS Code:**
   - Ir a la vista de Debug (Ctrl+Shift+D)
   - Seleccionar "Backend: Docker Debug (Attach)"
   - Presionar F5 o hacer click en el botón de play

### Configuraciones Disponibles

- **Backend: Express.js (Local)**: Ejecuta el backend localmente (sin Docker)
- **Backend: Docker Debug (Attach)**: Se conecta al backend que corre en Docker

## Puertos de Debug

- **Puerto 9229**: Puerto de debug de Node.js (expuesto desde Docker)
- **Puerto 3000**: Puerto de la aplicación

## Uso del Debugger

1. **Colocar breakpoints**: Click en el margen izquierdo de cualquier línea de código en VS Code
2. **Variables**: Inspeccionar variables en el panel de Debug
3. **Call Stack**: Ver la pila de llamadas
4. **Watch**: Agregar expresiones para monitorear

## Comandos Útiles

```powershell
# Reiniciar en modo debug
docker-compose down
docker-compose -f docker-compose.yml -f docker-compose.debug.yml up -d

# Ver logs del backend
docker-compose logs -f simr-back

# Volver al modo normal
docker-compose down
docker-compose up -d
```

## Troubleshooting

- Si el debugger no se conecta, verifica que el puerto 9229 esté disponible
- Si hay cambios en el código, reinicia el contenedor para que nodemon los detecte
- Los breakpoints deben estar en archivos dentro de la carpeta `simr-back`
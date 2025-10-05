# Debug de Archivos - Pasos para Diagnosticar

## Problema
Los archivos no aparecen en el formulario inmediatamente después de subirlos.

## ✅ Correcciones Aplicadas (Última actualización)

### 1. **Eliminada duplicación de eventos**
- ❌ Removido el listener `$broadcast('archivoSubido')` del servicio
- ❌ Removido el listener `$scope.$on('archivoSubido')` de la directiva
- ✅ Solo se usa `CustomEvent` ahora

### 2. **Corregido timing del polling de localStorage**
- ✅ El polling continúa por 10 segundos después de que se cierra el popup
- ✅ Antes se detenía inmediatamente al cerrar, impidiendo leer los datos
- ✅ Se limpian datos antiguos automáticamente

### 3. **Mejorados los logs**
- Más información sobre el estado del polling
- Timestamps para debugging
- Indicadores claros de cuando se detiene el polling

## Pasos para Probar

1. **IMPORTANTE: Refresca la página** (F5) para limpiar el estado anterior

2. **Ir al formulario de crear obra**
   - URL: `http://localhost/#!/obras/create`
   - Deberías ver: `🐛 DEBUG: Total de archivos cargados: 0`

3. **Hacer clic en "Subir Archivo"** (UNA SOLA VEZ)

4. **Seleccionar y subir un archivo**

5. **Cerrar el popup**

6. **Esperar 2-3 segundos** y verificar:
   - El número en DEBUG debe cambiar a `1`
   - El archivo debe aparecer en la lista debajo
   - NO debe haber duplicados

## Logs Esperados

Después de subir el archivo, deberías ver:

```
🚀 INICIANDO POLLING DE LOCALSTORAGE...
� Verificando localStorage para archivos...
📦 Datos en localStorage: null
📭 No hay datos en localStorage
🪟 Popup cerrado - polling continúa por 10 segundos más
🔍 Verificando localStorage para archivos...
📦 Datos en localStorage: {...}
✅ Archivo subido recibido via localStorage: {...}
🎯 Procesando resultado de subida de archivo: {...}
📤 CustomEvent 'fileUploadSuccess' disparado
📬 [DIRECTIVA] CustomEvent 'fileUploadSuccess' recibido!
✅ Archivo agregado a archivosCargados en directiva: [...]
📊 Total de archivos: 1
🔄 $apply ejecutado
✅ Resultado de subida procesado exitosamente
🛑 Polling detenido - archivo procesado
```

## ¿Qué Cambió?

### ANTES (Problema):
1. Usuario sube archivo
2. Popup se cierra
3. ❌ Polling se detiene INMEDIATAMENTE
4. ❌ No lee el localStorage
5. Usuario hace clic otra vez
6. ❌ Lee datos del intento anterior (duplicados)

### AHORA (Solución):
1. Usuario sube archivo
2. Popup se cierra
3. ✅ Polling CONTINÚA por 10 segundos
4. ✅ Lee el localStorage exitosamente
5. ✅ Agrega el archivo UNA SOLA VEZ
6. ✅ Se detiene el polling automáticamente

## Si aún hay problemas

Reporta:
1. ¿Aparece el archivo en el primer clic?
2. ¿Hay duplicados?
3. Todos los logs de la consola desde que haces clic en "Subir Archivo"


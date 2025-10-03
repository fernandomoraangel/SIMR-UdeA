# Solución para Comunicación PostMessage entre AngularJS y Angular

## Problema
Las aplicaciones AngularJS (puerto 3000) y Angular (puerto 4200) no podían comunicarse mediante `postMessage` debido a la política de **Same-Origin Policy**. Las ventanas popup desde AngularJS hacia Angular fallaban al intentar enviar datos de vuelta.

## Causa Raíz
- **AngularJS**: `http://localhost:3000` (o `http://localhost:80` a través de Nginx)
- **Angular**: `http://localhost:4200`
- Los dominios diferentes impedían la comunicación mediante `window.postMessage()`

## Solución Implementada

### 1. Configuración de Nginx Unificada
Se modificó `nginx.dev.conf` para servir ambas aplicaciones bajo el mismo origen (`localhost:80`):

```nginx
# AngularJS en la ruta raíz
location / {
    proxy_pass http://simr-back:3000;
}

# Angular en la ruta /files
location /files {
    proxy_pass http://simr-front:4200/files;
}

# Angular en la ruta /angular (compatibilidad)
location /angular {
    proxy_pass http://simr-front:4200;
}

# API en /api
location /api {
    proxy_pass http://simr-back:3000;
}
```

### 2. Cambios en el Código

#### AngularJS (simr-back)
- **Archivo**: `public/actores/controllers/actores.client.controller.js`
- **Cambios**:
  ```javascript
  // ANTES
  var angularAppOrigin = "http://localhost:4200";
  angularWindowFileUpload = window.open(angularAppOrigin + "/files/upload", ...);
  
  // DESPUÉS  
  var angularAppOrigin = window.location.origin;
  angularWindowFileUpload = window.open("/files/upload", ...);
  ```

- **Archivo**: `public/archivos/archivos.client.service.js`
- **Cambios**:
  ```javascript
  // ANTES
  const angularAppOrigin = "http://localhost:4200";
  
  // DESPUÉS
  const angularAppOrigin = window.location.origin;
  ```

#### Angular (simr-front)
- **Archivos**: 
  - `src/app/features/archivos/archivo-subida/archivo-subida.component.ts`
  - `src/app/features/archivos/archivo-lista/archivo-lista.component.ts`
- **Cambios**:
  ```typescript
  // ANTES
  angularJSOrigin = 'http://localhost:3000';
  
  // DESPUÉS
  angularJSOrigin = window.location.origin;
  ```

### 3. Flujo de Comunicación Actualizado

1. **AngularJS** (`localhost:80/`) abre popup hacia **Angular** (`localhost:80/files/upload`)
2. **Angular** sube archivo a Minio y recibe respuesta del backend
3. **Angular** envía `postMessage` a `window.opener` con los datos del archivo
4. **AngularJS** recibe el mensaje y registra el archivo en la base de datos
5. ✅ **La comunicación funciona** porque ambas apps están en el mismo origen

### 4. Beneficios de la Solución

- ✅ **Same-Origin Policy**: Ambas apps bajo `localhost:80`
- ✅ **Sin cambios de arquitectura**: Solo configuración de proxy
- ✅ **Compatibilidad**: Mantiene rutas existentes como `/angular`
- ✅ **Escalabilidad**: Fácil agregar más rutas en el futuro
- ✅ **Desarrollo y Producción**: La solución funciona en ambos entornos

### 5. URLs de Acceso

- **AngularJS**: `http://localhost:80/` (ruta principal)
- **Angular Files**: `http://localhost:80/files/*` (subida/lista de archivos)
- **Angular General**: `http://localhost:80/angular/*` (compatibilidad)
- **API Backend**: `http://localhost:80/api/*` (endpoints REST)

### 6. Testing de la Solución

Para verificar que funciona:

1. Acceder a `http://localhost:80`
2. Navegar a formulario de Obras o Autores
3. Hacer clic en "Subir Archivo"
4. El popup debe abrir en `http://localhost:80/files/upload`
5. Seleccionar y subir archivo
6. ✅ El archivo debe guardarse y la información debe retornar al formulario principal

### 7. Consideraciones Adicionales

- **CORS**: Ya no es necesario configurar CORS entre las aplicaciones
- **Variables de Entorno**: Considerar usar `window.location.origin` en lugar de URLs hardcodeadas
- **Producción**: Aplicar los mismos cambios en `nginx.prod.conf`
- **SSL**: En producción con HTTPS, la comunicación seguirá funcionando bajo el mismo origen
# Solución Completa - Error 502 Bad Gateway en /files/upload

## Problemas Identificados y Solucionados

### 1. ✅ Angular CLI requería Node.js v20+
**Problema**: Angular CLI fallaba con Node.js v18.20.8
**Solución**: Actualizado `Dockerfile.dev` para usar `node:20-alpine`

### 2. ✅ Angular no escuchaba en todas las interfaces de red
**Problema**: `ng serve` solo escuchaba en localhost (127.0.0.1) dentro del contenedor
**Solución**: Modificado `package.json` para usar `ng serve --host 0.0.0.0 --port 4200`

### 3. ✅ Recursos estáticos de Angular no se servían correctamente
**Problema**: Cuando Angular cargaba en `/files/upload`, los recursos JS/CSS se proxy-aban al backend de AngularJS
**Solución**: Configurado Nginx para que ciertos patrones de archivos se dirijan específicamente a Angular

## Configuración Final de Nginx

```nginx
# Recursos estáticos específicos de Angular
location ~ ^/(polyfills\.js|main\.js|scripts\.js|styles\.css|chunk-.*\.js|@vite/.*|@fs/.*)$ {
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
    
    proxy_pass http://simr-front:4200$uri$is_args$args;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Frontend Angular - Ruta para archivos
location /files {
    proxy_pass http://simr-front:4200/files;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

## Cambios en package.json de Angular

```json
{
  "scripts": {
    "start": "ng serve --host 0.0.0.0 --port 4200"
  }
}
```

## Estado Actual

✅ **AngularJS**: `http://localhost:80/` - Funciona
✅ **Angular**: `http://localhost:80/files/upload` - Carga correctamente
✅ **API**: `http://localhost:80/api/*` - Funciona
✅ **Comunicación PostMessage**: Preparada (mismo origen)

## Testing

Para probar la funcionalidad completa:

1. Ir a `http://localhost:80` 
2. Navegar a formulario de Obras o Autores
3. Hacer clic en "Subir Archivo"
4. El popup debe abrir en `http://localhost:80/files/upload` y cargar completamente
5. Seleccionar y subir archivo
6. La comunicación postMessage debe funcionar entre las ventanas

## Notas Técnicas

- Angular dev server ahora escucha en `0.0.0.0:4200` dentro del contenedor
- Nginx diferencia entre recursos de AngularJS y Angular usando patrones específicos
- Los headers CORS se añaden para evitar problemas de origen cruzado
- Se mantiene compatibilidad con rutas existentes como `/angular`
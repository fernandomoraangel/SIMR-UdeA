# Arquitectura de SIMR en Producción

## Diagrama de Contenedores y Rutas

```
┌─────────────────────────────────────────────────────────────────┐
│                    Cliente (Navegador)                          │
│                    http://172.23.0.97                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                 nginx_prod (Puerto 80)                          │
│                   Reverse Proxy                                 │
├─────────────────────────────────────────────────────────────────┤
│  /              → simr-back:3000  (AngularJS Legacy + API)      │
│  /api           → simr-back:3000  (API Backend)                 │
│  /files/        → simr-back:3000  (File operations)             │
│  /angular/      → simr-front:80   (Angular Nuevo)               │
│  /health        → 200 OK          (Health check)                │
└───────┬────────────────────────┬─────────────────────┬──────────┘
        │                        │                     │
        ▼                        ▼                     ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  simr-back_prod  │   │ simr-front_prod  │   │                  │
│  (Node.js:3000)  │   │   (Nginx:80)     │   │                  │
├──────────────────┤   ├──────────────────┤   │                  │
│ AngularJS Views  │   │ Angular SPA      │   │                  │
│ Express Server   │   │ Static Files     │   │                  │
│ REST API         │   │ (compilados)     │   │                  │
└────────┬─────────┘   └──────────────────┘   │                  │
         │                                      │                  │
         │         ┌────────────────────────────┘                  │
         │         │                                               │
         ▼         ▼                                               │
┌──────────────────────────────────┐   ┌──────────────────────────┐
│      mongodb_prod                │   │      minio_prod          │
│      (MongoDB:27017)             │   │   (MinIO:9000, 9001)     │
├──────────────────────────────────┤   ├──────────────────────────┤
│ Base de datos: simr              │   │ Bucket: sistema-archivos │
│ Auth: superAdmin/sadmin1990      │   │ Auth: superAdmin/...     │
│ Volume: /mnt/data/mongodb        │   │ Volume: /mnt/data/minio  │
└──────────────────────────────────┘   └──────────────────────────┘
```

## Flujo de Peticiones

### 1. Usuario accede a `http://172.23.0.97/`
```
Navegador → nginx_prod → simr-back:3000 → AngularJS Legacy
```

### 2. Usuario accede a `http://172.23.0.97/angular/`
```
Navegador → nginx_prod → simr-front:80 → Angular SPA
```

### 3. API Request desde cualquier frontend
```
Frontend → nginx_prod (/api) → simr-back:3000 → MongoDB/MinIO
```

### 4. Subida de archivo
```
Angular → /api/files/upload → simr-back:3000 → MinIO (minio:9000)
```

## Variables de Entorno Importantes

### En `.env.production` (para simr-back)
```bash
# URLs públicas (para CORS y redirecciones)
API_URL=http://172.23.0.97/api
FRONTEND_URL=http://172.23.0.97
ANGULARJS_URL=http://172.23.0.97

# Conexión interna entre contenedores
MONGO_URI=mongodb://superAdmin:sadmin1990@mongodb:27017/simr?authSource=admin
MINIO_ENDPOINT=minio    # Nombre del servicio en docker-compose
MINIO_PORT=9000
```

### En `simr-front/src/index.html`
```javascript
// Detecta automáticamente:
// - Desarrollo: window.FRONTEND_URL = http://localhost:4200
// - Producción: window.FRONTEND_URL = http://172.23.0.97
```

### En `simr-front/src/environments/environment.prod.ts`
```typescript
{
  production: true,
  apiUrl: '/api',  // Ruta relativa, nginx hace el proxy
  originUrl: window.location.origin
}
```

## Puertos Expuestos

### Puertos Públicos (accesibles desde fuera)
- **80**: Nginx (HTTP) - Entrada principal
- **443**: Nginx (HTTPS) - Cuando se configure SSL
- **27017**: MongoDB - Para Compass/debug (comentar en producción final)
- **9000**: MinIO API - Para debug (comentar en producción final)
- **9001**: MinIO Console - Para administración (comentar en producción final)

### Puertos Internos (solo entre contenedores)
- **3000**: simr-back (Node.js/Express)
- **80**: simr-front (Nginx interno)

## Red Docker

Todos los contenedores están en la red `simr-net-prod`:
```
docker network inspect simr-udea_simr-net-prod
```

Los contenedores se comunican entre sí usando sus nombres de servicio:
- `mongodb` en lugar de `localhost:27017`
- `minio` en lugar de `localhost:9000`
- `simr-back` en lugar de `localhost:3000`
- `simr-front` en lugar de `localhost:80`

## Persistencia de Datos

### Volúmenes en `/mnt/data/`:
```bash
/mnt/data/
├── mongodb/          # Base de datos MongoDB
│   └── db/
└── minio/            # Almacenamiento de archivos MinIO
    └── sistema-archivos-simr/
```

Estos directorios deben existir y tener permisos adecuados:
```bash
sudo mkdir -p /mnt/data/{mongodb,minio}
sudo chown -R 1001:1001 /mnt/data
```

## Diferencias Desarrollo vs Producción

| Aspecto       | Desarrollo           | Producción                |
| ------------- | -------------------- | ------------------------- |
| Angular URL   | `localhost:4200`     | `172.23.0.97/angular/`    |
| AngularJS URL | `localhost:3000`     | `172.23.0.97/`            |
| API URL       | `localhost:3000/api` | `172.23.0.97/api`         |
| MongoDB       | `localhost:27017`    | `mongodb:27017` (interno) |
| MinIO         | `localhost:9000`     | `minio:9000` (interno)    |
| HTTPS         | No                   | Opcional                  |
| Base href     | `/angular/`          | `/angular/`               |
| Proxy         | Nginx dev            | Nginx prod                |

## Comandos Útiles de Debugging

```bash
# Ver todas las URLs internas
docker exec -it simr-back_prod env | grep URL

# Probar conectividad entre contenedores
docker exec -it simr-back_prod ping mongodb
docker exec -it simr-back_prod ping minio

# Ver configuración de Nginx
docker exec -it nginx_prod cat /etc/nginx/conf.d/default.conf

# Ver logs de autenticación
docker logs simr-back_prod 2>&1 | grep -i auth

# Ver peticiones a la API
docker logs nginx_prod 2>&1 | grep "/api"
```

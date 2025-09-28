# 🚀 Guía de Despliegue con Docker - SIMR-UdeA

## Prerrequisitos
- Docker y Docker Compose instalados
- Git

## 🛠️ Configuración Inicial

1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd SIMR-UdeA
   ```

2. **Configurar variables de entorno**:
   ```bash
   # Para desarrollo
   cp .env.development .env

   # Para producción (editar con URLs reales)
   cp .env.production .env
   nano .env.production  # Editar con tus dominios reales
   ```

## 🏗️ Desarrollo Local

### Opción 1: Docker Compose (Recomendado)
```bash
# Levantar todos los servicios en desarrollo
docker-compose -f docker-compose.dev.yml up -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Detener servicios
docker-compose -f docker-compose.dev.yml down
```

### Opción 2: Desarrollo Nativo
```bash
# Backend
cd simr-back
cp ../.env.development .env
npm install
npm run dev

# Frontend Angular (nueva terminal)
cd simr-front
npm install
npm start

# Frontend AngularJS está incluido en el backend (puerto 3000)
```

### URLs de Desarrollo:
- **Frontend Angular**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **MinIO Console**: http://localhost:9001
- **MongoDB**: localhost:27017

## 🌐 Producción

### Configuración Previa:
1. **Editar `.env.production`** con tus URLs reales:
   ```bash
   API_URL=https://api.tu-dominio.com
   FRONTEND_URL=https://tu-dominio.com
   ANGULARJS_URL=https://legacy.tu-dominio.com
   ```

2. **Configurar certificados SSL** (opcional para HTTPS):
   ```bash
   mkdir ssl
   # Colocar cert.pem y key.pem en el directorio ssl/
   ```

### Despliegue:
```bash
# Construir y levantar todos los servicios en producción
docker-compose -f docker-compose.prod.yml up -d --build

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Detener servicios
docker-compose -f docker-compose.prod.yml down
```

### URLs de Producción:
- **Aplicación principal**: https://tu-dominio.com
- **API Backend**: https://api.tu-dominio.com
- **Legacy AngularJS**: https://tu-dominio.com/legacy

## 🔧 Comandos Útiles

### Desarrollo:
```bash
# Reconstruir y reiniciar servicios
docker-compose -f docker-compose.dev.yml up -d --build

# Acceder a un contenedor
docker-compose -f docker-compose.dev.yml exec simr-back bash

# Ver logs de un servicio específico
docker-compose -f docker-compose.dev.yml logs -f simr-back

# Limpiar volúmenes (borra datos)
docker-compose -f docker-compose.dev.yml down -v
```

### Producción:
```bash
# Actualizar servicios sin downtime
docker-compose -f docker-compose.prod.yml up -d --build

# Backup de base de datos
docker-compose -f docker-compose.prod.yml exec mongodb mongodump --out /backup

# Escalar servicios (ejemplo: múltiples instancias del backend)
docker-compose -f docker-compose.prod.yml up -d --scale simr-back=3
```

### Monitoreo:
```bash
# Ver estado de todos los servicios
docker-compose -f docker-compose.dev.yml ps

# Ver uso de recursos
docker stats

# Ver logs en tiempo real
docker-compose -f docker-compose.dev.yml logs -f
```

## 🔒 Autenticación en Docker

La configuración de autenticación funciona automáticamente en ambos entornos:

- **Desarrollo**: Cookies con `secure: false` para HTTP local
- **Producción**: Cookies con `secure: true` para HTTPS
- **Compartición de sesión**: Funciona entre contenedores via cookies HttpOnly

## 🐛 Solución de Problemas

### Servicios no inician:
```bash
# Ver logs detallados
docker-compose -f docker-compose.dev.yml logs <servicio>

# Verificar puertos ocupados
netstat -tulpn | grep :3000
```

### Problemas de conectividad:
```bash
# Verificar red de Docker
docker network ls
docker network inspect simr-net-dev
```

### Limpiar todo:
```bash
# Detener y eliminar todo
docker-compose -f docker-compose.dev.yml down -v --rmi all

# Limpiar sistema Docker
docker system prune -a
```

## 📊 Arquitectura de Contenedores

```
Desarrollo:
├── simr-front_dev (Angular)     :4200
├── simr-back_dev (Express)      :3000
├── mongodb_dev                  :27017
├── minio_dev                    :9000/:9001
└── nginx_dev                    :80

Producción:
├── simr-front_prod (Nginx + Angular)
├── simr-back_prod (Express)     interno:3000
├── mongodb_prod                 interno
├── minio_prod                   interno
└── nginx_prod                   :80/:443
```

## 🔄 Migración Desarrollo → Producción

1. **Probar en desarrollo** con `docker-compose.dev.yml`
2. **Configurar `.env.production`** con URLs reales
3. **Probar build de producción**:
   ```bash
   cd simr-front && npm run build:prod
   ```
4. **Desplegar** con `docker-compose.prod.yml`
5. **Verificar** funcionamiento de autenticación

## 📁 Estructura de Archivos Docker

```
SIMR-UdeA/
├── docker-compose.yml          # Configuración original
├── docker-compose.dev.yml      # Desarrollo con volúmenes
├── docker-compose.prod.yml     # Producción optimizada
├── nginx.conf                  # Proxy reverso principal
├── .env.development           # Variables desarrollo
├── .env.production            # Variables producción
├── simr-back/
│   ├── Dockerfile.dev         # Desarrollo con hot reload
│   ├── Dockerfile.prod        # Producción optimizada
│   └── ...
├── simr-front/
│   ├── Dockerfile.dev         # Desarrollo con Angular CLI
│   ├── Dockerfile.prod        # Multi-stage build + Nginx
│   ├── nginx.conf            # Configuración SPA
│   └── replace-env.js        # Script reemplazo variables
└── ...
```

¡La aplicación estará lista para desarrollo y producción con autenticación unificada! 🎉
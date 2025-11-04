# Pasos para Despliegue en Producción (172.23.0.97)

## Arquitectura de la Aplicación

La aplicación tiene **DOS frontends**:

1. **AngularJS Legacy (Principal)**
   - Puerto interno: 3000 (simr-back)
   - Ruta pública: `/`
   - URL: `http://172.23.0.97/`
   - Sirve: Vistas AngularJS + API Backend

2. **Angular Nuevo**
   - Puerto interno: 80 (simr-front - Nginx)
   - Ruta pública: `/angular/`
   - URL: `http://172.23.0.97/angular/`
   - Sirve: Aplicación Angular standalone

3. **Servicios de Infraestructura**
   - MongoDB: Puerto 27017
   - MinIO: Puertos 9000 (API) y 9001 (Consola)
   - Nginx (Proxy): Puerto 80

## 1. Preparar el Servidor

### Crear directorios de datos
```bash
sudo mkdir -p /mnt/data/mongodb
sudo mkdir -p /mnt/data/minio
sudo chmod -R 777 /mnt/data
```

### Verificar que Docker y Docker Compose están instalados
```bash
docker --version
docker compose version
```

## 2. Clonar/Actualizar el Repositorio

```bash
cd ~/SIMR-UdeA
git pull origin docker-containerization
```

## 3. Verificar Archivos de Configuración

### Verificar `.env.production` en la raíz
```bash
cat .env.production
```

Debe contener:
```
API_URL=http://172.23.0.97/api
FRONTEND_URL=http://172.23.0.97
MONGO_URI=mongodb://superAdmin:sadmin1990@mongodb:27017/simr?authSource=admin
MINIO_ENDPOINT=minio
MINIO_PORT=9000
# ... resto de variables
```

### Verificar `init.mongo.js`
```bash
cat init.mongo.js
```

## 4. Detener Contenedores Anteriores (si existen)

```bash
docker compose -f docker-compose.prod.yml down -v
```

## 5. Limpiar Imágenes Antiguas (opcional)

```bash
docker system prune -a --volumes
```

## 6. Construir y Levantar los Contenedores

```bash
# Construir las imágenes
docker compose -f docker-compose.prod.yml build --no-cache

# Levantar los servicios
docker compose -f docker-compose.prod.yml up -d

# Ver los logs en tiempo real
docker compose -f docker-compose.prod.yml logs -f
```

## 7. Verificar Estado de los Contenedores

```bash
docker compose -f docker-compose.prod.yml ps
```

Deberías ver:
- ✅ mongodb_prod - Up (healthy)
- ✅ minio_prod - Up (healthy)
- ✅ simr-back_prod - Up
- ✅ simr-front_prod - Up
- ✅ nginx_prod - Up
- ✅ minio-init - Exited (0) o Completed

## 8. Verificar Logs de Cada Servicio

```bash
# MongoDB
docker compose -f docker-compose.prod.yml logs mongodb

# MinIO
docker compose -f docker-compose.prod.yml logs minio

# MinIO Init
docker compose -f docker-compose.prod.yml logs minio-init

# Backend
docker compose -f docker-compose.prod.yml logs simr-back

# Frontend
docker compose -f docker-compose.prod.yml logs simr-front

# Nginx
docker compose -f docker-compose.prod.yml logs nginx
```

## 9. Verificar Conectividad

### Probar MongoDB desde el host
```bash
# Instalar mongosh si no está instalado
# En Ubuntu: sudo apt install mongodb-mongosh

mongosh --host 172.23.0.97 --port 27017 -u superAdmin -p sadmin1990 --authenticationDatabase admin
```

### Probar MinIO
Abrir en navegador: `http://172.23.0.97:9001`
- Usuario: `superAdmin`
- Contraseña: `sadmin1990`

### Probar la Aplicación
- AngularJS Legacy: `http://172.23.0.97/`
- Angular Nuevo: `http://172.23.0.97/angular/`
- API: `http://172.23.0.97/api/health`

## 10. Verificar Backend Logs para MongoDB

```bash
docker compose -f docker-compose.prod.yml logs simr-back | grep -i mongo
```

Deberías ver algo como:
```
MongoDB conectado exitosamente
```

## 11. Solución de Problemas Comunes

### Si MongoDB no conecta:
```bash
# Verificar que el contenedor esté corriendo
docker exec -it mongodb_prod mongosh -u superAdmin -p sadmin1990 --authenticationDatabase admin

# Verificar la base de datos
use simr
show collections
```

### Si MinIO no conecta:
```bash
# Verificar que el bucket existe
docker exec -it minio_prod mc ls local/sistema-archivos-simr
```

### Si el backend no puede conectar a MongoDB:
```bash
# Verificar la red
docker network inspect simr-udea_simr-net-prod

# Verificar las variables de entorno del backend
docker exec -it simr-back_prod env | grep MONGO
```

### Si hay problemas con permisos:
```bash
sudo chown -R 1001:1001 /mnt/data/mongodb
sudo chown -R 1001:1001 /mnt/data/minio
```

## 12. Reiniciar un Servicio Específico

```bash
# Solo reiniciar el backend
docker compose -f docker-compose.prod.yml restart simr-back

# Solo reiniciar el frontend
docker compose -f docker-compose.prod.yml restart simr-front

# Reconstruir y reiniciar el backend
docker compose -f docker-compose.prod.yml up -d --build simr-back
```

## 13. Verificar Autenticación

### Crear un usuario de prueba en MongoDB
```bash
docker exec -it mongodb_prod mongosh -u superAdmin -p sadmin1990 --authenticationDatabase admin

use simr
db.users.insertOne({
  firstName: "Admin",
  lastName: "Test",
  displayName: "Admin Test",
  email: "admin@test.com",
  username: "admin",
  password: "$2a$10$yourhashedpassword",
  roles: ["admin"],
  provider: "local",
  created: new Date()
})
```

## 14. Monitoreo Continuo

```bash
# Ver logs en tiempo real de todos los servicios
docker compose -f docker-compose.prod.yml logs -f

# Ver solo logs del backend
docker compose -f docker-compose.prod.yml logs -f simr-back

# Ver recursos utilizados
docker stats
```

## URLs de Acceso

- **Aplicación Principal (AngularJS)**: http://172.23.0.97/
- **Aplicación Nueva (Angular)**: http://172.23.0.97/angular/
- **API Backend**: http://172.23.0.97/api/
- **Consola MinIO**: http://172.23.0.97:9001/
- **MongoDB** (Compass): mongodb://superAdmin:sadmin1990@172.23.0.97:27017/simr?authSource=admin

## Notas de Seguridad

⚠️ **IMPORTANTE**: En producción final, deberías:
1. Comentar los puertos 27017, 9000 y 9001 en `docker-compose.prod.yml`
2. Cambiar las contraseñas de MongoDB y MinIO
3. Configurar HTTPS/SSL
4. Usar un firewall para restringir acceso a puertos sensibles

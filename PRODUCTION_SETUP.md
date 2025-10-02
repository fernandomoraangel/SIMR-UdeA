# Configuración de Producción - SIMR

## Configuración de Volúmenes en Producción

En producción, todos los datos persistentes se almacenan en `/mnt/data` para mejor organización y gestión.

### Preparación del Servidor

Antes de ejecutar el stack de producción, asegúrate de crear los directorios necesarios en el servidor:

```bash
# Crear los directorios base
sudo mkdir -p /mnt/data/mongodb
sudo mkdir -p /mnt/data/minio
sudo mkdir -p /mnt/data/ssl

# Establecer permisos apropiados
sudo chown -R 999:999 /mnt/data/mongodb    # Usuario MongoDB en Docker
sudo chown -R 1000:1000 /mnt/data/minio    # Usuario MinIO en Docker
sudo chown -R root:root /mnt/data/ssl       # Certificados SSL

# Establecer permisos de lectura/escritura apropiados
sudo chmod 755 /mnt/data
sudo chmod 750 /mnt/data/mongodb
sudo chmod 750 /mnt/data/minio
sudo chmod 700 /mnt/data/ssl
```

### Configuración de Volúmenes

El archivo `docker-compose.prod.yml` está configurado para usar las siguientes rutas:

- **MongoDB**: `/mnt/data/mongodb` → `/data/db` (dentro del contenedor)
- **MinIO**: `/mnt/data/minio` → `/data` (dentro del contenedor)
- **SSL**: `/mnt/data/ssl` → `/etc/ssl/certs` (dentro del contenedor nginx)

### Migración de Datos Existentes

Si ya tienes datos en volúmenes Docker nombrados, puedes migrarlos:

```bash
# Detener los servicios
docker-compose -f docker-compose.prod.yml down

# Copiar datos existentes (ajustar nombres de volúmenes según sea necesario)
docker run --rm -v mongodb_data_prod:/source -v /mnt/data/mongodb:/target alpine sh -c "cp -r /source/* /target/"
docker run --rm -v minio_data_prod:/source -v /mnt/data/minio:/target alpine sh -c "cp -r /source/* /target/"

# Restaurar permisos
sudo chown -R 999:999 /mnt/data/mongodb
sudo chown -R 1000:1000 /mnt/data/minio
```

### Backup y Mantenimiento

Con esta configuración, los backups son más sencillos ya que todos los datos están en `/mnt/data`:

```bash
# Backup completo
tar -czf simr-backup-$(date +%Y%m%d).tar.gz /mnt/data

# Backup solo de base de datos
tar -czf mongodb-backup-$(date +%Y%m%d).tar.gz /mnt/data/mongodb

# Backup solo de archivos
tar -czf minio-backup-$(date +%Y%m%d).tar.gz /mnt/data/minio
```

### Monitoreo de Espacio

Monitorea el uso de espacio en disco:

```bash
# Verificar espacio disponible
df -h /mnt/data

# Verificar uso por servicio
du -sh /mnt/data/*
```

### Consideraciones de Seguridad

1. Los certificados SSL deben tener permisos restrictivos (700)
2. Los datos de la base de datos deben ser accesibles solo por el usuario MongoDB
3. Considera cifrar el directorio `/mnt/data` si mantienes información sensible
4. Implementa rotación regular de logs y limpieza de datos temporales

### Ejecución en Producción

Para ejecutar el stack completo en producción:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Para verificar que todos los volúmenes estén montados correctamente:

```bash
docker-compose -f docker-compose.prod.yml exec mongodb_prod df -h /data/db
docker-compose -f docker-compose.prod.yml exec minio_prod df -h /data
```
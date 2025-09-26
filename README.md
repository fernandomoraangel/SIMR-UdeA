# SIMR
El Sistema de información de músicas regionales (SIMR) es una aplicación de gestión bibliotecaria y archivística y de gestión del conocimiento, elaborada para administrar y analizar el catálogo del Fondo de documentación perteneciente al Grupo de investigación de Músicas Regionales de la Universidad de Antioquia, así como sus colecciones virtuales de audios, partituras, imágenes y vídeos. Esta herramienta está orientada a investigadores y permite integrar información de los proyectos de investigación y del conocimiento de los investigadores a registros relacionados con Obras, Actores, Recursos, ejemplares y diversos tesauros. Está creada bajo la arquitectura MEAN stack y utiliza como nube privada de archivo la tecnología MiniIO.

EL SIMIR está basado en principios de la bibliotecología y la archivística y sistematiza la experiencia de más de 30 años del grupo Músicas Regionales estudiando las músicas del país y el continente desde la perspectiva de la musicología. Es una aplicación web desde la cual los usuarios pueden hacer procesos de análisis y catalogación de diversos tipos de obras musicales (y no musicales) y en la cual pueden relacionarse estas obras con elementos de las colecciones del grupo y el conocimiento que sobre estas acumulan los investigadores y los proyectos.

## Equipo de desarrollo

Fernando Mora Ángel, desearrollador principal


## Funcionalidades por desarrollar
1. Migración progresiva de AngularJS a Angular.
2. Implementar búsqueda general en cualquier campo, con expresiones similares y con operadores booleanos (en cualquier parte de la base de datos). Puede ser con https://www.fusejs.io/ y https://www.npmjs.com/package/elasticlunr).
3. Implementar sistema de roles y permisos. Todo usuario se registrar como "solo lector", el administrador puede cambiar, crear o editar roles y permisos de cada rol.
4. Implementar recuperación de contraseña usando Passport.
5. Visualizar registros en Markdown -puede ser con markdown-it-
6. Cambiar selectores por campos de texto con autocompletado y abrir automáticamente "Crear" si no se encuentran en la BD.
7. Agregar campos a Idioma para permitir listado ISO de idiomas o lenguas locales (entidad lingüística, familia, lengua, otras denominaciones, ubicación geográfica, variantes (con ubicación geográfica), notas
8. Resolver Issues
9. Modificaciones de seguridad solicitadas por UdeA (vulnerabilidades, certificado SSL, Configurar en modo producción).

## Funcionalidades implementadas
### 1. Implementación del sistema de archivos con [MinIO](https://min.io/docs/minio/linux/developers/javascript/minio-javascript.html):
  - Subir, descargar y visualizar archivos: reproducir audios y mostrar PDFs, vídeos o imágenes en una ventana nueva.
  - Implementación realizada en Angular.
    #### 1.1 Del lado del cliente (Angular):
    - Creación del módulo de archivos, que contiene (además de un servicio) tres componentes principales:
      - `archivo-subir`: Para la subida de archivos.
      - `archivo-lista`: Para cargar y mostrar los archivos adjuntos de un documento de la base de datos. 
      - `archivo-vista`: Para previsualizar los archivos en el navegador.      

    #### 1.2 Del lado del servidor (Express):
    - Creación del archivo `minio.js` dentro de la carpeta `config` (proyecto `simr-back`). <br>
        Este archivo contiene la lógica y las diferentes rutas (o _endpoints_) necesarios para la gestión de archivos en el sistema MinIO y MongoDB:
    - Rutas principales:
      - [GET] `/files/document-files`: Obtiene la lista de archivos adjuntos a un documento de MongoDB.
      - [POST] `/files/upload`: Sube un archivo a MinIO y almacena la información en MongoDB.
      - [GET] `/files/files`: Lista todos los archivos en un bucket de MinIO.
      - [GET] `/files/download/:filename`: Descarga un archivo de MinIO.
      - [DELETE] `/files/:filename`: Elimina un archivo de MinIO y actualiza las referencias en MongoDB.
      - [POST] `/files/delete-multiple`: Elimina múltiples archivos de MinIO y actualiza las referencias en MongoDB.
      - [GET] `/files/view/:filename`: Previsualiza archivos (soporta streaming de audio y video).
    - MongoDB: Almacena metadatos en una colección llamada `archivos`, como el nombre del archivo, su tamaño, fecha de subida, y referencia al nombre de objeto almacenado en MinIO (`minioObjectName`).
    - Las Entidades que hacen uso de archivos tienen asignada la propiedad `archivosAdjuntos` en su modelo, la cual guarda un listado de referencia a la colección `archivos`.

### 2. Comunicación de los frameworks AngularJS y Angular usando PostMessages.

## Funcionalidades futuras
1.  Vista de grafo (géneros formas, materias, Medios, sistemas sonoros).-Puede ser con https://www.sigmajs.org/
2.  Ver anotaciones cartográfico temporales en línea de tiempo y/o en mapa.
3.  Crear diseño Responsive.

## Otros pendientes

1. Incluir Campo de licenciamiento de cada obra y recurso.
2. Ver sistemas de repositorio y qué se puede aprender de ellos.
3. Revisar: [Directrices para repositorios institucionales de investigación del Ministerio de Ciencia, Tecnología e Innovación](https://redcol.readthedocs.io/es/latest/index.html ) 

## Instrucciones (En desarrollo)
1. Instalar Mongodb, Nodejs
2. Incluir el directorio de Mongodb en el path
3. Crear directorio para la base de datos en `C:\data\db`
4.     npm install -g npm-check-updates
5. Configurar las variables de entorno en el proyecto Express (dentro de la carpeta `simr-back`):
   1. Crear el archivo `.env` (sin nombre, sólo la extensión)
   2. Copiar en el archivo `.env` el siguiente texto :
    ```javascript
    # Credenciales de MongoDB
    MONGO_URI=mongodb://superAdmin:SOh3TbYhx8ypJPxmt1oOfL@localhost/simr
    MONGO_DB_NAME=simr

    # Credenciales de MinIO
    MINIO_ENDPOINT="play.min.io"
    MINIO_PORT=9000
    MINIO_USE_SSL=true
    MINIO_ACCESS_KEY=Q3AM3UQ867SPQQA43P2F
    MINIO_SECRET_KEY=zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG

    # Nombre del bucket de MinIO
    MINIO_BUCKET_NAME=sistema-archivos-simr
    ```
  6. Correr Backend (`simr-back`):
      ```
      npm start
      ``` 
      O correrlo con Nodemon <br>
      (Para que reinicie el servidor cada vez que detecte un cambio en el código):
      ```
      npm run dev
      ```
  7. Correr Frontend (`simr-front`):
      ```
      npm start
      ```

## Para reiniciar servidor automáticamente:
1.     npm install nodemon -g
2.     npm install -g sassSet-ExecutionPolicy Unrestricted
3. Iniciar con    
4.     nodemon --inspect server.js 
5. Debug: 
6.     Atack to node process

### Tutorial:
[Tutorial nodemon](]https://www.digitalocean.com/community/tutorials/workflow-nodemon-es)

Usar ctrl+shift+v para visualizar Markdown

## Útiles

1. [Debug in VSCODE](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)
2. [Markdown](https://es.wikipedia.org/wiki/Markdown)
3. Usar npm version para manejar versionado automático 
       npm version minor --force
4. [Comandos NPM](https://docs.npmjs.com/cli/v9/commands/npm-version?v=true)
5. [MinIO JavaScript API](https://min.io/docs/minio/linux/developers/javascript/API.html)
   
## GIT
~~~
https://rogerdudler.github.io/git-guide/index.es.html
cd C:\Users\ferna\Documents\Desarrollo\SIMR
git add .

git commit -m "Commit message"
git push origin main
~~~
## Pendiente
1. Resolver problema de borrado en la actualización.
2. Cambiar el nombre de la carpeta "example"
3. Eliminar variables redundantes y funciones no utilizadas.
4. Preparar y definir colaboradores parala Wiki del proyecto.
5. Construir sistema de roles y permisos.
6. Construir sistema de auditoría. Revisar el modelo de datos de la auditoría.
7. Verificar existencia de URL en campo enlaces.
8.  Versionado semántico.
    
## Autenticación Mongo DB
1. Conectar a Mongod
~~~
 mongosh --port 27017
~~~

2. Crear administrador
~~~
use simr
db.createUser(
  {
    user: "superAdmin",
    pwd: "SOh3TbYhx8ypJPxmt1oOfL",
    roles: [ { role: "root", db: "admin" } ]
  })
~~~
3. Habilitar autenticación
~~~
sudo nano /etc/mongod.conf
#Cambiar o agregar
security:
  authorization: 'enabled'
~~~
4. Reiniciar servicio
~~~
sudo service mongod restart
pm2 reload server
~~~
5. Conectarse localmente
~~~
mongohs --port 27017 -u "superAdmin" -p "SOh3TbYhx8ypJPxmt1oOfL" --authenticationDatabase "simr"
~~~
[como](https://codearmy.co/como-crear-autenticaci%C3%B3n-y-permitir-acceso-remoto-a-mongodb-1b0231a6df44) 
[Mongoose](https://salvatorelab.com/2014/02/activar-y-configurar-autenticacion-en-mongodb/)

6. Para cambiar el password
~~~
db.changeUserPassword("accountUser", "SOh3TbYhx8ypJPxmt1oOfL")
~~~

## Instalar en servidor SUSE
1. [Instalar SSH y agregar regla en Firewall](https://www.simplified.guide/suse/enable-ssh)
2.     zypper install nodejs
3. [Install MongoDB](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-suse/)
4. Instalar Mongo DB 
~~~
    sudo apt-get update
    sudo apt-get install -y mongodb-server
~~~
[Y si no](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/#install-mongodb-community-edition)
[Solucionar problemas de dependencias incumplidas](https://askubuntu.com/questions/1403619/mongodb-install-fails-on-ubuntu-22-04-depends-on-libssl1-1-but-it-is-not-insta)

Verificar que Mongo está corriendo y agregarlo para que inicie automáticamente
~~~
sudo systemctl start mongod
sudo systemctl status mongod
sudo systemctl enable mongod
~~~

Probar que funciona
~~~
mongosh
~~~

Reparar permisos de Mongodb (si aparece un error)
~~~
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown mongodb:mongodb /tmp/mongodb-27017.sock
~~~

5. Instalar Express
~~~
npm install express --save
~~~
6. Clonar repositorio
Instalar Git
~~~
sudo git clone https://github.com/fernandomoraangel/simr.git
sudo sudo npm startnpm install
npm start
~~~
1. [Instalar PM2](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-20-04)
7. Instalar PM2
~~~
sudo npm install pm2@latest -g
~~~
Desde el directorio de la aplicación:
~~~
pm2 start server.js
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u fma --hp /home/fma
#Correr, cambiando sammy por el usuario
pm2 save
sudo systemctl start pm2-fma
systemctl status pm2-fma
#Probar si todo va bien: 
pm2 monit
~~~
8. Crear Certificado SSL autofirmado:
1.  Crear carpeta para guardar el certificado y la clave:
~~~
mkdir ssl
openssl req -newkey rsa:4096 -x509 -sha256 -days 365 -nodes -out simr.crt -keyout simr.key
~~~
~~[Tutorial](https://liukin.es/como-crear-certificados-autofirmados-en-ubuntu-linux/)~~

10.  Instalar Nginx
~~~
sudo apt-get install nginx
#Crear o editar archivo de configuración
sudo nano /etc/nginx/nginx.conf
~~~
Agregar a archivo de configuración
~~~
# HTTPS server
server {
listen 443 ssl;
server_name localhost ;
ssl_certificate /home/fma/ssl/simr.crt;
ssl_certificate_key /home/fma/ssl/simr.key
root /home/fma/simr;

location / {
proxy_ pass http://localhost:3000;
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade ;
proxy_set_header Connection 'upgrade' ;
proxy_set_header Host $host;
proxy_cache_bypass $http_upgrade ;
}
}
~~~

1.   Reiniciar Nginxs e incluirlo en autostart
~~~
sudo service nginx restart
sudo systemctl enable nginx
~~~
2.   Configurar Firewall (en ubuntu)
~~~
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 27017/tcp
#También 27017 si se va a utilizar Compass para administrar las bases de datos
sudo ufw enable
~~~
 (en Suse):
~~~
# Agregar servicio Nginx a la zona pública
firewall-cmd --permanent --zone=public --add-service=http
firewall-cmd --permanent --zone=public --add-service=https
# Abrir los puertos 80 y 443 en la zona pública
firewall-cmd --permanent --zone=public --add-port=80/tcp
firewall-cmd --permanent --zone=public --add-port=443/tcp
# Recargar la configuración del firewall
firewall-cmd --reload
 ~~~

## Para usar Compass:

1. Abre el archivo de configuración de MongoDB en tu editor de texto preferido. El archivo se encuentra en /etc/mongod.conf.
2. Busca la línea "bindIp: 127.0.0.1" y cambia "127.0.0.1" por "0.0.0.0" para permitir que MongoDB escuche en todas las interfaces de red. Esto permite que las conexiones remotas se establezcan con tu servidor.
3. Guarda y cierra el archivo de configuración.
4. Reinicia MongoDB para que los cambios surtan efecto ejecutando el comando "sudo systemctl restart mongod"
5. Si tienes un firewall habilitado en tu servidor, asegúrate de permitir el tráfico entrante en el puerto 27017.
 ~~~
firewall-cmd --permanent --zone=public --add-port=27017/tcp
~~~

Importar usando Compass la colección Diccionarios, como JSON

## Configuración de IP 

[Instrucciones](https://jugandoaseringeniero.wordpress.com/2018/03/01/configuracion-manual-de-los-parametros-de-red-en-opensuse-42-3/)

Para ver la dirección IP asignada a una interfaz de red específica, puede usar el siguiente comando:

    ip addr show <interface>

Para ver la puerta de enlace predeterminada, puede usar el siguiente comando:

    ip route show

Para ver los servidores DNS configurados, puede usar el siguiente comando:

    cat /etc/resolv.conf

Reemplaza <interface> por el nombre de la interfaz de red que deseas ver la información. Ejemplo: 'eth0' o 'wlan0'
##Acceso por escritorio remoto

1. [Configurar XRDP](http://www.scalingbits.com/aws/sap/suse/gnome)

2. [Conectarse XRDP](https://hotsechu.wordpress.com/2021/01/31/conectarse-a-un-equipo-linux-desde-windows-con-xrdp/)

## Actualizar Directorio a última versión del repositorio
~~~
git fetch
~~~
~~~
git pull
~~~

## Chuletario de Comandos Docker y Docker Compose

### Comandos Básicos de Docker

#### Gestión de Imágenes
```bash
# Listar imágenes locales
docker images
docker image ls

# Descargar una imagen
docker pull <imagen>:<tag>

# Construir imagen desde Dockerfile
docker build -t <nombre-imagen>:<tag> .
docker build -t <nombre-imagen>:<tag> -f <dockerfile> <contexto>

# Eliminar imagen
docker rmi <imagen-id>
docker image rm <nombre-imagen>:<tag>

# Limpiar imágenes no utilizadas
docker image prune
docker image prune -a  # Elimina todas las imágenes no utilizadas
```

#### Gestión de Contenedores
```bash
# Listar contenedores en ejecución
docker ps
docker container ls

# Listar todos los contenedores (incluso detenidos)
docker ps -a
docker container ls -a

# Crear y ejecutar un contenedor
docker run <imagen>
docker run -d <imagen>                    # En background (detached)
docker run -p 3000:3000 <imagen>         # Mapear puertos
docker run -v /host/path:/container/path  # Montar volúmenes
docker run --name <nombre> <imagen>       # Asignar nombre

# Ejecutar comando en contenedor existente
docker exec -it <container-id> bash
docker exec -it <container-name> sh

# Detener contenedor
docker stop <container-id>
docker container stop <container-name>

# Iniciar contenedor detenido
docker start <container-id>
docker container start <container-name>

# Reiniciar contenedor
docker restart <container-id>
docker container restart <container-name>

# Eliminar contenedor
docker rm <container-id>
docker container rm <container-name>

# Eliminar contenedor en ejecución (forzado)
docker rm -f <container-id>
```

#### Monitoreo y Logs
```bash
# Ver logs de un contenedor
docker logs <container-id>
docker logs -f <container-id>           # Seguir logs en tiempo real
docker logs --tail 50 <container-id>   # Últimas 50 líneas

# Ver estadísticas de uso de recursos
docker stats
docker stats <container-id>

# Inspeccionar contenedor
docker inspect <container-id>

# Ver procesos en un contenedor
docker top <container-id>
```

#### Limpieza del Sistema
```bash
# Limpiar contenedores detenidos
docker container prune

# Limpiar imágenes no utilizadas
docker image prune

# Limpiar volúmenes no utilizados
docker volume prune

# Limpiar redes no utilizadas
docker network prune

# Limpieza general del sistema
docker system prune
docker system prune -a     # Incluye imágenes no utilizadas

# Ver espacio utilizado por Docker
docker system df
```

### Comandos de Docker Compose

#### Gestión de Servicios
```bash
# Construir y levantar todos los servicios
docker-compose up
docker-compose up -d                    # En background
docker-compose up --build              # Forzar reconstrucción
docker-compose up <servicio>           # Solo un servicio específico

# Construir servicios sin levantarlos
docker-compose build
docker-compose build --no-cache        # Sin usar caché
docker-compose build <servicio>        # Solo un servicio

# Detener servicios
docker-compose down
docker-compose down --volumes          # Elimina también volúmenes
docker-compose down --rmi all          # Elimina también imágenes

# Detener servicios sin eliminarlos
docker-compose stop
docker-compose stop <servicio>

# Iniciar servicios detenidos
docker-compose start
docker-compose start <servicio>

# Reiniciar servicios
docker-compose restart
docker-compose restart <servicio>
```

#### Configuraciones con Restart Policy
```yaml
# En docker-compose.yml - Configuraciones de reinicio:
version: '3.8'
services:
  servicio:
    restart: "no"              # No reiniciar automáticamente
    restart: always            # Siempre reiniciar
    restart: on-failure        # Solo si falla
    restart: unless-stopped    # Reiniciar a menos que se detenga manualmente
```

```bash
# Aplicar cambios de configuración
docker-compose up -d                    # Aplica cambios sin downtime
docker-compose up -d --force-recreate   # Recrea contenedores
```

#### Monitoreo y Debugging
```bash
# Ver logs de todos los servicios
docker-compose logs
docker-compose logs -f                  # Seguir logs en tiempo real
docker-compose logs <servicio>         # Logs de un servicio específico
docker-compose logs -f --tail 100 <servicio>  # Últimas 100 líneas seguidas

# Ver estado de servicios
docker-compose ps
docker-compose ps -a                    # Incluir servicios detenidos

# Ejecutar comando en servicio
docker-compose exec <servicio> bash
docker-compose exec <servicio> sh
docker-compose exec <servicio> <comando>

# Escalar servicios (crear múltiples instancias)
docker-compose up -d --scale <servicio>=3

# Ver configuración final del compose
docker-compose config
```

#### Gestión de Volúmenes y Redes
```bash
# Listar volúmenes del proyecto
docker-compose volume ls

# Eliminar volúmenes del proyecto
docker volume rm $(docker volume ls -q)

# Ver redes del proyecto
docker-compose network ls
docker network ls
```

### Comandos Útiles para Troubleshooting

#### Verificar Estado del Sistema
```bash
# Ver todos los procesos Docker
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Ver uso de recursos
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Verificar conectividad de red
docker-compose exec <servicio> ping <otro-servicio>
docker-compose exec <servicio> nslookup <otro-servicio>
```

#### Backup y Restore
```bash
# Backup de volúmenes
docker run --rm -v <volumen>:/backup -v $(pwd):/host alpine tar czf /host/backup.tar.gz -C /backup .

# Restore de volúmenes
docker run --rm -v <volumen>:/backup -v $(pwd):/host alpine tar xzf /host/backup.tar.gz -C /backup

# Exportar/Importar imágenes
docker save -o imagen.tar <imagen>:<tag>
docker load -i imagen.tar
```

### Ejemplos Específicos para el Proyecto SIMR

#### Levantamiento Normal
```bash
# Levantar todos los servicios en background
docker-compose up -d

# Ver logs de todos los servicios
docker-compose logs -f

# Ver solo logs del backend
docker-compose logs -f simr-back

# Ver solo logs del frontend
docker-compose logs -f simr-front
```

#### Desarrollo y Debug
```bash
# Reconstruir y levantar tras cambios en código
docker-compose up -d --build

# Acceder al contenedor del backend para debugging
docker-compose exec simr-back bash

# Acceder a MongoDB
docker-compose exec mongodb mongosh -u superAdmin -p SOh3TbYhx8ypJPxmt1oOfL simr

# Acceder a MinIO (interfaz web en http://localhost:9001)
# O desde línea de comandos:
docker-compose exec minio mc ls local/sistema-archivos-simr
```

#### Mantenimiento y Limpieza
```bash
# Reiniciar un servicio específico
docker-compose restart simr-back

# Ver estado de servicios con restart policy
docker-compose ps

# Limpiar el proyecto completo
docker-compose down --volumes --rmi all

# Levantar solo servicios de base de datos
docker-compose up -d mongodb minio

# Ver estadísticas de uso
docker stats simr-back_1 simr-front_1 mongodb_1
```

#### Comandos de Monitoreo Continuo
```bash
# Monitoreo completo en tiempo real
watch 'docker-compose ps && echo "=== LOGS RECIENTES ===" && docker-compose logs --tail 10'

# Ver solo servicios que han fallado
docker ps -a --filter "status=exited"

# Verificar que servicios se reinician automáticamente
docker-compose logs | grep -i restart
```

### Tips Importantes

1. **Restart Policies**: Con `restart: unless-stopped`, los contenedores se reinician automáticamente excepto cuando se detienen manualmente con `docker-compose stop` o `docker stop`.

2. **Logs**: Usa `-f` para seguir logs en tiempo real y `--tail N` para limitar la cantidad de líneas mostradas.

3. **Desarrollo**: Durante desarrollo, usa `docker-compose up --build` para asegurar que los cambios se reflejen.

4. **Limpieza**: Ejecuta regularmente `docker system prune` para liberar espacio en disco.

5. **Backup**: Siempre haz backup de tus volúmenes antes de hacer `docker-compose down --volumes`.

6. **Red**: Los servicios pueden comunicarse entre sí usando sus nombres de servicio definidos en `docker-compose.yml`.

### Solución de Problemas Comunes

```bash
# Si un servicio no inicia:
docker-compose logs <servicio>
docker-compose exec <servicio> sh  # Si está corriendo

# Si hay problemas de permisos:
docker-compose exec <servicio> chown -R $(id -u):$(id -g) /path/to/dir

# Si hay conflictos de puerto:
docker-compose ps
netstat -tulpn | grep <puerto>

# Si se agota el espacio en disco:
docker system df
docker system prune -a
```


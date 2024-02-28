# SIMR
El Sistema de información de músicas regionales (simr) es una aplicación CRUD elaborada para administrar el catálogo del grupo de investigación de Músicas Regionales de la Universidad de Antioquia, bajo la arquitectura MEAN stack.

## Características pendientes

1. Incluir Campo de licenciamiento de cada obra y recurso.
2. Ver sistemas de repositorio y qué se puede aprender de ellos.
3. Revisar: [Directrices para repositorios institucionales de investigación del Ministerio de Ciencia, Tecnología e Innovación](https://redcol.readthedocs.io/es/latest/index.html ) 


## Instrucciones (En desarrollo)
1. Instalar Mongodb, Nodejs
2. Incluir el directorio de Mongodb en el path
3. Crear directorio para la base de datos en C:\data\db
4.     npm install -g npm-check-updates
5.     npm start

## Para reiniciar servidor automáticamente:
1.     npm install nodemon -g
2.     npm install -g sassSet-ExecutionPolicy Unrestricted
3. Iniciar con    
4.     nodemon --inspect server.js 
5. Debug: 
6.     Atack to node process

### Tutorial:
[Tutorial nodemon](https://www.digitalocean.com/community/tutorials/workflow-nodemon-es)

Usar ctrl+shift+v para visualizar Markdown


## Útiles

1. [Debug in VSCODE](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)
2. [Markdown](https://es.wikipedia.org/wiki/Markdown)
3. Usar npm version para manejar versionado automático 
       npm version minor --force
4. [Comandos NPM](https://docs.npmjs.com/cli/v9/commands/npm-version?v=true)
   
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
8.  Subir archivos.
9.  Versionado semántico.
    
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

Verificar que Mongo está corriendo y agregarlo para que inicie automaticamente
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
[Tutorial](]https://liukin.es/como-crear-certificados-autofirmados-en-ubuntu-linux/)

10.  Instalar Nginx
~~~
sudo apt-get install nginx
#Crear o editar archivo de configuración
sudo nano /etc/nginx/nginx.conf
~~~
Agregar a archivo de configuracion
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
#También 27017 si se va a utilizar compass para administrar las bases de datos
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
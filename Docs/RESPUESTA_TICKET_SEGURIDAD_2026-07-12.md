# Respuesta al Ticket de Seguridad TI — Solicitud de IP Pública SIMSR

**Referencia:** Validaciones de Seguridad TI del 03/07/2026 (Nmap + OWASP ZAP)
**Fecha de esta respuesta:** 12/07/2026
**Aplicación:** SIMSR — `simsr.udea.edu.co` (servidor `172.23.0.97`)
**Responsable técnico:** fma

---

## 1. Resumen ejecutivo

Se corrigieron las **5 discrepancias críticas de red** (puertos 80, 9000, 9001, 27017) y las **2 alertas de capa web de mayor impacto operativo inmediato** (CSP ausente, SRI faltante) reportadas en el ticket. Todos los cambios fueron aplicados en producción, verificados con reescaneo externo y con monitoreo de logs de aplicación sin downtime perceptible ni afectación funcional.

La alerta de riesgo **ALTO** (librerías JS vulnerables: jQuery 2.1.4, Bootstrap 3.3.6, bootstrap-select 1.10.0) fue **diagnosticada y su causa raíz identificada**, pero se propone como una fase separada de mejora continua (ver sección 5), dado el riesgo real de romper funcionalidad crítica del frontend legacy AngularJS si se actualiza sin un ciclo de pruebas exhaustivo.

---

## 2. Causa raíz identificada — "Efecto Docker"

Se confirmó técnicamente el diagnóstico de Seguridad TI. Con acceso `sudo` en el servidor se auditaron las cadenas de `iptables`:

```
Chain FORWARD (policy DROP)
 -> DOCKER-USER (vacía, sin reglas)
 -> DOCKER-FORWARD (acepta todo lo reenviado a contenedores)

Chain DOCKER (nat) - reglas encontradas ANTES de la corrección:
 DNAT tcp dpt:27017 -> 172.18.0.2:27017   (mongodb)
 DNAT tcp dpt:9000  -> 172.18.0.3:9000    (minio)
 DNAT tcp dpt:9001  -> 172.18.0.3:9001    (minio)
 DNAT tcp dpt:80    -> 172.18.0.7:80      (nginx)
 DNAT tcp dpt:443   -> 172.18.0.7:443     (nginx)
```

Y en `firewalld` (zona `public`):
```
ports: 443/tcp 27017/tcp 2222/tcp   <- 80, 9000, 9001 ni siquiera figuran en la lista
rich rules: rule family="ipv4" port port="27017" protocol="tcp" reject
```

**Confirmado:** Docker inserta sus reglas DNAT/ACCEPT en la cadena `FORWARD` (vía `DOCKER-USER` → `DOCKER-FORWARD`), evadiendo por completo el `reject` explícito de firewalld sobre el puerto 27017 y sin que 80/9000/9001 pasen jamás por el filtrado de firewalld. Esto coincide exactamente con la hipótesis planteada en el ticket.

Adicionalmente, se identificó que el puerto 80 tenía un **segundo problema independiente**, no relacionado con Docker/firewalld: `nginx.prod.conf` contenía dos bloques `server { listen 80; }`. El bloque con `server_name simsr.udea.edu.co` redirigía correctamente a HTTPS, pero al no tener un `server_name` coincidente, Nginx usaba como *default* el primer bloque (`server_name localhost`), que no redirigía y exponía `/health`, `/files/`, `/api` en texto plano — exactamente el comportamiento que ve un escáner que apunta a la IP sin `Host` header válido.

---

## 3. Parte I — Corrección de Infraestructura y Red

### 3.1 Solución aplicada

Siguiendo la recomendación del ticket, se optó por la solución de menor riesgo y sin necesidad de tocar reglas de `iptables`/`firewalld` manualmente (frágiles ante reinicios de Docker): **bindear los puertos publicados por Docker a `127.0.0.1`**, de forma que Docker nunca cree la regla DNAT en `0.0.0.0`.

**`docker-compose.prod.yml`:**
```diff
   mongodb:
     ports:
-      - "27017:27017" # Exponer para debugging/Compass (comentar en producción final)
+      - "127.0.0.1:27017:27017" # Solo accesible localmente (SSH tunnel para Compass); no expuesto a Internet

   minio:
     ports:
-      - "9000:9000" # API de MinIO (exponer para debugging)
-      - "9001:9001" # Consola de MinIO (exponer para debugging)
+      - "127.0.0.1:9000:9000" # API de MinIO - acceso solo local, se llega vía proxy Nginx (/minio-api/)
+      - "127.0.0.1:9001:9001" # Consola de MinIO - acceso solo local, se llega vía proxy Nginx (/minio/)
```

Para el puerto 80, se eliminó el bloque `server` default permisivo y se dejó un único `server` con `default_server`, que redirige TODO a HTTPS sin excepción (ver diff completo en el Anexo A).

### 3.2 Matriz de validación — Antes vs. Después

| Puerto / Servicio | Estado reportado por Seguridad TI (03/07) | Estado verificado AHORA (12/07, reescaneo externo real) |
|---|---|---|
| 80/tcp (HTTP Nginx) | ABIERTO ⚠️ — expone `/health`, `/files/` en texto plano | **Solo redirige 301 a HTTPS**, sin excepción, incluso sin `Host` header válido ✅ |
| 443/tcp (HTTPS Nginx) | ABIERTO ✓ | Sin cambios, operando correctamente ✅ |
| 2222/tcp (SSH admin) | ABIERTO ✓ (alertas por versión) | Sin cambios en el puerto; ver sección 5 sobre hardening adicional |
| 9000/tcp (MinIO API) | ABIERTO ⚠️ — expuesto directamente | **CERRADO/FILTRADO** desde el exterior ✅ |
| 9001/tcp (MinIO Console) | ABIERTO ⚠️ — consola expuesta | **CERRADO/FILTRADO** desde el exterior ✅ |
| 27017/tcp (MongoDB) | ABIERTO ⚠️ — rich-rule evadida | **CERRADO/FILTRADO** desde el exterior ✅ |

### 3.3 Evidencia — Reescaneo de puertos (12/07/2026, 18:14, cliente externo)

```
Puerto   Servicio             Estado
80       Nginx HTTP           ABIERTO (solo redirect)
443      Nginx HTTPS          ABIERTO
2222     SSH admin            ABIERTO
9000     MinIO API            CERRADO/FILTRADO
9001     MinIO Console        CERRADO/FILTRADO
27017    MongoDB              CERRADO/FILTRADO
```

### 3.4 Evidencia — Puerto 80 redirige siempre a HTTPS

```
$ curl -I http://172.23.0.97/health
HTTP/1.1 301 Moved Permanently
Location: https://simsr.udea.edu.co/health

$ curl -I http://172.23.0.97/files/
HTTP/1.1 301 Moved Permanently
Location: https://simsr.udea.edu.co/files/

$ curl -I http://172.23.0.97/api
HTTP/1.1 301 Moved Permanently
Location: https://simsr.udea.edu.co/api

$ curl -I http://172.23.0.97/
HTTP/1.1 301 Moved Permanently
Location: https://simsr.udea.edu.co/
```

### 3.5 Evidencia — Puertos internos ya no escuchan en `0.0.0.0`

```
$ ss -tlnp   (ejecutado en el propio servidor)
LISTEN  0.0.0.0:2222     <- SSH (correcto, debe estar expuesto)
LISTEN  0.0.0.0:80       <- Nginx (correcto, solo redirect)
LISTEN  0.0.0.0:443      <- Nginx (correcto)
                             (27017, 9000, 9001 ya NO aparecen en 0.0.0.0 / [::])

$ docker ps
mongodb_prod   127.0.0.1:27017->27017/tcp     (healthy)
minio_prod     127.0.0.1:9000-9001->9000-9001/tcp   (healthy)
nginx_prod     0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

### 3.6 Continuidad operativa — sin pérdida de funcionalidad

El acceso legítimo a MinIO y MongoDB **no se perdió**, se reubicó de forma segura:
- **Consola/API de MinIO**: sigue accesible para administradores vía `https://simsr.udea.edu.co/minio/` y `/minio-api/` (proxy Nginx ya existente).
- **MongoDB (Compass/debug)**: accesible únicamente mediante túnel SSH (`ssh -p 2222 -L 27017:127.0.0.1:27017 fma@172.23.0.97`), nunca expuesto directamente a Internet.

---

## 4. Parte II — Capa de Aplicación Web (OWASP ZAP)

### 4.1 CSP ausente (riesgo MEDIO) — Corregido

Se confirmó que la página raíz (frontend legacy AngularJS) no enviaba ninguna cabecera `Content-Security-Policy`. Se implementó una política específica en el bloque `location /` de Nginx (sin afectar las políticas propias, ya existentes, de la consola MinIO ni del frontend Angular nuevo — ver nota de diseño en Anexo B):

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com; img-src 'self' data:;
connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'
```

**Evidencia (antes / después):**
```
ANTES:  (sin cabecera Content-Security-Policy)
AHORA:  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; ...
        Server: nginx
        Strict-Transport-Security: max-age=31536000; includeSubDomains
        X-Frame-Options: SAMEORIGIN
        X-Content-Type-Options: nosniff
        Referrer-Policy: no-referrer
```

Se verificó explícitamente que la consola de MinIO (que ya traía su propio CSP permitiendo `unpkg.com`) y el frontend Angular nuevo (`/angular/`) **no fueron afectados** — cada uno conserva su propia política sin duplicados ni conflictos.

### 4.2 SRI faltante (riesgo MEDIO) — Corregido mediante eliminación del CDN

Siguiendo la opción **preferida** indicada en el propio ticket ("descargar los recursos de manera local"), en lugar de solo agregar atributos `integrity`/`crossorigin`, se eliminó por completo la dependencia de CDNs externos:

| Recurso | Antes | Ahora |
|---|---|---|
| SweetAlert2 | `https://cdn.jsdelivr.net/npm/sweetalert2@11` (versión flotante, sin SRI) | `/lib/sweetalert2/dist/sweetalert2.all.min.js` (v11.14.3, servido localmente) |
| D3.js | `https://d3js.org/d3.v7.min.js` (sin SRI) | `/lib/d3/d3.v7.min.js` (v7.9.0, servido localmente) |

**Evidencia:**
```
$ grep script.*src index.ejs (renderizado real)
<script src="/lib/sweetalert2/dist/sweetalert2.all.min.js"></script>
<script src="/lib/d3/d3.v7.min.js"></script>

$ curl -I https://simsr.udea.edu.co/lib/sweetalert2/dist/sweetalert2.all.min.js
HTTP/2 200   (70876 bytes, servidor: nginx)

$ curl -I https://simsr.udea.edu.co/lib/d3/d3.v7.min.js
HTTP/2 200   (279706 bytes, servidor: nginx)
```

No quedan referencias activas a `cdn.jsdelivr.net` ni `d3js.org` en el HTML servido. Con esto, la alerta de SRI queda resuelta de raíz (ya no hay recurso de terceros del cual depender), en lugar de solo mitigada.

### 4.3 Server Leaks Version Information (riesgo BAJO) — Corregido

```
ANTES:  Server: nginx/1.29.1
AHORA:  Server: nginx
```
Aplicado vía `server_tokens off;` en el bloque HTTPS de `nginx.prod.conf`.

### 4.4 Vulnerable JS Library (riesgo ALTO) — Diagnosticado, en plan de mejora continua

Se identificó el origen exacto de esta alerta: el frontend legacy AngularJS vendorea librerías desactualizadas:

| Librería | Versión actual | Antigüedad aprox. |
|---|---|---|
| jQuery | 2.1.4 | 2015 |
| Bootstrap | 3.3.6 | 2016 |
| bootstrap-select | 1.10.0 | 2015 |
| AngularJS | 1.5.8 / 1.8.2 (coexisten) | EOL, sin soporte de seguridad desde 2021 |

**Por qué no se aplica en este ciclo:** `bootstrap-select` depende funcionalmente de jQuery y Bootstrap; un salto de versión mayor de jQuery (2.x→3.x) elimina APIs deprecadas que pueden romper selects, modales y formularios en la totalidad de los módulos del sistema (actores, obras, recursos, géneros, etc.). Dado que la prioridad indicada es *"cambios mínimos, verificando cada paso, sin dejar de funcionar"*, se propone abordar esta actualización en un ciclo separado con pruebas de regresión completas en el entorno de desarrollo (`docker-compose.dev.yml`) antes de tocar producción.

**Se solicita a Seguridad TI** contemplar esta alerta como aceptada con plan de remediación a mediano plazo, no bloqueante para la asignación de la IP pública, dado que el riesgo de explotación real (XSS vía jQuery `<3.5.0`) requiere condiciones adicionales (inyección de contenido no confiable en el DOM) que no se han identificado como vector activo en el código propio de la aplicación (ver Anexo C).

---

## 5. Hallazgos adicionales fuera del alcance directo del ticket

Durante el diagnóstico se identificaron los siguientes puntos, que no bloquean la aprobación de la IP pública pero se reportan por transparencia:

1. **Puerto 22 además del 2222**: el servidor tiene `sshd` escuchando en ambos puertos (`Port 22` y `Port 2222` en `sshd_config`), aunque el 22 no está expuesto por firewalld/Docker (confirmado cerrado externamente). Se recomienda remover la directiva `Port 22` no utilizada para reducir superficie de ataque en la red interna.
2. **Credenciales compartidas**: `MONGO_ROOT_PASSWORD` / `MINIO_ROOT_PASSWORD` (`sadmin1990`) y `JWT_SECRET` de ejemplo, repetidos en todos los entornos (`.env.production`, `.env.development`) y hardcodeados en `config/env/*.js`. Se recomienda rotarlos y moverlos a un gestor de secretos, fuera de este ciclo.
3. **Bucket MinIO con lectura pública anónima** (`mc anonymous set public`) — a evaluar si es el comportamiento deseado para el bucket `sistema-archivos-simr`.

---

## 6. Solicitud a Seguridad TI

Con los cambios de las secciones 3 y 4 aplicados y verificados en producción, **se solicita el contra-escaneo (Nmap + ZAP)** para validar el cierre efectivo de los puertos 80 (en su comportamiento indebido), 9000, 9001, 27017, y la mitigación de las alertas de CSP, SRI y versión de servidor, como paso previo a la emisión del aval técnico para la asignación de la IP pública.

La alerta ALTA de librerías JS vulnerables queda documentada en la sección 4.4 como plan de mejora continua, dado el riesgo de regresión funcional; quedo atento a la valoración del equipo de Seguridad TI sobre si esto es aceptable para continuar o si debe resolverse antes de esta etapa.

---

## Anexo A — Diff completo `nginx.prod.conf` (puerto 80)

```nginx
# ANTES: dos bloques listen 80 (uno permisivo por defecto + uno con redirect)
# AHORA: un único bloque, default_server, solo redirect:

server {
    listen 80 default_server;
    server_name _;

    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    return 301 https://simsr.udea.edu.co$request_uri;
}
```

## Anexo B — Nota de diseño sobre CSP y cabeceras duplicadas

Se detectó en las pruebas que agregar el CSP a nivel de `server` (bloque 443 completo) generaba **cabeceras duplicadas** en `/angular/` (el contenedor Angular ya envía su propio CSP) y en `/minio/` `/minio-api/` (MinIO ya envía el suyo, permitiendo `unpkg.com`). Enviar dos cabeceras `Content-Security-Policy` provoca que el navegador aplique la intersección más restrictiva de ambas políticas, lo cual **habría roto la consola de MinIO** (bloqueando `unpkg.com`, ya permitido en su política original). Por esto, el `add_header` de CSP se colocó únicamente dentro de `location /`, que es la única ruta que no tenía CSP propio.

## Anexo C — Uso de `eval`/`innerHTML` en el código

Grep exhaustivo confirmó que el código propio de la aplicación SIMR (fuera de `public/lib/`) **no usa** `eval()`, `innerHTML` ni `document.write` directamente. Estas APIs solo aparecen dentro de las librerías vendored (`angular.js`, `sweetalert2`, `bootstrap-select`), como parte de su funcionamiento interno normal (motor de templates de AngularJS, renderizado de popups/dropdowns).

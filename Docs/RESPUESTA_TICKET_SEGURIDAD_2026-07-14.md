# Respuesta al Ticket de Seguridad TI — Remediación de AngularJS EOL (Severidad ALTA)

**Referencia:** Contra-escaneo OWASP ZAP posterior a la respuesta del 12/07/2026
**Fecha de esta respuesta:** 14/07/2026
**Aplicación:** SIMSR — `simsr.udea.edu.co` (servidor `172.23.0.97`)
**Responsable técnico:** fma

---

## 1. Resumen ejecutivo

Se recibió el contra-escaneo con **2 hallazgos de Severidad ALTA**, ambos derivados del estado EOL de AngularJS 1.8.2:

- `/lib/angular@1.8.2/angular-resource/angular-resource.js`
- `/lib/angular@1.8.2/angular-route/angular-route.js`

Se optó por la vía de **remediación de raíz sin costo de licencia**: en lugar de contratar soporte extendido de terceros (HeroDevs NES u otro), se **eliminaron por completo** ambas librerías del sistema y se reemplazaron por dos módulos propios ("shims"), escritos para esta aplicación, que reimplementan únicamente el subconjunto de funciones (`$resource`, `$routeProvider`, `ng-view`, `$routeParams`) que el frontend legacy realmente utiliza — apoyándose exclusivamente en el núcleo de `angular.js` (`$http`, `$location`, `$compile`), que **no fue señalado** en ningún escaneo.

El cambio se aplicó en producción, se reconstruyó el contenedor `simr-back` y se verificó tanto a nivel de archivos servidos (HTTP) como de comportamiento funcional (login, navegación, CRUD), sin downtime de los demás servicios (`simr-front`, MongoDB, MinIO, Nginx).

---

## 2. Causa raíz y alcance real del problema

AngularJS core (`angular.js`) se distribuye junto con módulos satélite opcionales. Esta aplicación cargaba dos de ellos:

- **`angular-resource.js`**: wrapper sobre `$http` para consumir APIs REST (`$resource`).
- **`angular-route.js`**: enrutador basado en hash (`$routeProvider`, `ng-view`) para la navegación SPA.

Ambos están en **estado EOL desde enero de 2022**, sin parches oficiales de Google, y acumulan las vulnerabilidades reportadas (CVE-2024-8372, CVE-2024-21490, CVE-2025-0716, CVE-2025-2336, entre otras — ReDoS y XSS/secuestro de sesión).

Un análisis del código propio confirmó que el uso de ambas librerías está **totalmente acotado y homogéneo** en los 22 módulos de negocio del sistema (obras, recursos, colecciones, actores, etc.):

| Librería | Funciones usadas por la app |
|---|---|
| `ngResource` | `Recurso.get()`, `.query()`, `.save()`, `.update()` (acción custom PUT), instancias `.$save()`, `.$update()`, `.$remove()`, `.$promise` |
| `ngRoute` | `$routeProvider.when()/.otherwise()`, `$routeParams`, directiva `ng-view`, eventos `$routeChangeStart/Success/Error` |

No se identificó ningún uso de características avanzadas (resolvers, animaciones, cancelación de peticiones, `reloadOnSearch`), lo cual hizo viable escribir un reemplazo acotado y de bajo riesgo en lugar de una migración completa del frontend (ver sección 5).

---

## 3. Solución aplicada

### 3.1 Eliminación de las librerías vulnerables

Se removieron físicamente del repositorio y del contenedor:

```
simr-back/public/lib/angular-resource/          (eliminado, sin versión de sufijo, ya en desuso)
simr-back/public/lib/angular-route/             (eliminado, sin versión de sufijo, ya en desuso)
simr-back/public/lib/angular/                   (eliminado, copia legacy duplicada, sin versión de sufijo)
simr-back/public/lib/angular@1.8.2/angular-resource/   (eliminado — la que estaba activa)
simr-back/public/lib/angular@1.8.2/angular-route/      (eliminado — la que estaba activa)
```

Solo permanece `simr-back/public/lib/angular@1.8.2/angular/angular.js` (el **núcleo** de AngularJS, no señalado por ZAP en ningún escaneo hasta la fecha).

### 3.2 Shims propios de reemplazo (sin dependencias externas ni licencias)

Se agregaron dos archivos nuevos en `simr-back/public/lib/shims/`:

- **`resource-shim.client.js`** — reimplementa `$resource` sobre `$http` (núcleo).
- **`route-shim.client.js`** — reimplementa `$routeProvider`, `$routeParams` y la directiva `ng-view` sobre `$location`/`$rootScope`/`$compile` (núcleo).

Se diseñaron como **reemplazo "drop-in"**: la interfaz pública replica exactamente el comportamiento que el código existente espera, incluyendo la sincronización de `$routeParams`, la propagación de propiedades personalizadas de ruta (`permission`, `resource`, `requireAuth`) y la limpieza de campos internos (`$promise`, `$resolved`) antes de enviar datos al backend.

**Resultado:** cero cambios de lógica en los 22 módulos de negocio (`obras`, `recursos`, `colecciones`, `actores`, etc.). Solo se actualizó el nombre de la dependencia inyectada (`"ngResource"` → `"ngResourceShim"`, `"ngRoute"` → `"ngRouteShim"`) en 3 archivos de configuración (`application.js` y los dos módulos que las declaraban explícitamente: `graph` y `search`).

### 3.3 Verificación previa a producción

Antes de desplegar, se ejecutaron pruebas automatizadas (Node.js + jsdom, cargando el `angular.js` real + los shims + un backend HTTP simulado) que confirmaron, sin ninguna excepción de JavaScript:

- `query()`/`get()` pueblan correctamente el modelo tras la petición HTTP.
- `save()`/`$save()`, `update()`/`$update()` (PUT con sustitución de `:parámetro`) y `remove()`/`$remove()` construyen la URL y el cuerpo de la petición de forma idéntica al comportamiento original.
- Las rutas con parámetros (`/obras/:obraId`) resuelven `$routeParams` y disparan `$routeChangeStart` con la información esperada por los guards de permisos existentes (`core.client.module.js`).

Este proceso detectó y corrigió 2 defectos antes del despliegue (nombre de provider del router, y filtrado de campos internos en el payload), evitando llevarlos a producción.

---

## 4. Evidencia — Despliegue y verificación en producción

### 4.1 Despliegue

```
$ git log --oneline -1
79b2b26 security: reemplazar angular-resource y angular-route (EOL) por shims propios

$ docker compose -f docker-compose.prod.yml build simr-back
 [...]
 Image simr-udea-simr-back Built

$ docker compose -f docker-compose.prod.yml up -d --no-deps simr-back
 Container simr-back_prod Recreated
 Container simr-back_prod Started

$ docker ps --format '{{.Names}}\t{{.Status}}'
simr-back_prod    Up (reconstruido)
simr-front_prod    Up 7 horas   <- sin afectar
mongodb_prod       Up 2 dias (healthy)   <- sin afectar
minio_prod         Up 2 dias (healthy)   <- sin afectar
nginx_prod         Up 2 dias   <- sin afectar
```

### 4.2 Confirmación — las librerías vulnerables ya no existen ni se sirven (14/07/2026, 11:26)

```
$ find simr-back/public/lib -maxdepth 1 -iname '*angular*'   (host y dentro del contenedor)
/app/public/lib/angular@1.8.2      <- solo queda el nucleo, sin angular-resource ni angular-route

$ wget -S -O /dev/null http://localhost:3000/lib/angular-resource/angular-resource.js
HTTP/1.1 404 Not Found

$ wget -S -O /dev/null http://localhost:3000/lib/angular-route/angular-route.js
HTTP/1.1 404 Not Found
```

### 4.3 Confirmación — los shims de reemplazo se sirven correctamente

```
$ wget -S -O /dev/null http://localhost:3000/lib/shims/resource-shim.client.js
HTTP/1.1 200 OK

$ wget -S -O /dev/null http://localhost:3000/lib/shims/route-shim.client.js
HTTP/1.1 200 OK

$ curl (contenido servido en la raíz, index.ejs renderizado)
<script type="text/javascript" src="/lib/angular@1.8.2/angular/angular.js"></script>
<script type="text/javascript" src="/lib/shims/resource-shim.client.js"></script>
<script type="text/javascript" src="/lib/shims/route-shim.client.js"></script>
```

### 4.4 Confirmación funcional — la aplicación opera con normalidad

```
$ docker logs --tail 20 simr-back_prod
[...]
Token extraido de cookies: Token encontrado
Payload recibido del token: { id: '...', type: 'access', ... }
Usuario encontrado: admin
Roles del usuario: [ { name: 'admin', ... } ]
```

Los logs muestran actividad real de autenticación (login de administrador) posterior a la reconstrucción del contenedor, sin errores de aplicación ni excepciones de JavaScript. Adicionalmente se validó manualmente en navegador: login, navegación entre módulos y operaciones de creación/edición/eliminación sobre un registro de prueba, sin regresiones observadas.

---

## 5. Alcance y transparencia sobre lo que NO se hizo (por ahora)

Para que quede explícito ante una auditoría: esta solución **no es una migración a Angular moderno** (la cual sí existe en paralelo, en `simr-front/`, y avanza de forma incremental módulo por módulo). Es una **remediación de seguridad acotada**: elimina el código con CVEs activos sin tocar el núcleo `angular.js` (que se mantiene por ahora, dado que no ha sido señalado por ningún escaneo) ni la lógica de negocio de los 22 módulos.

Si un futuro escaneo señalara también `angular.js` (núcleo) como Severidad ALTA, se informará de inmediato para evaluar la migración del módulo correspondiente hacia `simr-front` (Angular moderno) como remediación definitiva, dado que en ese punto un shim ya no sería una opción de bajo riesgo.

---

## 6. Solicitud a Seguridad TI

Con la eliminación verificada de `angular-resource.js` y `angular-route.js` (sección 4.2) y la operación normal de la aplicación confirmada (sección 4.4), **se solicita un nuevo contra-escaneo con OWASP ZAP** enfocado en las 2 alertas de Severidad ALTA de esta comunicación, como paso previo a la emisión del aval técnico para la asignación de la IP pública.

Quedo atento a los resultados y disponible para cualquier aclaración adicional.

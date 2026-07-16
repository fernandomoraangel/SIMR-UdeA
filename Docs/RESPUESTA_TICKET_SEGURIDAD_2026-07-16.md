# Respuesta al Ticket de Seguridad TI — Remediación de AngularJS Core (Severidad ALTA)

**Referencia:** Contra-escaneo OWASP ZAP más profundo, posterior a la respuesta del 14/07/2026
**Fecha de esta respuesta:** 16/07/2026
**Aplicación:** SIMSR — `simsr.udea.edu.co` (servidor `172.23.0.97`)
**Responsable técnico:** fma

---

## 1. Resumen ejecutivo

El contra-escaneo más profundo detectó una nueva alerta de Severidad ALTA, esta vez sobre el **núcleo** de AngularJS (no sobre los módulos satélite `ngResource`/`ngRoute`, ya remediados el 14/07):

- Componente: `angular.js` (v1.8.2)
- Ruta afectada: `/lib/angular@1.8.2/angular/angular.js`

Se investigó exhaustivamente la posibilidad de un parche gratuito para el núcleo y **se confirmó que no existe ninguno**: la única versión posterior a la 1.8.2 publicada en el registro oficial de npm es la 1.8.3, cuyo changelog declara textualmente que es *"una última publicación para actualizar el README en npm"*, sin ningún cambio de código. HeroDevs (soporte extendido pagado) es la única vía "oficial" restante, y queda fuera de alcance por restricción de presupuesto.

En su lugar, se aplicó una **remediación estructural gratuita**: se eliminó por completo el acceso anónimo (no autenticado) al shell legacy de AngularJS y a todos sus archivos estáticos — incluyendo `angular.js`, pero también `jquery` y `bootstrap`, señalados como pendientes en la respuesta del 12/07 —, redirigiendo a cualquier visitante sin sesión válida hacia el login del frontend moderno (`simr-front`, Angular 20), completamente independiente de AngularJS. Un escaneo anónimo — que es exactamente el método con el que se audita la exposición a Internet — ya no puede descargar ni fingerprintear ninguna de estas librerías.

Se corrigió además, por transparencia, un **XSS real e independiente** hallado durante el análisis en el módulo de búsqueda.

---

## 2. Causa raíz

El shell HTML de AngularJS (`GET /`) y todos sus assets estáticos (`/lib/*`, `*.client.*.js`, vistas `.html`) se servían de forma **completamente pública y anónima**, sin ninguna verificación de sesión:

- `simr-back/app/controllers/index.server.controller.js`: `res.render('index', ...)` se ejecutaba incondicionalmente, autenticado o no.
- `simr-back/config/express.js`: `express.static('./public')` sin ningún middleware de autenticación delante.

La única verificación de sesión existente ocurría **dentro** del propio AngularJS (guard client-side en `core.client.module.js`), lo cual es irrelevante para un escáner anónimo: para llegar a ejecutar ese guard, el navegador (o el escáner) ya tuvo que descargar y ejecutar `angular.js` primero. El archivo vulnerable se entregaba gratis a cualquiera, autenticado o no.

---

## 3. Solución aplicada

### 3.1 Auth-gating del shell legacy (sin costo, sin tocar los 22 módulos de negocio)

Se agregó un middleware (`simr-back/app/middleware/legacyShellGuard.js`) que reutiliza la **misma verificación JWT** (passport-jwt, cookies httpOnly) que ya usa el resto de la aplicación, y se montó en dos puntos:

- `GET /` (el shell legacy)
- `express.static('./public')` (TODOS los assets estáticos legacy: `angular.js`, `jquery`, `bootstrap`, y los `*.client.*.js`/`.html` de los 22 módulos)

Si no hay sesión válida, se redirige (HTTP 302) al login del frontend moderno (Angular 20, `/angular/login`), pasando la ruta original como parámetro `returnTo`. Tras autenticarse, el usuario regresa automáticamente al recurso legacy solicitado a través de un endpoint que **ya existía** en el backend (`/redirect-to-legacy`, antes usado solo en sentido inverso), ahora con una redirección relativa (se corrigió de paso un bug: usaba una variable de entorno no definida en producción y caía a `localhost`).

Las rutas `/api/*` (login, signup, verify, refresh) **no se vieron afectadas** — siguen siendo anónimas, como debe ser para que el flujo de login funcione.

Importante: esto **no es un parche** de `angular.js` (no existe ninguno gratuito). Es una reducción real y verificable de la superficie de exposición pública: el código con CVEs activos deja de ser descargable por cualquier visitante anónimo de Internet, que es exactamente la preocupación que motiva la política de la Universidad.

### 3.2 Continuidad de experiencia de usuario

Como el login de Angular 20 se convirtió en la única puerta de entrada anónima de la aplicación (antes era un formulario de pruebas sin diseño), se restauró su apariencia para que sea consistente con el resto del sistema: logo institucional, tarjeta centrada, botón primario, y se aplicó el mismo tratamiento al formulario de registro. Cero impacto en la lógica de autenticación, solo en la plantilla/estilos.

### 3.3 Hallazgo adicional corregido — XSS real en búsqueda (independiente de AngularJS EOL)

Durante el análisis se encontró que `search/filters/highlight.client.filter.js` insertaba texto proveniente de la base de datos (títulos, descripciones) o del término de búsqueda **sin escapar** dentro de HTML, usado luego vía `ng-bind-html` + `$sce.trustAsHtml()` **sin `ngSanitize` cargado** (no se usa en esta app) — es decir, sin ninguna sanitización real. Esto permitía XSS almacenado/reflejado si un campo contenía markup malicioso. Se corrigió escapando las entidades HTML del texto antes de aplicar el resaltado de búsqueda, y se uniformizó `vm.highlightText` (antes devolvía texto crudo sin marcar cuando no había término de búsqueda).

---

## 4. Evidencia — Verificación en producción (16/07/2026)

### 4.1 Antes de la corrección (comportamiento previo, documentado para referencia)

Cualquier visitante anónimo obtenía `HTTP 200` al pedir directamente `angular.js` (y `jquery`, `bootstrap`), exactamente lo que permitió al escáner fingerprintear la versión vulnerable.

### 4.2 Después de la corrección — acceso anónimo bloqueado

Verificado directamente en el servidor, a través de Nginx (mismo camino que usa cualquier visitante externo):

```
$ curl -sk -o /dev/null -w 'HTTP %{http_code} -> %{redirect_url}\n' https://localhost/
HTTP 302 -> https://172.23.0.97/angular/login?returnTo=%2F

$ curl -sk -o /dev/null -w 'HTTP %{http_code} -> %{redirect_url}\n' https://localhost/lib/angular@1.8.2/angular/angular.js
HTTP 302 -> https://172.23.0.97/angular/login?returnTo=%2Flib%2Fangular%401.8.2%2Fangular%2Fangular.js

$ curl -sk -o /dev/null -w 'HTTP %{http_code}\n' https://localhost/lib/jquery/dist/jquery.min.js
HTTP 302   (bonus: tambien protege jQuery/Bootstrap, pendiente del ticket del 12/07)
```

### 4.3 API de autenticación sigue siendo anónima (no se rompió el flujo de login)

```
$ curl -sk -o /dev/null -w 'HTTP %{http_code}\n' https://localhost/api/auth/verify
HTTP 401   (responde, no bloqueado — 401 es la respuesta normal sin token)
```

### 4.4 Con sesión válida, todo funciona exactamente igual que antes

```
$ curl (con cookie accessToken válida) -> GET /
HTTP 200   (shell legacy, normal)

$ curl (con cookie accessToken válida) -> GET /lib/angular@1.8.2/angular/angular.js
HTTP 200

$ curl (con cookie manipulada/inválida) -> GET /
HTTP 302   (rechazada correctamente, no hay bypass)
```

### 4.5 Protección contra open-redirect

Se probó explícitamente que un `returnTo` con una URL externa (`https://evil.com`) es ignorado por el endpoint `/redirect-to-legacy`, cayendo siempre a una ruta relativa segura por defecto.

### 4.6 Validación funcional end-to-end

Login real de un usuario existente (vía cookie JWT), navegación al shell legacy, y verificación de logs del servidor sin errores de aplicación. Adicionalmente se validó manualmente en navegador el flujo completo: visita anónima → redirección a login moderno → autenticación → regreso automático a la aplicación legacy, sin fricción para el usuario final.

---

## 5. Alcance y transparencia

Esta solución:

- **No requiere licencias ni pagos** (a diferencia de HeroDevs NES).
- **No modifica** la lógica de los 22 módulos de negocio del sistema.
- **Reduce la superficie de exposición pública a cero** para todas las librerías vendored con CVEs conocidos (`angular.js`, `jquery`, `bootstrap`), no solo la señalada en este escaneo puntual.
- Es **complementaria**, no sustituta, del plan de migración incremental hacia Angular moderno (`simr-front`) ya en marcha, que sigue siendo la remediación definitiva a mediano plazo.

Si Seguridad TI considera que el criterio de "no exposición a Internet" requiere además la eliminación física del código (no solo el bloqueo de acceso anónimo), quedamos atentos a esa aclaración de política para planificar los siguientes pasos de la migración en consecuencia.

---

## 6. Solicitud a Seguridad TI

Con la verificación de que ningún visitante anónimo puede ya descargar `angular.js` (ni `jquery`/`bootstrap`), y con el flujo de autenticación funcionando normalmente (secciones 4.2 a 4.6), **se solicita un nuevo contra-escaneo con OWASP ZAP** sobre `https://simsr.udea.edu.co` (sin credenciales, como corresponde a una auditoría de exposición pública), como paso previo a la emisión del aval técnico para la asignación de la IP pública.

Quedo atento a los resultados y disponible para cualquier aclaración adicional.

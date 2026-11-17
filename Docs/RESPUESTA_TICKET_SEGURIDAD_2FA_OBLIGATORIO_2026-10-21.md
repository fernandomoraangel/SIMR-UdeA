# Respuesta al Ticket de Seguridad TI — Doble Factor (TOTP) de Enrolamiento Obligatorio

**Referencia:** Mandato de la Dirección de Seguridad — modalidad "(Enrolamiento Obligatorio al Registro)"
**Fecha de esta respuesta:** 21/10/2026
**Aplicación:** SIMSR — `simsr.udea.edu.co` (servidor `172.23.0.97`)
**Responsable técnico:** fma
**Commit desplegado:** `ad3c5b2` (rama `migracion`)

---

## 1. Resumen ejecutivo

Se implementó y desplegó en producción el **enrolamiento obligatorio de doble factor (TOTP)** exigido por el mandato de la Dirección de Seguridad. A partir de este despliegue, **ningún usuario obtiene sesión (accessToken / refreshToken) hasta que haya escaneado el código QR y validado su primer código TOTP**. Esto aplica tanto a **cuentas nuevas (registro)** como a **cuentas antiguas que aún no tenían el 2FA activo** (se fuerzan al alta guiada en su próximo inicio de sesión), que es exactamente el alcance de la modalidad solicitada.

La verificación se realizó end-to-end contra el entorno de producción (a través de Nginx, el mismo camino que usa un visitante real), con 11 comprobaciones funcionales y de seguridad, todas con resultado esperado.

---

## 2. Requerimiento

Adoptar la modalidad **"(Enrolamiento Obligatorio al Registro)"**: el usuario debe completar el alta del doble factor — escanear el QR y validar el primer código — **antes** de acceder al sistema, sin posibilidad de omitir el paso.

---

## 3. Solución aplicada

### 3.1 Política configurable, obligatoria por defecto

Se introdujo la política `TWO_FACTOR_REQUIRED` (variable de entorno), activada en `.env.production`:

```
TWO_FACTOR_REQUIRED=true
TWO_FACTOR_PENDING_EXPIRATION=300        # 5 min: código en login
TWO_FACTOR_ENROLLMENT_EXPIRATION=900     # 15 min: ventana para escanear el QR
TWO_FACTOR_MAX_ATTEMPTS=5
TWO_FACTOR_LOCK_MINUTES=10
TWO_FACTOR_EXEMPT_USERS=                 # cuentas de rescate (vacío en operación normal)
```

- `true` ⇒ modalidad de **enrolamiento obligatorio** (estado de producción).
- `false` ⇒ comportamiento anterior (2FA opcional), disponible como **plan de reversión inmediata** sin tocar código.

### 3.2 El registro deja de emitir sesión

En `POST /api/auth/signup`, cuando la política aplica, la cuenta se crea **sin** `accessToken`/`refreshToken`. En su lugar se emite una cookie efímera `pending2fa` (con propósito `enroll`) y la respuesta indica `requiresTwoFactorEnrollment: true`. El frontend entra al asistente de alta (QR + primer TOTP).

### 3.3 El login fuerza el alta a cuentas antiguas sin 2FA

En `POST /api/auth/login`, tras validar usuario + contraseña:

- Si el usuario **ya tiene** 2FA ⇒ se pide el código (`requiresTwoFactor: true`).
- Si el usuario **no tiene** 2FA y la política es obligatoria ⇒ se emite la cookie de enrolamiento (`requiresTwoFactorEnrollment: true`) y **no se emite sesión**.

### 3.4 Nuevos endpoints de enrolamiento

| Método y ruta | Uso |
|---|---|
| `POST /api/auth/2fa/enroll/setup` | Genera secreto TOTP + `otpauthUri` (QR) + códigos de respaldo. Requiere cookie `pending2fa` de propósito `enroll`. |
| `POST /api/auth/2fa/enroll/complete` | Valida el primer TOTP; **solo entonces** activa el 2FA y emite la sesión completa. |

### 3.5 Separación de flujos por "propósito" del token

El token efímero `pending2fa` ahora lleva un claim `purpose`:

- `enroll` — usuario aún sin 2FA (alta obligatoria). TTL 15 min (tiempo para escanear).
- `verify` — usuario con 2FA que debe introducir su código en el login. TTL 5 min.

Un token emitido para un flujo **no** puede usarse en el otro (verificado en pruebas): esto elimina el riesgo de saltarse el alta.

### 3.6 Defensa en profundidad

Aunque la política se active sobre una base de datos con sesiones ya emitidas, `verifyToken` y `refreshToken` ahora **rechazan y limpian** cualquier sesión cuyo usuario todavía no haya enrolado:

- `GET /api/auth/verify` → `401`
- `POST /api/auth/refresh` → `403`

Así, ninguna sesión previa puede renovarse indefinidamente sin 2FA.

### 3.7 El 2FA no puede desactivarse

Con la política obligatoria, `POST /api/auth/2fa/disable` responde `403` salvo para las cuentas de rescate. El módulo **Seguridad** del frontend muestra el aviso de política y oculta el formulario de desactivación.

### 3.8 Experiencia de usuario

El asistente de enrolamiento se integró en el diálogo de autenticación real (`AuthDialogComponent`): muestra el QR, el secreto para carga manual, los códigos de respaldo (una sola vez) y el campo del primer código. Se conserva el lenguaje visual del sistema. El mensaje es explícito: *"Este paso no se puede omitir. Sin el código de tu autenticador no se emitirá la sesión."*

---

## 4. Evidencia — Verificación en producción (21/10/2026)

Todas las pruebas se ejecutaron contra `https://localhost` desde el propio servidor (a través de Nginx), con una cuenta de prueba creada y eliminada al final. El TOTP se generó con el propio secreto devuelto por `enroll/setup`.

### 4.1 Registro — sin sesión, con cookie de enrolamiento

```
POST /api/auth/signup
HTTP 200
{"success":true,"message":"Debes configurar el doble factor antes de acceder al sistema",
 "data":{"requiresTwoFactorEnrollment":true,"twoFactorRequired":true,"expiresIn":900,
 "user":{"id":"…","username":"2fatest…","email":"…","fullName":"Prueba 2FA"}}}

cookies tras signup: NO hay accessToken ni refreshToken   ✅
cookie pending2fa:   presente                              ✅
```

### 4.2 Login de cuenta sin 2FA — se fuerza el alta

```
POST /api/auth/login
HTTP 200 → {"data":{"requiresTwoFactorEnrollment":true,"twoFactorRequired":true,…}}
cookies de sesión: ninguna                                ✅
```

### 4.3 `enroll/setup` — QR, secreto y códigos de respaldo

```
POST /api/auth/2fa/enroll/setup
HTTP 200
{"data":{"secret":"JV5WQZCDPJ6WMI2HIBHCSKTFGUXGMV2J",
         "otpauthUri":"otpauth://totp/SIMR:…?secret=…&issuer=SIMR&algorithm=SHA1&digits=6&period=30",
         "backupCodes":["535E6B7B38", … 10 en total],
         "backupCodesShownOnce":true,"twoFactorRequired":true}}
```

### 4.4 Código inválido → rechazado

```
POST /api/auth/2fa/enroll/complete  {"code":"012345"}
HTTP 401 → {"success":false,"message":"El código ingresado es incorrecto"}   ✅
```

### 4.5 Primer código válido → se activa el 2FA y se emite la sesión

```
POST /api/auth/2fa/enroll/complete  {"code":"<TOTP válido>"}
HTTP 200
{"success":true,"message":"Doble factor configurado correctamente. Sesión iniciada.",
 "data":{"user":{…,"twoFactorEnabled":true},"tokenInfo":{"expiresIn":900}}}
cookies: accessToken + refreshToken presentes             ✅
```

### 4.6 Login posterior — pide el código

```
POST /api/auth/login
HTTP 200 → {"data":{"requiresTwoFactor":true,…}}          ✅
```

### 4.7 Estado del 2FA

```
GET /api/auth/2fa/status  (con sesión)
HTTP 200 → {"data":{"twoFactorEnabled":true,"twoFactorRequired":true,"policy":"required","exempt":false}}   ✅
```

### 4.8 Desactivación bloqueada por política

```
POST /api/auth/2fa/disable  {"code":"<TOTP válido>"}
HTTP 403 → {"message":"El doble factor es obligatorio y no puede desactivarse. …"}   ✅
```

### 4.9 Defensa en profundidad (sesión previa sin enrolar)

Simulando una sesión emitida antes de la política (2FA desactivado en BD, cookie de sesión válida):

```
POST /api/auth/refresh → HTTP 403 "Debes configurar el doble factor antes de continuar"   ✅
GET  /api/auth/verify  → HTTP 401 "Debes configurar el doble factor antes de continuar"   ✅
```

### 4.10 Separación de propósitos del token

```
Cookie pending2fa de propósito "enroll":
  POST /api/auth/2fa/verify          → HTTP 401 "La sesión de doble factor no es válida para esta operación"   ✅
  POST /api/auth/2fa/enroll/setup    → HTTP 200 (funciona)                                                     ✅
```

### 4.11 Frontend desplegado

```
Bundle servido: main-JU7VPXPU.js
  contiene "Configura tu doble factor" (asistente de enrolamiento)   ✅
  el chunk de autenticación contiene la ruta "enroll"               ✅
```

---

## 5. Notas operativas

### 5.1 Cuenta de rescate (break-glass)

`TWO_FACTOR_EXEMPT_USERS` (lista separada por comas de usuario o correo) permite mantener una o más cuentas **exentas** de la obligación. Sirve para no quedar sin acceso administrativo si se pierde el autenticador de todas las cuentas. **Está vacío en operación normal.** Si se habilita una cuenta de rescate, se recomienda que sea una cuenta técnica con contraseña fuerte custodiada, no un usuario cotidiano.

### 5.2 Recuperación de usuarios que pierden su autenticador

1. Un código de **respaldo** (de los 10 entregados en el alta) permite entrar una vez; al usarlo queda consumido.
2. Si el usuario perdió el dispositivo **y** los códigos, el administrador puede restablecer el segundo factor directamente en la base de datos (poner `twoFactor.enabled=false`), tras lo cual el usuario será forzado de nuevo al alta guiada en su siguiente login. No hay ruta de autoservicio que desactive el 2FA, por diseño del mandato.

### 5.3 Reversión

Cambiar `TWO_FACTOR_REQUIRED=false` en `.env.production` y reiniciar `simr-back` devuelve el sistema al modo opcional **sin cambiar código**. No se recomienda en producción mientras el mandato esté vigente.

### 5.4 Compatibilidad

- La API de autenticación sigue siendo anónima en `signup`/`login`/`enroll/*` (como corresponde).
- `POST /api/auth/2fa/setup` y `/enable` (flujo autenticado previo) se conservan para el alta desde el módulo **Seguridad** cuando la política estuviera en modo opcional.
- No se modificó la lógica de negocio de los módulos; el cambio está acotado a autenticación y al diálogo de login.

---

## 6. Alcance y transparencia

- El cambio es **mínimo y reversible**, acotado a `simr-back` (autenticación) y a `simr-front` (diálogo de acceso y módulo Seguridad).
- Se aplicó **defensa en profundidad** (guards en `verify`/`refresh`) para cubrir el caso de sesiones ya emitidas al momento de activar la política.
- El secreto TOTP y los códigos de respaldo **solo se muestran una vez**; los códigos de respaldo se almacenan únicamente como hash SHA-256.
- Se levantó evidencia funcional completa sobre producción, disponible en este documento.

---

## 7. Solicitud a Seguridad TI

Con el enrolamiento obligatorio desplegado y verificado (secciones 4.1 a 4.11), **se solicita la validación de cierre del ticket** en la modalidad "(Enrolamiento Obligatorio al Registro)". Quedamos atentos a:

- Confirmación de si se desea habilitar una cuenta de rescate institucional y cuál debe ser.
- Cualquier ajuste al tiempo de bloqueo o al número de intentos fallidos.
- Requerimientos adicionales de evidencia o de auditoría de los eventos `two_factor_enrolled`.

---

## 8. Addendum — 17/11/2026: corrección de la transición visual del asistente

### 8.1 Síntoma reportado

En la verificación funcional por interfaz web, al registrar una cuenta nueva:

- `POST /api/auth/signup` respondía `201`.
- Se disparaba automáticamente `POST /api/auth/2fa/enroll/setup` con `200`.
- **Pero el diálogo no pasaba a la vista del QR**: quedaba en la pestaña de registro con el botón en "Registrando…". Sin excepciones en consola.

### 8.2 Causa raíz

La aplicación corre sobre **Angular 21 en modo *zoneless*** (sin `NgZone`). En este modo, una respuesta HTTP **no dispara detección de cambios** por sí sola; solo la disparan eventos de plantilla, signals o llamadas explícitas a `ChangeDetectorRef`.

`AuthDialogComponent` mantenía su estado en **campos planos** (`showEnrollment`, `isLoading`, `showOtp`, `errorMessage`, etc.) y difería las mutaciones con `Promise.resolve().then(...)` (patrón heredado de la era con Zone). El estado sí cambiaba y por eso la petición de `enroll/setup` salía, pero la vista nunca se volvía a pintar: de ahí el "Registrando…" indefinido.

El mismo defecto afectaba, de forma silenciosa, al **paso OTP del login** (`showOtp`) y a los mensajes de error asíncronos.

### 8.3 Corrección aplicada

En `simr-front/src/app/shared/auth-dialog/auth-dialog.component.ts`:

- Se inyecta `ChangeDetectorRef` y se agrega un helper `refreshView()` que ejecuta `detectChanges()` (con guarda de vista destruida vía `ngOnDestroy`).
- Se invoca tras **cada** mutación asíncrona: respuesta de login (OTP y enrolamiento), errores, `enroll/setup` (éxito y error), `enroll/complete` (error) y `backToLogin()`.
- No se cambió la lógica de negocio ni el contrato con el backend.

Commit desplegado: **`155d307`** — `fix(auth): refrescar la vista del dialogo tras respuestas async`.

### 8.4 Evidencia en navegador real (Chrome headless contra `https://172.23.0.97/`)

**Registro + enrolamiento completo:**

```
POST /api/auth/signup                → 201
POST /api/auth/2fa/enroll/setup      → 200
DOM: hasEnroll=true, hasQr=true, hasTabs=false
     "Configura tu doble factor" + QR + secreto + códigos de respaldo visibles
POST /api/auth/2fa/enroll/complete   → 200  (código TOTP válido)
DOM: diálogo cerrado, menú de usuario = "UI Test" (sesión iniciada)
```

**Login posterior con 2FA:**

```
POST /api/auth/login                 → 200 (requiresTwoFactor)
DOM: .auth-otp visible ("Verificación en dos pasos")
POST /api/auth/2fa/verify            → 200 (código TOTP válido)
DOM: diálogo cerrado, menú de usuario = "UI Test" (sesión iniciada)
```

Los usuarios de prueba usados (`uitest*`) fueron eliminados de la base de datos al finalizar.


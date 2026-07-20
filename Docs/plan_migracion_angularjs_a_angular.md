# Plan de Migración de AngularJS a Angular (SIMR-UdeA)

> **Estado:** Plan de diseño. No ejecutar todavía — este documento es la referencia que se seguirá módulo por módulo cuando se autorice la ejecución.
> **Última actualización:** 2026-07-19

## 1. Resumen del proyecto

SIMR tiene hoy dos frontends que conviven sobre el mismo backend (`simr-back`, Express + MongoDB):

- **Legacy**: AngularJS 1.8.2 (EOL) servido como estáticos desde `simr-back/public/`, con 23 carpetas de módulo (25 módulos registrados en `public/application.js`).
- **Nuevo**: Angular 20 en `simr-front/`. **Importante:** el código actual en `simr-front` (`auth`, `actores`, `diccionarios`, `idiomas`, `dashboard`, `home`) es un **ensayo/prototipo**, NO una migración fiel. Las vistas son nuevas, con otra apariencia y otro comportamiento, y no garantizan la misma experiencia que el legacy. **No se reutilizarán como base:** todas las vistas deberán migrarse replicando exactamente la apariencia (clases Bootstrap 3 del `styles.css` legacy, menú shell embebido vía `ng-include`) y el funcionamiento (lógica de los controladores AngularJS) del legacy. **Excepciones que SÍ se conservan en `simr-front`:**
- La parte que gestiona el CRUD de archivos con MinIO (subida/descarga/listado/previsualización en `features/archivos`, a la que el legacy ya delega vía popup + `postMessage`), ya que implementa correctamente la integración con el backend `/files`.
- El sistema de **login y registro** (auth), cuya lógica ya funciona; solo falta adecuar su **apariencia** para que coincida con el legacy. No se reescribe desde cero, se ajusta visualmente.

Todo lo demás (vistas de módulos CRUD, shell/menú, admin, auditoria, listas, search, graph, dashboard, home) se rehace fiel al legacy.

Objetivo del plan: migrar **todas** las vistas y módulos de AngularJS a Angular **replicando fielmente** apariencia y comportamiento, sin romper la gestión de archivos vía MinIO ni el módulo de visualización de grafos (D3), probando cada módulo antes de avanzar al siguiente, y terminar **eliminando AngularJS y toda su estructura** (carpeta `public/`, shims, rutas legacy, guard `legacyShellGuard`, dependencias vestigiales) reorganizando el proyecto para que `simr-front` sea la única SPA.

**Principio rector: Strangler Fig / convivencia incremental.** Ambas SPAs siguen activas y comunicándose durante toda la migración (como ya ocurre con el puente popup + `postMessage` + `localStorage` para archivos). Cada módulo migrado deja de servirse desde `public/` (o se redirige) y pasa a ser responsabilidad exclusiva de `simr-front`.

**Regla de progreso:** ningún módulo se marca como "migrado/aprobado" sin (a) paridad visual **lado a lado** contra el legacy, (b) paridad funcional verificada manualmente y (c) suite de pruebas automatizadas en verde. No se inicia el siguiente módulo sin cerrar el anterior.

**Decisión clave (2026-07-19):** el contenido preexistente en `simr-front` (actores/diccionarios/idiomas/archivos/auth) se trata como **borrador descartable**. La migración consiste en **re-crear** cada vista en Angular copiando fielmente el HTML y la lógica del legacy, no en adaptar esos ensayos.

---

## 2. Inventario y estado de partida

### 2.1 Módulos legacy (`simr-back/public/`)

> **Leyenda de estado:**
> - ✅ **Migrado y aprobado**: vista re-creada fiel al legacy (misma apariencia + comportamiento) + pruebas en verde + revisión visual lado a lado.
> - 🟢 **Conservar (ya válido)**: código existente en `simr-front` que SÍ se reutiliza (gestión de archivos MinIO; login/registro, solo ajuste visual).
> - 🟡 **Reutilizable con ajuste visual**: lógica válida pero apariencia distinta al legacy; hay que adecuar el look (ej. auth/login/signup).
> - ❌ **Pendiente (rehacer desde legacy)**: sin presencia válida en `simr-front`, o con código de ensayo/prototipo que NO se reutilizará.
>
> **Nota crítica:** casi todo lo que hoy existe en `simr-front` (actores, diccionarios, idiomas, dashboard, home) es **ensayo**, no migración fiel, y se rehace copiando el HTML y la lógica del legacy. Se conservan: gestión de archivos MinIO (`features/archivos`) y el sistema de login/registro (ajuste visual solamente). Por tanto **la mayoría de los módulos están pendientes**.

| # | Módulo | Tipo | CRUD completo | Usa `<archivo-manager>` (MinIO) | Estado en `simr-front` |
|---|---|---|---|---|---|
| 1 | `authentication` | Auth | — | No | 🟡 Reutilizable (login/registro), ajustar apariencia al legacy |
| 2 | `core` | Shell/menú/guard | — | No | ❌ Ensayo no válido → rehacer (menú shell embebido vía `ng-include`) |
| 3 | `admin` | Gestión roles/usuarios | No (forms propios) | No | ❌ Pendiente |
| 4 | `auditoria` | Solo lectura | No (list) | No | ❌ Pendiente |
| 5 | `listas` | Datos de referencia transversales | No (list) | No | ❌ Pendiente (bloqueante para el resto) |
| 6 | `diccionarios` | CRUD | ✅ | No | ❌ Ensayo no válido → rehacer |
| 7 | `idiomas` | CRUD | ✅ | No | ❌ Ensayo no válido → rehacer |
| 8 | `materias` | CRUD | ✅ | Sí | ❌ Pendiente |
| 9 | `medios` | CRUD | ✅ | Sí | ❌ Pendiente |
| 10 | `sistemas` | CRUD | ✅ | Sí | ❌ Pendiente |
| 11 | `instrumentos` | CRUD | ✅ | Sí | ❌ Pendiente |
| 12 | `generos` | CRUD | ✅ | Sí | ❌ Pendiente |
| 13 | `generosnomusicales` | CRUD | ✅ | Sí | ❌ Pendiente |
| 14 | `fondos` | CRUD | ✅ | No | ❌ Pendiente |
| 15 | `colecciones` | CRUD | ✅ | No | ❌ Pendiente |
| 16 | `ejemplares` | CRUD | ✅ | No | ❌ Pendiente |
| 17 | `recursos` | CRUD | ✅ | Sí | ❌ Pendiente |
| 18 | `proyectos` | CRUD | ✅ | Sí | ❌ Pendiente |
| 19 | `actores` | CRUD | ✅ | Sí | ❌ Ensayo no válido → rehacer |
| 20 | `obras` | CRUD (el más complejo) | ✅ | Sí | ❌ Pendiente (última pieza CRUD) |
| 21 | `archivos` | Directiva embebida MinIO | — | (es el proveedor) | 🟢 Conservar (gestión MinIO ya válida en `features/archivos`) |
| 22 | `search` | Buscador global | — | No | ❌ Pendiente |
| 23 | `graph` | Visualización D3 | — | No | ❌ Pendiente (sin librería elegida en Angular) |

**Total a migrar:** los 23 módulos del legacy, todos desde cero replicando fielmente el legacy. Lo existente en `simr-front` se descarta como base.

### 2.2 Puntos de riesgo ya identificados

- **`obras`**: 8+ tipos de relaciones N:M con metadatos por elemento (actores+rol, contenedores, asientos ligados, denominaciones regionales, anotaciones cartográfico-temporales, descriptores, enlaces). Migrar de último entre los CRUD, cuando el patrón de "editor de relaciones" ya esté maduro y reutilizado en módulos más simples.
- **Gestión de archivos (MinIO)**: hoy el legacy delega subida/listado a `simr-front` vía popup + `postMessage` + polling de `localStorage` (`archivos.client.service.js`). Esto debe simplificarse en cada módulo migrado (llamada directa al servicio Angular, sin popups) y eliminarse por completo al final.
- **`graph`**: no existe aún decisión de librería en Angular. Bloquea su propia fase.
- **`listas`**: es consumida por casi todos los formularios (`Listas.query()`); migrar temprano como servicio transversal de datos de referencia (Angular ya tiene precedente en `shared/reference-data/`).
- **Autenticación**: pequeña discrepancia de tiempo de refresh (60s legacy vs 120s Angular). Unificar antes de apagar el legacy para evitar sesiones inconsistentes durante la convivencia.
- **CORS / Nginx**: la configuración actual permite ambos orígenes (`:3000` legacy, `:4200` Angular) simultáneamente; no tocar hasta la Fase 6 (retiro).

---

## 3. Principios y convenciones a aplicar en cada módulo migrado

1. **Replicación fiel 1:1 del legacy.** Cada vista migrada debe copiar el HTML y la lógica del controlador AngularJS correspondiente (mismas clases CSS Bootstrap 3 del `styles.css` legacy, mismo menú shell embebido, mismo comportamiento de botones/tablas/formularios). No se "reinventa" la UI con componentes nuevos. `features/<modulo>/{components,services,models}` como estructura de carpetas.
2. **Componentes CRUD estándar por módulo**: `<modulo>-list`, `<modulo>-create`, `<modulo>-edit`, `<modulo>-detail` replicando las 4 vistas del legacy (`list-*.client.view.html`, `create-*.client.view.html`, `edit-*.client.view.html`, `view-*.client.view.html`).
3. **Servicio HTTP dedicado** `<modulo>.service.ts` que reemplace 1:1 al factory `$resource` legacy, consumiendo los mismos endpoints `/api/<modulo>` (sin tocar el backend salvo necesidades puntuales documentadas).
4. **Rutas**: lazy-loaded vía `loadChildren`, protegidas con `AuthGuard`/`RoleGuard` replicando el `permission`/`resource` que hoy está declarado en `*.client.routes.js` del legacy.
5. **Gestión de archivos adjuntos (conservar lo existente):** la integración MinIO en `simr-front/features/archivos` **ya es válida y se reutiliza**. Cada módulo que use `<archivo-manager>` en el legacy debe integrar ese componente/servicio **directamente** (sin popups), pasando `documentId`, `dbCollection` y `templateType` equivalentes. No se reescribe la gestión de archivos.
6. **Listas de referencia**: consumir el servicio de `listas` migrado (Fase Core) en vez de duplicar `Listas.query()`.
7. **Manejo de errores y notificaciones**: usar `NotificationService`/`SweetAlertService` ya existentes en `core/services` (paridad con SweetAlert2 del legacy).
8. **Pruebas obligatorias por módulo** (ver sección 8): specs de servicio + specs de cada componente + al menos un test e2e de flujo CRUD completo.
9. **Fidelidad visual obligatoria (paridad de apariencia).** No basta con que el módulo funcione: debe **verse exactamente igual que el legacy**. Para lograrlo se parte de `simr-back/public/styles.css` importado en el build de `simr-front` (Fase 0.8). En cada módulo migrado se exige una **revisión visual lado a lado** (legacy servido en `:3000` / estáticos vs Angular en `:4200`) comparando: layout de formularios, tablas/listados, botones, diálogos (SweetAlert2), componentes de archivos, colores y tipografía. El módulo NO se aprueba sin esta verificación documentada (capturas comparativas en el checklist). Los módulos 🟡 preexistentes deben someterse a esta misma revisión antes de considerarse aprobados.
10. **No modificar el backend** salvo que se detecte una incompatibilidad real; si se requiere, documentarla explícitamente en el PR/commit del módulo.
11. **Feature flag de corte por módulo**: mientras un módulo esté en migración, el legacy sigue siendo la fuente de verdad para ese módulo; al cerrar la fase de ese módulo, se deshabilita su ruta en `public/application.js` (comentar el módulo en el array, no borrar aún) y se redirige `#!/<modulo>` hacia `/**` (Angular) desde el shell legacy o desde Nginx. El borrado físico del código legacy ocurre solo en la Fase 6.

---

## 4. Fases del proyecto

---

### **Fase 0 — Preparación y línea base**

- [ ] **0.1. Congelar alcance funcional del legacy.** Acordar con el equipo que no se agregarán features nuevas a `public/` durante la migración (solo bugfixes críticos).
- [ ] **0.2. Inventario de endpoints backend por módulo.** Confirmar que cada endpoint `/api/<modulo>` usado por el legacy está documentado (usar `app/routes/*.server.routes.js` como fuente) y que `simr-front` puede consumirlos sin cambios.
- [ ] **0.3. Unificar configuración de refresh de token.** Igualar el intervalo de refresh (60s vs 120s) entre `authentication.client.service.js` (legacy) y `auth.service.ts` (Angular), dejando ambos en el mismo valor mientras coexistan.
- [ ] **0.4. Definir convención de pruebas e2e.** Elegir herramienta (Cypress o Playwright) para pruebas end-to-end contra la app Angular + backend real/staging con MinIO de pruebas. Documentar comandos (`npm run e2e`) en `simr-front/package.json`.
- [ ] **0.5. Preparar entorno de staging con datos de prueba** (Mongo + MinIO) reproducible (seed scripts) para poder repetir pruebas de cada módulo sin afectar producción.
- [ ] **0.6. Tablero de seguimiento.** Crear un tablero/checklist (puede ser este mismo archivo) con una fila por módulo y su estado: `Pendiente / En progreso / Migrado (con pruebas) / Legacy desactivado`.
- [ ] **0.7. Backup/tag de versión previa.** Etiquetar el repo (`git tag pre-migracion-angular`) antes de iniciar cambios, para poder comparar/revertir con facilidad.
- [ ] **0.8. Importar y unificar estilos del legacy (fidelidad visual).** Incorporar `simr-back/public/styles.css` (y `stylesold.css` si aplica) al build de `simr-front` (ej. importarlo desde `src/styles.css` o `angular.json` `styles`), conservando el look & feel del legacy. Esto es obligatorio: cada módulo migrado debe **verse idéntico** al legacy, no solo funcionar. Documentar en el checklist de cada módulo una verificación visual lado a lado (legacy vs Angular) con capturas de pantalla comparativas.
- [ ] **0.9. Criterio de aceptación de apariencia.** Definir qué significa "igual": mismos colores, tipografía, disposición de formularios, tablas, botones, diálogos (SweetAlert2 ya presente en ambos) y componentes de archivos. Los módulos 🟡 existentes (authentication, diccionarios, idiomas, actores, archivos) deben someterse a esta revisión antes de marcarse como aprobados.

---

### **Fase 1 — Módulo Core / Shell / transversales**

Objetivo: que Angular tenga el shell de navegación (menú principal), guards de permisos equivalentes al `$routeChangeStart` legacy, y los servicios transversales (`listas`, `search`, `admin`, `auditoria`) antes de migrar los CRUD de negocio, ya que todos dependen de ellos.

- [ ] **1.1. Shell y menú principal en Angular.**
  - [ ] Construir `AppLayoutComponent` (o similar) con el menú de navegación que replique la estructura de módulos del legacy (`public/core/views/core.client.view.html`).
  - [ ] Aplicar permisos por ítem de menú usando `RoleGuard`/servicio de permisos ya existente (paridad con `Authorization.requirePermission()` legacy).
- [ ] **1.2. Servicio de `listas` (datos de referencia).**
  - [ ] Crear `features/listas` (o extender `shared/reference-data/`) con servicio que consuma `GET /api/listas` y `GET /api/listas/:nombre_lista`.
  - [ ] Vista de administración de listas (create/edit/delete) restringida a roles `admin`/`bibliotecólogo`, replicando `list-listas.client.view.html`.
  - [ ] Pruebas: spec de servicio + spec de componente de administración.
- [ ] **1.3. Módulo `search` (buscador global).**
  - [ ] Componente de búsqueda global consumiendo el mismo endpoint que `search.client.view.html`.
  - [ ] Pruebas: spec de componente + caso e2e de búsqueda con resultado y sin resultado.
- [ ] **1.4. Módulo `admin` (roles y usuarios).**
  - [ ] Migrar las 4 vistas (`roles-form`, `roles-lista`, `usuarios-form`, `usuarios-lista`) a componentes Angular con sus servicios.
  - [ ] Pruebas: specs de servicios + specs de componentes + e2e de asignación de rol.
- [ ] **1.5. Módulo `auditoria` (solo lectura).**
  - [ ] Componente de listado con filtros equivalentes a `auditoria-lista.client.view.html`.
  - [ ] Pruebas: spec de componente + e2e de filtro/paginación.
- [ ] **1.6. Validación integral de Fase 1.**
  - [ ] Verificar que el menú Angular permite navegar a todos los módulos aún no migrados vía redirección al legacy (para no romper acceso durante la transición).
  - [ ] Ejecutar suite completa (`ng test`) y checklist manual de smoke test de shell/login/logout/permisos.
- [ ] **Checkpoint de cierre de fase:** no continuar a Fase 2 sin que 1.1–1.5 tengan pruebas en verde y validación manual documentada.

---

### **Fase 2 — Consolidación de gestión de archivos (MinIO)**

Objetivo: dejar un único componente/servicio Angular de gestión de archivos, listo para ser reutilizado sin popups por cada módulo CRUD que se migre después.

- [ ] **2.1. Auditar `features/archivos` actual** (`archivo-lista`, `archivo-subida`, `archivo-vista`, `archivos.service.ts`) contra los endpoints reales de `config/minio.js` (`/files/document-files`, `/files/upload`, `/files/`, `/files/download/:filename`, `/files/:fileName`, `/files/delete-multiple`, `/files/view/:filename`).
- [ ] **2.2. Completar cobertura de endpoints faltantes** en `archivos.service.ts` (batch delete, previsualización con streaming/Range para audio-video si no está implementada).
- [ ] **2.3. Crear componente reutilizable `ArchivoManagerComponent`** (equivalente Angular de la directiva `<archivo-manager>`), parametrizado con `templateType`, `documentId`, `dbCollection`, `documentName`, que pueda incrustarse en create/edit/detail de cualquier módulo.
- [ ] **2.4. Eliminar el puente popup/postMessage/localStorage** solo para los módulos que ya estén migrados a Angular en ese momento (mientras el legacy siga sirviendo un módulo, ese módulo sigue usando el puente).
- [ ] **2.5. Pruebas del componente reutilizable.**
  - [ ] Specs unitarios: subida exitosa, error de subida, listado, descarga, previsualización, borrado individual y batch.
  - [ ] E2E: subir archivo real a bucket de pruebas MinIO, verificar aparición en listado, descarga y borrado, para al menos 2 tipos de documento distintos (ej. `obras` y `actores` cuando estén disponibles, o con datos mock si aún no migrados).
- [ ] **Checkpoint de cierre de fase:** `ArchivoManagerComponent` documentado y probado; queda listo para "enchufarse" en cada módulo de la Fase 3.

---

### **Fase 3 — Migración de módulos CRUD (uno a la vez)**

**Orden de migración** (de menor a mayor complejidad relacional, aprovechando aprendizaje incremental):

1. `materias`
2. `medios`
3. `sistemas`
4. `instrumentos`
5. `generos`
6. `generosnomusicales`
7. `fondos`
8. `colecciones`
9. `ejemplares`
10. `idiomas` y `diccionarios` → **completar specs faltantes** (ya migrados funcionalmente, pendiente de pruebas)
11. `recursos`
12. `proyectos`
13. `actores` → **completar cualquier gap** (endurecer con la gestión de archivos consolidada de la Fase 2, si aún usaba puente)
14. `obras` (último, el más complejo)

> Nota: los módulos 10 y 13 ya tienen implementación funcional; en este plan se tratan como "cerrar deuda de pruebas + reconectar gestión de archivos consolidada", no como migración desde cero.

#### 3.A Plantilla reutilizable por módulo (repetir para cada uno de la lista anterior)

- [ ] **3.X.1. Análisis del módulo legacy.**
  - [ ] Leer `public/<modulo>/controllers/<modulo>.client.controller.js`, `services/<modulo>.client.service.js`, `config/<modulo>.client.routes.js` y las 4 vistas.
  - [ ] Documentar campos del formulario, validaciones, relaciones con otras entidades (`Listas`, otros módulos), y si usa `<archivo-manager>`.
- [ ] **3.X.2. Modelo TypeScript.** Crear `models/<modulo>.model.ts` con la interfaz que refleje el esquema Mongoose (`app/models/<modulo>.server.model.js`).
- [ ] **3.X.3. Servicio Angular.** Crear `<modulo>.service.ts` con métodos `list`, `getById`, `create`, `update`, `delete` contra `/api/<modulo>`; replicar cualquier lógica de ownership (`canUpdate`/`canDelete`) usando el servicio de permisos ya existente.
- [ ] **3.X.4. Componentes.**
  - [ ] `<modulo>-list`: tabla/listado con filtros y permisos (mostrar/ocultar botones según rol/ownership).
  - [ ] `<modulo>-create` / `<modulo>-edit`: formulario reactivo (Angular Reactive Forms) con las mismas validaciones que el legacy; integrar `ArchivoManagerComponent` si aplica.
  - [ ] `<modulo>-detail`: vista de solo lectura con relaciones y archivos adjuntos.
- [ ] **3.X.5. Rutas y guards.** Registrar rutas lazy con `AuthGuard`/`RoleGuard` replicando permisos declarados en `<modulo>.client.routes.js`.
- [ ] **3.X.6. Integración de listas de referencia.** Reemplazar cualquier `Listas.query()` legacy por el servicio de listas de la Fase 1.
- [ ] **3.X.7. Pruebas automatizadas del módulo** (ver sección 8 para detalle del estándar):
  - [ ] Specs del servicio (mock de `HttpClient`, todos los métodos CRUD, casos de error).
  - [ ] Specs de cada componente (list/create/edit/detail): renderizado, validaciones de formulario, permisos, interacción con `ArchivoManagerComponent` si aplica.
  - [ ] Spec de guard/ruta si tiene lógica de permisos particular.
  - [ ] E2E de flujo completo: crear → ver en listado → ver detalle → editar → (si aplica) adjuntar/eliminar archivo → eliminar registro.
- [ ] **3.X.8. Validación manual de paridad funcional + visual.**
  - [ ] **Funcional:** comparar lado a lado legacy vs Angular con el mismo dato de prueba (campos, validaciones, mensajes de error, comportamiento de permisos por rol).
  - [ ] **Visual (OBLIGATORIA):** revisión lado a lado con `simr-back/public/styles.css` ya importado en `simr-front` (Fase 0.8). Comparar capturas de: layout de formularios (create/edit), tabla/listado, vista de detalle, diálogos SweetAlert2, y el componente de archivos si aplica. El resultado debe ser **idéntico** al legacy en colores, tipografía, espaciado y disposición. Registrar las capturas comparativas en el checklist del módulo.
- [ ] **3.X.9. Corte del módulo en el legacy.**
  - [ ] Comentar el módulo en `public/application.js` (no borrar aún) o redirigir sus rutas hash hacia la ruta Angular equivalente desde el shell legacy.
  - [ ] Verificar que ningún otro módulo legacy todavía activo dependa de servicios de este módulo (ej. `obras` referenciando `Actores`, `Generos`, etc. — mientras `obras` no esté migrado, sus dependencias legacy deben seguir existiendo aunque el módulo ya tenga UI Angular propia).
- [ ] **3.X.10. Checkpoint de cierre (gate de aprobación).** El módulo NO se da por aprobado hasta cumplir TODOS: (a) specs en verde, (b) e2e de flujo completo en verde, (c) revisión visual lado a lado documentada en 3.X.8. Solo entonces actualizar el tablero de la Fase 0.6 a `Aprobado (funcional + visual)` y pasar al siguiente módulo.

#### 3.B Consideraciones específicas para `obras` (paso 14)

- [ ] Migrar cada tipo de relación como un sub-componente independiente y testeado por separado antes de integrarlos en el formulario completo:
  - [ ] Actores con rol.
  - [ ] Denominaciones regionales.
  - [ ] Contenedores.
  - [ ] Asientos ligados (tipo/dirección/fuente/proyecto/nota).
  - [ ] Anotaciones cartográfico-temporales.
  - [ ] Descriptores.
  - [ ] Enlaces.
  - [ ] Géneros / géneros no musicales / materias / medios / sistemas / idiomas asociados.
- [ ] Reutilizar el componente de "selector con búsqueda" que ya se haya consolidado en módulos previos (ej. `recursos`, `proyectos`) para las relaciones simples, y crear un componente propio solo para las relaciones con metadatos por elemento.
- [ ] Pruebas: dado el volumen de combinaciones, priorizar specs por sub-componente + un e2e de "camino feliz" completo (creación de una obra con todas las relaciones) + e2e de edición parcial (agregar/quitar un elemento de cada relación).

---

### **Fase 4 — Módulo de visualización de grafos**

- [ ] **4.1. Decisión de librería.** Evaluar D3 puro (mismo enfoque que el legacy, ya usado también en el backend) vs `ngx-graph`/`vis-network`/`cytoscape`. Recomendado: **D3 puro con wrapper Angular** para reutilizar directamente la lógica de `force simulation` ya probada en `graph.client.controller.js`, minimizando riesgo de reescritura de comportamiento.
- [ ] **4.2. Servicio `GraphService`** consumiendo `GET /api/graph/data`, `GET /api/graph/metadata`, `GET /api/graph/stats` (sin cambios de backend).
- [ ] **4.3. Componente `GraphViewComponent`** con renderizado SVG + zoom + drag + tooltip, replicando colores por `entityType` y navegación al hacer click (ahora usando `Router` de Angular en vez de hash `#!/`).
- [ ] **4.4. Pruebas.**
  - [ ] Specs de servicio (mock HTTP de data/metadata/stats).
  - [ ] Specs de componente: render de nodos/links, manejo de datos vacíos, click de navegación.
  - [ ] E2E: cargar grafo con dataset de prueba, verificar cantidad de nodos, hacer click en un nodo y verificar navegación a la entidad correspondiente (solo entidades ya migradas a esa altura del plan).
- [ ] **4.5. Corte del módulo `graph` en el legacy** siguiendo el mismo procedimiento de 3.X.9.
- [ ] **Checkpoint de cierre de fase.**

---

### **Fase 5 — Validación integral de toda la aplicación Angular**

- [ ] **5.1. Regresión completa manual** recorriendo todos los módulos migrados como usuario con distintos roles (admin, bibliotecólogo, lector, etc.).
- [ ] **5.2. Suite completa automatizada.**
  - [ ] `ng test` (todas las specs) en verde, con reporte de cobertura (`karma-coverage`) — definir umbral mínimo (ej. 80% en servicios, 60% en componentes) y documentarlo.
  - [ ] Suite e2e completa (todos los flujos CRUD + archivos + grafo + auth) en verde contra staging.
- [ ] **5.3. Pruebas de carga/no-regresión de MinIO** con archivos de distintos tamaños/tipos (imagen, PDF, audio, video) para confirmar que el streaming con `Range requests` sigue funcionando igual que en el legacy.
- [ ] **5.4. Auditoría de seguridad** (repetir el análisis tipo ZAP que motivó los shims `ngResourceShim`/`ngRouteShim`) para confirmar que ya no hay superficie de AngularJS 1.8.2 expuesta en los módulos migrados.
- [ ] **5.5. Sign-off formal** del equipo/negocio antes de pasar a la Fase 6 (punto de no retorno del legacy).

---

### **Fase 6 — Retiro de AngularJS y reestructuración del proyecto**

- [ ] **6.1. Eliminar bootstrap y módulos legacy.**
  - [ ] Borrar `simr-back/public/<cada módulo migrado>` (todas las carpetas de la tabla 2.1).
  - [ ] Borrar `simr-back/public/application.js`, `public/funcionesGenerales.js`, `public/permissions.js`, `public/listas.js` (ya migrado a BD/servicio), `public/styles.css` / `stylesold.css` si son exclusivos del legacy.
  - [ ] Borrar `public/lib/angular@1.8.2`, `public/lib/shims/` (`resource-shim`, `route-shim`), `public/lib/d3` (vendored, ya no se usa si Angular trae su propia dependencia), `public/lib/ng-dialog`, y cualquier otra librería exclusiva de AngularJS.
  - [ ] Conservar temporalmente (si aún se usan por Angular vía CDN/estático) `bootstrap-css`, `font-awesome`, `jquery`, `sweetalert2` solo si `simr-front` no los trae ya como dependencias npm propias; si ya están en `simr-front/package.json`, eliminarlos también de `public/lib`.
- [ ] **6.2. Eliminar el puente cross-app.**
  - [ ] Borrar el mecanismo popup + `postMessage` + polling de `localStorage` en `archivos.client.service.js` (el archivo completo desaparece con el módulo `archivos` legacy).
  - [ ] Eliminar `redirectToAngularJS()` / `redirectToLegacyApp()` de `auth.service.ts` en `simr-front` (ya no hay a dónde redirigir).
- [ ] **6.3. Backend: limpieza de configuración legacy.**
  - [ ] Eliminar `app/middleware/legacyShellGuard.js` y su uso en `config/express.js` (`app.use(legacyShellGuard, express.static('./public'))`).
  - [ ] Eliminar `express.static('./public')` o redirigir la raíz `/` directamente a la build de `simr-front`.
  - [ ] Revisar `config/express.js` CORS: remover el origen `:3000`/legacy si ya no aplica, dejar solo el origen de producción de Angular (o servir todo desde el mismo origen vía Nginx).
  - [ ] Eliminar dependencia `requirejs` de `simr-back/package.json` si estaba vestigial (confirmar que nada la usa antes de borrar).
  - [ ] Actualizar `nginx.conf` / `nginx.dev.conf` / `nginx.prod.conf` para servir únicamente la build de `simr-front` (eliminar location blocks apuntando a `/public` legacy o al puerto 3000 estático).
- [ ] **6.4. Reestructuración de carpetas del proyecto.**
  - [ ] Decidir y documentar la estructura final (ej.: `simr-back` queda solo como API; `simr-front` es la única SPA; evaluar mover `simr-front/dist` al `public/` de `simr-back` para servir todo desde un solo proceso en producción, si esa era la intención original, o mantener despliegue separado vía Nginx).
  - [ ] Actualizar `Dockerfile`, `Dockerfile.dev`, `Dockerfile.prod`, `dockerfile` (raíz) y `docker-compose` si existen, quitando cualquier paso de build/copiado relacionado con AngularJS.
  - [ ] Actualizar `README.md` y `Docs/ARCHITECTURE.md` para reflejar la nueva arquitectura de un solo frontend.
- [ ] **6.5. Limpieza de scripts y utilidades.**
  - [ ] Revisar `simr-back/scripts/*` por referencias a AngularJS o a `public/listas.js` ya migrado, eliminando o actualizando lo que corresponda.
- [ ] **6.6. Regresión final post-limpieza.**
  - [ ] Ejecutar toda la suite de pruebas (unit + e2e) contra el proyecto ya limpio.
  - [ ] Smoke test manual de despliegue completo (build de producción, Docker, Nginx) para confirmar que no quedaron referencias rotas a `/public` o rutas hash `#!/`.
- [ ] **6.7. Actualizar `Docs/HTTPS_DEPLOYMENT_PLAN.md` y demás documentación de despliegue** para eliminar menciones a la convivencia de dos frontends.
- [ ] **Checkpoint final:** merge/tag `post-migracion-angular` y comunicación de cierre del proyecto.

---

## 5. Estrategia de pruebas automatizadas

**Stack de pruebas:**
- Unitarias/integración de componentes y servicios: **Jasmine + Karma** (estándar ya usado en `simr-front`, no introducir Jest).
- End-to-end: herramienta a definir en la tarea 0.4 (Cypress recomendado por soporte de `cy.intercept` para simular respuestas de `/api` y `/files` sin depender siempre de un MinIO real).

**Estándar mínimo de pruebas por módulo CRUD** (aplicable a cada módulo de la Fase 3, y ya exigido retroactivamente a `diccionarios`/`idiomas`/`archivos` que hoy no tienen specs):

| Tipo de prueba | Archivo | Casos mínimos obligatorios |
|---|---|---|
| Servicio | `<modulo>.service.spec.ts` | `list()` éxito/error, `getById()` éxito/404, `create()` éxito/validación fallida, `update()` éxito/error, `delete()` éxito/error, headers/withCredentials correctos |
| Componente lista | `<modulo>-list.component.spec.ts` | Render con datos, render vacío, filtro/búsqueda si aplica, botones visibles/ocultos según permisos, navegación a detalle/edición |
| Componente create/edit | `<modulo>-create.component.spec.ts` / `-edit` | Formulario inválido no envía, formulario válido llama al servicio, manejo de error del backend muestra notificación, integración con `ArchivoManagerComponent` si aplica |
| Componente detalle | `<modulo>-detail.component.spec.ts` | Render de todas las relaciones, render de archivos adjuntos, botones de acción según ownership |
| Guard/ruta (si aplica) | `<modulo>.guard.spec.ts` | Acceso permitido/denegado por rol |
| E2E | `<modulo>.e2e.spec.ts` (o `.cy.ts`) | Flujo completo crear → listar → ver → editar → (archivo si aplica) → eliminar, con al menos un caso de error de validación y uno de permisos insuficientes |

**Pruebas específicas transversales (una sola vez, no por módulo):**
- E2E de autenticación completo (login, refresh automático, logout, expiración de sesión).
- E2E de gestión de archivos consolidada (Fase 2.5) reutilizado por cada módulo que adjunte archivos.
- E2E del módulo de grafo (Fase 4.4).
- Prueba de regresión de CORS/cookies entre orígenes mientras dure la convivencia (Fase 0 y Fase 5).

**Gate de avance:** el pipeline de CI (o ejecución manual documentada, si no hay CI aún) debe mostrar en verde las specs unitarias y al menos el e2e de flujo completo del módulo, **y** debe existir la revisión visual lado a lado documentada (Fase 0.8 / principio 9 / paso 3.X.8) antes de marcar el checkpoint 3.X.10 de ese módulo. Un módulo que funcione pero no luzca idéntico al legacy NO se aprueba.

---

## 6. Gestión de riesgos y rollback

| Riesgo | Mitigación |
|---|---|
| Romper la subida/descarga de archivos MinIO al migrar un módulo con `<archivo-manager>` | No tocar `config/minio.js` (backend); usar siempre `ArchivoManagerComponent` consolidado en Fase 2 antes de migrar cualquier módulo con archivos adjuntos |
| Migrar `obras` antes de tiempo y bloquear el resto | Respetar el orden de la Fase 3; `obras` es el último CRUD |
| Divergencia de comportamiento entre legacy y Angular en formularios complejos | Validación manual de paridad (3.X.8) obligatoria antes de cortar el módulo en el legacy |
| Pérdida de acceso a un módulo aún no migrado al desactivar prematuramente algo en el legacy | Cortar (3.X.9) módulo por módulo, nunca en bloque, y verificar dependencias cruzadas (ej. `obras` usando `Actores`/`Generos` legacy) |
| Regresión de seguridad al final (Fase 6) por dejar código legacy a medio borrar | Checklist explícito 6.1–6.5 + regresión final 6.6 antes del tag `post-migracion-angular` |
| Imposibilidad de revertir si algo falla en producción | Mantener el tag `pre-migracion-angular` (0.7) y no borrar `public/` físicamente hasta el sign-off de Fase 5 |

---

## 7. Plantilla resumida para copiar por módulo (uso operativo rápido)

```
### Módulo: <nombre>
- [ ] Análisis legacy (controller/service/routes/vistas)
- [ ] Modelo TS
- [ ] Servicio Angular (list/getById/create/update/delete)
- [ ] Componentes list/create/edit/detail
- [ ] Rutas + guards
- [ ] Integración de listas de referencia
- [ ] Integración de ArchivoManagerComponent (si aplica)
- [ ] Specs de servicio
- [ ] Specs de componentes
- [ ] E2E de flujo completo
- [ ] Validación manual de paridad funcional
- [ ] Revisión visual lado a lado (con styles.css importado) + capturas comparativas
- [ ] Corte en legacy (comentar módulo / redirigir ruta)
- [ ] Checkpoint: tablero actualizado a "Aprobado (funcional + visual)" — NO avanzar sin este paso
```

---

## 8. Referencias de archivos clave (para consulta durante la ejecución)

- Backend bootstrap: `simr-back/server.js`, `simr-back/config/express.js`, `simr-back/config/minio.js`
- Guard legacy de estáticos: `simr-back/app/middleware/legacyShellGuard.js`
- Módulo core legacy: `simr-back/public/core/`
- Módulo CRUD de referencia (patrón repetido): `simr-back/public/obras/`, `simr-back/public/actores/`
- Directiva de archivos legacy: `simr-back/public/archivos/archivo-manager.client.directive.js`, `simr-back/public/archivos/archivos.client.service.js`
- Módulo de grafo legacy: `simr-back/public/graph/`
- Bootstrap del módulo raíz legacy: `simr-back/public/application.js`
- Angular nuevo — estructura de referencia ya migrada: `simr-front/src/app/features/actores/`, `simr-front/src/app/features/idiomas/`, `simr-front/src/app/features/diccionarios/`, `simr-front/src/app/features/archivos/`
- Auth Angular: `simr-front/src/app/core/auth/`

# Objetivo
Migrar todos los módulos CRUD de AngularJS a Angular 20+ con consistencia visual. Cada módulo nuevo debe lucir como el que se acaba de migrar (misma estructura de componentes, mismo patrón de formularios, mismos shared components).

## Estado actual (2026-07-22)

### ✅ Completados
- **Core/Shell**: Auth, menú, guards, servicios transversales
- **Listas, Search, Admin, Auditoria** (Fase 1)
- **Materias** — **migrado** con gestión unificada, `ArchivoManagerComponent`, `ColumnSelectorComponent`, preferencias de columna
- **Medios** — **migrado** con el mismo patrón que Materias (Reactive Forms, CollapsibleSectionComponent, AnotacionMapComponent con MapLibre GL JS, estilo visual idéntico)
- **AnotacionMapComponent** — migrado de Leaflet a **MapLibre GL JS** (Canvas/WebGL, sin problemas de `box-sizing`). Popup con tooltip en hover, reutilizable por cualquier módulo
- **CollapsibleSectionComponent** — fix `overflow: visible` en estado abierto para que mapas y contenido extenso no se recorten
- **ArchivoManagerComponent** — componente reutilizable de gestión de archivos MinIO
- **ColumnSelectorComponent** — selector de campos visibles con persistencia vía preferencias de usuario

### 🟡 En ejecución

### ❌ Pendientes (orden de migración)
1. **Sistemas** ← siguiente
2. Instrumentos
3. Géneros
4. Géneros no musicales
5. Fondos
6. Colecciones
7. Ejemplares
8. Idiomas / Diccionarios (cerrar specs)
9. Recursos
10. Proyectos
11. Actores (cerrar gaps)
12. Obras (último, más complejo)

## Componentes compartidos listos para reusar (sin cambios necesarios)

| Componente | Ubicación | Uso en todos los módulos CRUD |
|---|---|---|
| `CollapsibleSectionComponent` | `shared/collapsible-section` | Secciones plegables en detail/form |
| `AnotacionesCartograficasComponent` | `shared/anotaciones-cartograficas` | Anotaciones cartográfico-temporales (timeline + mapa MapLibre) |
| `AnotacionMapComponent` | `shared/anotaciones-cartograficas/anotacion-map` | Mapa con MapLibre GL JS, popups en hover |
| `AnotacionTimelineComponent` | `shared/anotaciones-cartograficas/anotacion-timeline` | Línea de tiempo con ngx-timeline |
| `AnotacionFormComponent` | `shared/anotaciones-cartograficas/anotacion-form` | Formulario de coordenadas con pegado desde clipboard |
| `ArchivoManagerComponent` | `features/archivos/archivo-manager` | Gestión de archivos adjuntos MinIO |
| `ColumnSelectorComponent` | `shared/column-selector` | Selector de campos visibles con persistencia |
| `ListEditorComponent` | `shared/list-editor` | Editor de listas simples (tags/chips) |
| `UserPreferencesService` | `core/services/user-preferences.service` | Persistencia de preferencias por usuario |

## Principios de migración (orden de ejecución)

1. **Clonar visualmente el módulo anterior.** Cada módulo nuevo debe usar la misma estructura de componentes, mismos shared components, mismo layout de formulario (CollapsibleSectionComponent), mismo estilo de tabla/tarjetas, mismo mapa y timeline. El usuario debe sentir que "Sistemas" es "Medios" pero con otros campos.
2. **Usar Reactive Forms siempre** (no mezclar con ngModel).
3. **Servicio con SignalStore** (patrón `@ngrx/signals`) como en Medios/Materias.
4. **Ruta lazy** con `loadComponent` y guards de permisos.
5. **Popups con MapLibre GL JS** (no Leaflet) para anotaciones cartográficas.
6. **Gestion unificada:** un único item en el menú ("Sistemas") que lleva al listado, desde donde se crea, edita y ve detalle.
7. **Override `overflow: visible`** en collapsible-body.open (fix aplicado global).
8. **Coordenadas como `number[]`** del API, convertir con `Number()` donde se acceda.
9. **Container restart** ocasional para limpiar cache de Angular (`docker restart simr-front_dev`).

## Plan Sistemas

Sigue el mismo patrón exacto que Medios:
- `SistemasListComponent` (vista tabla/tarjetas con column-selector)
- `SistemasFormComponent` (Reactive Forms + CollapsibleSectionComponent)
- `SistemasDetailComponent` (CollapsibleSectionComponent + kv-list + anotaciones + archivos)
- `SistemasStore` (SignalStore)
- `SistemasService` (HttpClient CRUD)
- Ruta: `sistemas` → lazy `SistemasListComponent`
- Menú: reemplazar "Crear sistema" / "Listar sistemas" por un solo "Sistemas"

### Datos de referencia a integrar
- `listas` de tipo "sistema" (GET /api/listas)
- `anotacionesCartograficoTemporal` (mismo componente que en Medios)
- `archivosAdjuntos` (ArchivoManagerComponent)
- `proyectosAsociados` (selector de proyectos)
- `instrumentosAsociados` (selector de instrumentos — si ya existe migrado)

### Diferencias con Medios
- Schema tiene campos propios de sistemas (ej. `codigo`, `descripcion`, `tipoSistema`, etc.)
- Relaciones posiblemente distintas (proyectos, instrumentos vs. lo que tenga Medios)
- Validaciones específicas del schema

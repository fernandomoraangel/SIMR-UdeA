# Objetivo
Migrar todos los módulos CRUD de AngularJS a Angular 20+ con consistencia visual. Cada módulo nuevo debe lucir como el que se acaba de migrar (misma estructura de componentes, mismo patrón de formularios, mismos shared components).

## Estado actual (2026-07-22)

### ✅ Completados
- **Core/Shell**: Auth, menú, guards, servicios transversales
- **Listas, Search, Admin, Auditoria** (Fase 1)
- **Materias** — migrado con gestión unificada, `ArchivoManagerComponent`, `ColumnSelectorComponent`, preferencias de columna
- **Medios** — migrado (Reactive Forms, CollapsibleSectionComponent, AnotacionMapComponent con MapLibre GL JS, estilo visual idéntico)
- **Sistemas** — migrado con el mismo patrón que Medios + relaciones entre sistemas (padres/hijos/relacionados)
- **Instrumentos** — migrado con asistente **Hornbostel-Sachs** (HsWizardComponent + HsClassificationService), auto-detect universal al escribir nombre, árbol jerárquico con 643 nodos desde MIMO, ~1761 instrumentos universales precargados. JSONs estáticos en `src/assets/data/`
- **AnotacionMapComponent** — migrado de Leaflet a **MapLibre GL JS** (Canvas/WebGL). Popup con tooltip en hover, reutilizable por cualquier módulo
- **CollapsibleSectionComponent** — fix `overflow: visible` en estado abierto para que mapas y contenido extenso no se recorten
- **ArchivoManagerComponent** — componente reutilizable de gestión de archivos MinIO
- **ColumnSelectorComponent** — selector de campos visibles con persistencia vía preferencias de usuario

### ❌ Pendientes (orden de migración)
1. ~~**Sistemas**~~ ✅
2. ~~**Instrumentos**~~ ✅ (con HS assistant)
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
| `HsClassificationService` | `shared/hs-classification` | Árbol Hornbostel-Sachs, fuzzy search, búsqueda por código, ruta completa |
| `HsWizardComponent` | `shared/hs-classification` | Modal wizard guiado con mat-dialog, árbol expandible + búsqueda + sufijos |

## Principios de migración (orden de ejecución)

1. **Actualizar el menú primero.** Antes de crear cualquier componente, cambia la entrada del menú en `shell.component.ts` de `ruta: '/no-implementado/<Modulo>'` a `ruta: '/<modulo>'`. Esto asegura que la navegación apunte al módulo nuevo desde el inicio.
2. **Clonar visualmente el módulo anterior.** Cada módulo nuevo debe usar la misma estructura de componentes, mismos shared components, mismo layout de formulario (CollapsibleSectionComponent), mismo estilo de tabla/tarjetas, mismo mapa y timeline. El usuario debe sentir que "Sistemas" es "Medios" pero con otros campos.
3. **Usar Reactive Forms siempre** (no mezclar con ngModel).
4. **Servicio con SignalStore** (patrón `@ngrx/signals`) como en Medios/Materias/Instrumentos.
5. **Ruta lazy** con `loadComponent` y guards de permisos.
6. **Popups con MapLibre GL JS** (no Leaflet) para anotaciones cartográficas.
7. **Gestión unificada:** un único item en el menú que lleva al listado, desde donde se crea, edita y ve detalle.
8. **Override `overflow: visible`** en collapsible-body.open (fix aplicado global).
9. **Coordenadas como `number[]`** del API, convertir con `Number()` donde se acceda.
10. **Container restart** ocasional para limpiar cache de Angular (`docker restart simr-front_dev`).

## Plan Instrumentos (completado)

Sigue el mismo patrón que Medios/Sistemas, con integración Hornbostel-Sachs:

- `InstrumentosListComponent` — vista tabla/tarjetas con column-selector, badge HS en tarjetas
- `InstrumentoFormComponent` — Reactive Forms + CollapsibleSectionComponent + HS wizard + auto-detect universal
- `InstrumentoDetailComponent` — CollapsibleSectionComponent + HS display + anotaciones + archivos
- `InstrumentosStore` — SignalStore (mismo patrón)
- `InstrumentosService` — HttpClient CRUD
- `HsClassificationService` — carga JSONs estáticos, navegación árbol, fuzzy search, ruta completa
- `HsWizardComponent` — modal MatDialog con stepper guiado por niveles, búsqueda, sufijos
- Ruta: `instrumentos` → lazy `InstrumentosListComponent`
- Menú: `instrumentos` (reemplaza `/no-implementado/instrumentos`)
- JSONs: `hs-taxonomy.json` (643 nodos), `hs-universal-instruments.json` (~1761 instrumentos)

### Diferencias con Medios/Sistemas
- Campo `clasificacion: String` (código HS) reemplaza a `instrumentos[]` como sub-colección
- `alias` se muestra como chips en list/detail
- Sin relación con instrumentos (obvio, es el propio módulo)
- Auto-detect: al escribir el nombre, fuzzy match contra instrumentos universales precargados
- Botón "Clasificar" abre wizard HS modal con árbol jerárquico completo
- Suffix support: `-6` (con púa), `-8` (con teclado), etc.

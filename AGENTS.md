# Objetivo
Migrar todos los módulos CRUD de AngularJS a Angular 20+ con consistencia visual. Cada módulo nuevo debe lucir como el que se acaba de migrar (misma estructura de componentes, mismo patrón de formularios, mismos shared components).

## Estado actual (2026-07-22)

### ✅ Completados
- **Core/Shell**: Auth, menú, guards, servicios transversales
- **Listas, Search, Admin, Auditoria** (Fase 1)
- **Materias** — migrado con gestión unificada, `ArchivoManagerComponent`, `ColumnSelectorComponent`, preferencias de columna
- **Medios** — migrado (Reactive Forms, CollapsibleSectionComponent, AnotacionMapComponent con MapLibre GL JS, estilo visual idéntico)
- **Sistemas** — migrado con el mismo patrón que Medios + relaciones entre sistemas (padres/hijos/relacionados)
- **Instrumentos** — migrado con asistente **Hornbostel-Sachs** (HsWizardComponent + HsClassificationService), auto-detect universal al escribir nombre, árbol jerárquico con 643 nodos desde MIMO, ~1761 instrumentos universales precargados. Popup con desglose por niveles en español al hover.
- **Géneros** — migrado con relaciones padre/hijo/relacionados, idiomas, sistemas sonoros, medios sonoros, proyectos, anotaciones, descriptores, enlaces, archivos
- **Géneros no musicales** — migrado similar a Géneros (sin sistemas/medios/proyectos)
- **Fondos** — migrado (nombre, tipo, propiedad/comodato, fecha, precisión)
- **Colecciones** — migrado (mismos campos que Fondos)
- **Idiomas** — migrado con diseño decolonial (glottocode, isoCode, endonym, exonymSpanish, linguisticFamily, transmissionMode, territorialContext, anotaciones, descriptores, enlaces, archivos). Botón Semillero carga 334 lenguas desde `data/lenguas-america.json`. Help-popup con definiciones del Diccionario para cada campo.
- **Diccionarios** — migrado (tabla, campo, campoLargo, definición)
- **Proyectos** — migrado con investigadores (ref Actor), fechas asociadas, estado, descriptores, enlaces, archivos
- **Ejemplares** — migrado (recurso, numeroEjemplar, disponibilidad, fondo, colección, procedencia, estados editor inline, AutocompleteCreateComponent)
- **Recursos** — migrado (15 secciones colapsables + planas: tipos con inline-editor, fechas con precisión, AutocompleteCreateComponent con displayField)
- **Actores** — migrado (nombres, apellidos, nombreReunion, contenedores, anotaciones CT, descriptores etiqueta+contenido, vínculos, archivos)
- **Obras** — migrado (completo: 15 secciones colapsables, AutocompleteCreateComponent, fechas, notas programa, etc.)
- **Estadísticas** — nuevo módulo con Chart.js (bar chart + cards de resumen), endpoint `/api/stats` en backend
- **AnotacionMapComponent** — migrado de Leaflet a **MapLibre GL JS** (Canvas/WebGL). Popup con tooltip en hover, reutilizable por cualquier módulo
- **CollapsibleSectionComponent** — fix `overflow: visible` en estado abierto para que mapas y contenido extenso no se recorten
- **ArchivoManagerComponent** — componente reutilizable de gestión de archivos MinIO
- **ColumnSelectorComponent** — selector de campos visibles con persistencia vía preferencias de usuario

### ✅ Migración completa
- **Grafo** — migrado con D3.js v7 force-directed graph. Componente standalone con SVG, zoom/pan, drag, tooltip hover, navegación a detalle al click. SignalStore + SignalStore Service. API `/api/graph/*` endpoints existentes en backend. Ruta `/graph` lazy.

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

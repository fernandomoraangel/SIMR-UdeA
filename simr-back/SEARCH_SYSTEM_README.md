# Sistema de Búsqueda General SIMR

## Descripción

El Sistema de Búsqueda General permite buscar coincidencias perfectas o inexactas de cualquier cadena de texto en cualquier campo de cualquier tabla (entidad) del sistema SIMR, con soporte completo para operaciones booleanas.

## Características Principales

### 🔍 Tipos de Búsqueda
- **Búsqueda Exacta**: Coincidencia perfecta de términos
- **Búsqueda Inexacta**: Uso de expresiones regulares con insensibilidad a mayúsculas/minúsculas
- **Búsqueda por Campos Específicos**: Limitar búsqueda a campos particulares
- **Búsqueda por Entidades**: Buscar en entidades específicas o en todas

### 🔗 Operaciones Booleanas
- `AND`: Intersección de términos
- `OR`: Unión de términos
- `NOT`: Exclusión de términos
- `()`: Agrupación de expresiones
- `"texto"`: Búsqueda exacta de frases

### 📊 Entidades Disponibles
- Obras
- Actores
- Recursos
- Géneros (musicales y no musicales)
- Materias
- Instrumentos
- Proyectos
- Medios
- Sistemas
- Fondos
- Colecciones
- Ejemplares
- Idiomas
- Diccionarios
- Archivos
- Listas

## API REST

### Endpoints

#### 1. Búsqueda General
```
GET /api/search?q={query}&entities={entities}&fields={fields}&exact={exact}&limit={limit}&skip={skip}&sort={sort}
```

**Parámetros:**
- `q` (requerido): Término de búsqueda con operadores booleanos
- `entities` (opcional): Lista de entidades separadas por coma (ej: "Obra,Actor")
- `fields` (opcional): Lista de campos separados por coma
- `exact` (opcional): `true` para búsqueda exacta, `false` para inexacta (default: false)
- `limit` (opcional): Número máximo de resultados (default: 50, max: 100)
- `skip` (opcional): Número de resultados a saltar (para paginación)
- `sort` (opcional): JSON string con criterios de ordenamiento

#### 2. Búsqueda por Entidad
```
GET /api/search/{entity}?q={query}&fields={fields}&exact={exact}&limit={limit}&skip={skip}&sort={sort}
```

#### 3. Metadatos de Búsqueda
```
GET /api/search/metadata
```

#### 4. Validación de Consultas
```
GET /api/search/validate?q={query}
```

## Ejemplos de Uso

### Consultas Básicas
```javascript
// Búsqueda simple
GET /api/search?q=bachata

// Búsqueda exacta
GET /api/search?q=bachata&exact=true

// Búsqueda en entidades específicas
GET /api/search?q=bachata&entities=Obra,Genero
```

### Operadores Booleanos
```javascript
// AND
GET /api/search?q=bachata%20AND%20salsa

// OR
GET /api/search?q=bachata%20OR%20salsa

// NOT
GET /api/search?q=NOT%20bachata

// Agrupación
GET /api/search?q=(bachata%20OR%20salsa)%20AND%20colombia

// Frases exactas
GET /api/search?q=%22bachata%20moderna%22
```

### Paginación y Ordenamiento
```javascript
// Paginación
GET /api/search?q=bachata&limit=20&skip=40

// Ordenamiento por relevancia (default)
GET /api/search?q=bachata&sort={"_searchScore":-1}

// Ordenamiento por fecha
GET /api/search?q=bachata&sort={"creado":-1}
```

## Respuesta de la API

```json
{
  "success": true,
  "query": "bachata AND salsa",
  "results": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "_entityType": "Obra",
      "_searchScore": 0.85,
      "titulo": "Bachata Moderna",
      "descripcion": "Estudio sobre la evolución de la bachata...",
      "creado": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 1,
  "entities": ["Obra", "Actor", "Recurso"],
  "exact": false
}
```

## Campos de Búsqueda por Entidad

### Obra
- `titulo`
- `descripcion`
- `denominacionRegional.denominacionRegional`
- `descriptores.etiqueta`
- `descriptores.contenido`

### Actor
- `nombres`
- `apellidos`
- `nombreReunion`
- `descriptores.etiqueta`
- `descriptores.contenido`

### Recurso
- `titulo`
- `descripcion`
- `numeroNormalizado.nombre`
- `numeroNormalizado.numero`
- `descriptorLibre.etiqueta`
- `descriptorLibre.contenido`

*(Y así para todas las demás entidades)*

## Optimización de Rendimiento

### Índices de MongoDB
El sistema incluye un script para crear índices de texto optimizados:

```bash
npm run create-search-indexes
```

Esto crea:
- Índices de texto individuales por campo
- Índices compuestos para búsqueda general
- Índices en background para no afectar el rendimiento

### Mejores Prácticas
1. **Usar paginación**: Limitar resultados con `limit` y `skip`
2. **Filtrar entidades**: Especificar `entities` para búsquedas más rápidas
3. **Campos específicos**: Usar `fields` para búsquedas más precisas
4. **Índices actualizados**: Ejecutar el script de índices después de cambios en el esquema

## Interfaz de Usuario

### Rutas Disponibles
- `/search`: Búsqueda general con filtros avanzados
- `/search/advanced`: Búsqueda con opciones avanzadas

### Características del Frontend
- Autocompletado inteligente
- Filtros por entidad
- Paginación de resultados
- Ayuda integrada de sintaxis
- Historial de búsquedas

## Instalación y Configuración

### 1. Archivos del Backend
Los archivos del sistema de búsqueda se han agregado automáticamente:
- `app/services/search.service.js`: Motor de búsqueda principal
- `app/controllers/search.server.controller.js`: Controladores REST
- `app/routes/search.server.routes.js`: Definición de rutas

### 2. Archivos del Frontend
- `public/search/search.client.module.js`: Módulo AngularJS
- `public/search/config/search.client.routes.js`: Configuración de rutas
- `public/search/services/search.client.service.js`: Servicio AngularJS
- `public/search/controllers/search.client.controller.js`: Controlador principal
- `public/search/views/search.client.view.html`: Vista principal

### 3. Crear Índices
```bash
npm run create-search-indexes
```

### 4. Reiniciar Servidor
```bash
npm run dev
```

## Permisos

El sistema de búsqueda requiere el permiso `search:read` para acceder a las funcionalidades.

## Monitoreo y Logs

Los logs de búsqueda se registran en la consola del servidor con información detallada sobre:
- Consultas realizadas
- Tiempo de ejecución
- Número de resultados
- Errores encontrados

## Limitaciones y Consideraciones

### Rendimiento
- Las búsquedas muy amplias pueden ser lentas sin índices apropiados
- Recomendado usar paginación para grandes conjuntos de datos
- Los operadores booleanos complejos pueden afectar el rendimiento

### Funcionalidades Futuras
- Búsqueda facetada avanzada
- Búsqueda por proximidad de términos
- Búsqueda difusa (fuzzy search)
- Autocompletado más inteligente
- Búsqueda por metadatos específicos

## Soporte y Mantenimiento

Para soporte técnico o reportes de bugs, contactar al equipo de desarrollo del SIMR.
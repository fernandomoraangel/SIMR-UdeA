# Sistema de Estadísticas para SIMR - Diseño Arquitectónico

## 1. Contexto del Sistema

El sistema SIMR cuenta con un servicio de búsqueda avanzado que indexa múltiples entidades:
- **Obras**: Títulos, descripciones, denominaciones regionales, descriptores
- **Actores**: Nombres, apellidos, nombres de reunión, descriptores
- **Recursos**: Títulos, descripciones, números normalizados, descriptores
- **Géneros**: Musicales y no musicales con jerarquías
- **Materias, Instrumentos, Proyectos, Medios, Sistemas**
- **Fondos, Colecciones, Ejemplares, Idiomas, Diccionarios**

## 2. Arquitectura del Sistema de Estadísticas

### 2.1 Componentes Principales

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   Base de Datos │
│   (Angular.js)  │◄──►│   (Node.js)      │◄──►│   (MongoDB)     │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ Dashboard   │ │    │ │ Stats Service│ │    │ │ Stats Cache │ │
│ │ Controller  │ │    │ │              │ │    │ │ Collection  │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ Chart       │ │    │ │ Search       │ │    │ │ Search      │ │
│ │ Components  │ │    │ │ Integration  │ │    │ │ Results     │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 2.2 Tecnologías Seleccionadas

**Biblioteca de Gráficos**: Chart.js v2.9.4 (última compatible con Angular.js)
- ✅ Compatible con Angular.js
- ✅ Ligera y performante
- ✅ Amplia variedad de tipos de gráficos
- ✅ Comunidad activa y documentación completa

**Dependencias Adicionales**:
- angular-chart.js (wrapper para Angular.js)
- Lodash (para manipulación de datos)

## 3. Estructura de Datos

### 3.1 Colección de Estadísticas en MongoDB

```javascript
// Esquema para estadísticas agregadas
const StatsSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // searchQuery + timestamp
  searchQuery: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  totalResults: { type: Number, default: 0 },

  // Estadísticas por entidad
  entityStats: [{
    entityName: { type: String, required: true },
    count: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    topFields: [{
      fieldName: String,
      matches: Number,
      sampleValues: [String]
    }]
  }],

  // Estadísticas de campos
  fieldStats: [{
    fieldName: { type: String, required: true },
    entityName: { type: String, required: true },
    matchCount: { type: Number, default: 0 },
    uniqueValues: { type: Number, default: 0 },
    topValues: [{
      value: String,
      count: Number
    }]
  }],

  // Estadísticas de relaciones
  relationshipStats: [{
    fromEntity: String,
    toEntity: String,
    relationshipType: String,
    count: Number
  }],

  // Metadatos de la búsqueda
  searchMetadata: {
    exact: { type: Boolean, default: false },
    entities: [String],
    fields: [String],
    operators: [String]
  }
});
```

### 3.2 Estructura de Respuesta de Estadísticas

```javascript
{
  "success": true,
  "query": "bachata",
  "stats": {
    "totalResults": 1250,
    "entityBreakdown": [
      { "entity": "Obra", "count": 450, "percentage": 36 },
      { "entity": "Actor", "count": 320, "percentage": 25.6 },
      { "entity": "Recurso", "count": 280, "percentage": 22.4 },
      { "entity": "Genero", "count": 200, "percentage": 16 }
    ],
    "fieldAnalysis": [
      { "field": "titulo", "matches": 890, "entities": ["Obra", "Recurso"] },
      { "field": "descripcion", "matches": 650, "entities": ["Obra", "Actor"] },
      { "field": "descriptores.etiqueta", "matches": 420, "entities": ["Obra", "Actor"] }
    ],
    "relationshipInsights": [
      { "type": "Obra-Actor", "count": 180, "description": "Colaboraciones" },
      { "type": "Recurso-Obra", "count": 95, "description": "Referencias" }
    ]
  }
}
```

## 4. APIs del Sistema de Estadísticas

### 4.1 Endpoint Principal de Estadísticas

```
GET /api/search/stats?q={query}&entities={entities}&exact={exact}
```

**Parámetros**:
- `q`: Término de búsqueda (requerido)
- `entities`: Entidades a incluir (opcional)
- `exact`: Búsqueda exacta (opcional, default: false)

**Respuesta**: Estadísticas agregadas de la búsqueda

### 4.2 Endpoint de Tendencias

```
GET /api/search/trends?period={period}&limit={limit}
```

**Parámetros**:
- `period`: Período de tiempo (hour, day, week, month)
- `limit`: Número máximo de resultados

**Respuesta**: Consultas más frecuentes y sus estadísticas

### 4.3 Endpoint de Análisis de Campos

```
GET /api/search/field-analysis?q={query}&entity={entity}
```

**Parámetros**:
- `q`: Término de búsqueda
- `entity`: Entidad específica para análisis detallado

**Respuesta**: Análisis detallado de campos para una entidad

## 5. Componentes del Dashboard Interactivo

### 5.1 Estructura del Dashboard

```html
<div class="stats-dashboard">
  <!-- Panel de resumen -->
  <div class="stats-summary">
    <div class="metric-card">
      <h3>Total de Resultados</h3>
      <div class="metric-value">{{stats.totalResults}}</div>
    </div>
    <div class="metric-card">
      <h3>Entidades Encontradas</h3>
      <div class="metric-value">{{stats.entityBreakdown.length}}</div>
    </div>
  </div>

  <!-- Gráficos principales -->
  <div class="charts-container">
    <div class="chart-row">
      <div class="chart-col">
        <div class="chart-card">
          <h4>Distribución por Entidad</h4>
          <canvas id="entityChart"></canvas>
        </div>
      </div>
      <div class="chart-col">
        <div class="chart-card">
          <h4>Campos Más Relevantes</h4>
          <canvas id="fieldChart"></canvas>
        </div>
      </div>
    </div>
  </div>

  <!-- Tabla detallada -->
  <div class="detailed-stats">
    <table class="stats-table">
      <thead>
        <tr>
          <th>Entidad</th>
          <th>Cantidad</th>
          <th>Porcentaje</th>
          <th>Campos Principales</th>
        </tr>
      </thead>
      <tbody>
        <tr ng-repeat="entity in stats.entityBreakdown">
          <td>{{entity.entity}}</td>
          <td>{{entity.count}}</td>
          <td>{{entity.percentage}}%</td>
          <td>{{entity.topFields.join(', ')}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### 5.2 Tipos de Gráficos Implementados

1. **Gráfico de Pastel/Dona**: Distribución por entidades
2. **Gráfico de Barras**: Campos más relevantes por entidad
3. **Gráfico de Líneas**: Tendencias de búsqueda temporal
4. **Gráfico de Radar**: Cobertura de campos por entidad
5. **Treemap**: Distribución jerárquica de categorías

### 5.3 Funcionalidades Interactivas

- **Filtros Dinámicos**: Filtrar por entidad, período de tiempo
- **Drill-down**: Hacer clic en segmentos para ver detalles
- **Exportación**: Exportar gráficos como PNG/PDF
- **Responsive**: Adaptable a diferentes tamaños de pantalla
- **Tooltips Avanzados**: Información contextual al pasar el mouse

## 6. Servicio de Estadísticas (Backend)

### 6.1 Arquitectura del Servicio

```javascript
// Servicio principal de estadísticas
class StatsService {
  constructor(searchService) {
    this.searchService = searchService;
    this.cache = new NodeCache({ stdTTL: 3600 }); // Cache de 1 hora
  }

  // Método principal para generar estadísticas
  async generateStats(query, options = {}) {
    const cacheKey = this.generateCacheKey(query, options);

    // Verificar cache primero
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    // Realizar búsqueda completa
    const searchResults = await this.searchService.search(query, {
      ...options,
      limit: 10000 // Límite alto para análisis completo
    });

    // Generar estadísticas
    const stats = await this.computeStats(searchResults, query);

    // Cachear resultado
    this.cache.set(cacheKey, stats);

    return stats;
  }

  // Computar estadísticas detalladas
  async computeStats(searchResults, query) {
    const stats = {
      totalResults: searchResults.total,
      entityBreakdown: [],
      fieldAnalysis: [],
      relationshipInsights: []
    };

    // Análisis por entidad
    stats.entityBreakdown = this.analyzeEntities(searchResults.results);

    // Análisis de campos
    stats.fieldAnalysis = this.analyzeFields(searchResults.results, query);

    // Análisis de relaciones
    stats.relationshipInsights = this.analyzeRelationships(searchResults.results);

    return stats;
  }
}
```

### 6.2 Optimizaciones de Performance

- **Cache Inteligente**: Cache de resultados con TTL configurable
- **Procesamiento Asíncrono**: Estadísticas generadas en background
- **Paginación de Resultados**: Procesamiento por lotes para grandes volúmenes
- **Indexación**: Índices optimizados en MongoDB para consultas de estadísticas

## 7. Integración con el Sistema de Búsqueda

### 7.1 Modificación del Controlador de Búsqueda

```javascript
// En search.server.controller.js
exports.search = async (req, res) => {
  try {
    // ... código existente de búsqueda ...

    const results = await searchService.search(query, options);

    // Generar estadísticas si se solicita
    if (req.query.includeStats === 'true') {
      const statsService = require('../services/stats.service');
      const stats = await statsService.generateStats(query, options);
      results.stats = stats;
    }

    res.json(results);
  } catch (err) {
    // ... manejo de errores ...
  }
};
```

### 7.2 Actualización de la Vista de Búsqueda

```html
<!-- En search.client.view.html -->
<div class="row" ng-if="vm.searchResults.length > 0">
  <div class="col-md-12">
    <!-- Toggle para mostrar/ocultar estadísticas -->
    <div class="stats-toggle">
      <button class="btn btn-info btn-sm" ng-click="vm.showStats = !vm.showStats">
        <i class="fa fa-chart-bar"></i>
        {{vm.showStats ? 'Ocultar' : 'Mostrar'}} Estadísticas
      </button>
    </div>

    <!-- Dashboard de estadísticas -->
    <div ng-if="vm.showStats" class="stats-dashboard">
      <stats-dashboard
        stats="vm.searchResults.stats"
        query="vm.searchQuery">
      </stats-dashboard>
    </div>
  </div>
</div>
```

## 8. Plan de Implementación
## Advertencia: Tener en cuenta que la aplicación corre en contenedores por lo que para probarla hay que bajar y volver a levantar los contenedores. LO mismo para ver el log y para ejecutar cualquier script (dentro del contenedor correspondiente).

### 8.1 Fase 1: Infraestructura Base
- [ ] Instalar Chart.js y dependencias
- [ ] Crear servicio de estadísticas backend
- [ ] Implementar colección de cache en MongoDB
- [ ] Crear endpoints básicos de estadísticas

### 8.2 Fase 2: Componentes del Dashboard
- [ ] Crear directiva Angular para dashboard
- [ ] Implementar gráficos básicos (pastel, barras)
- [ ] Crear tabla de estadísticas detalladas
- [ ] Implementar filtros interactivos

### 8.3 Fase 3: Funcionalidades Avanzadas
- [ ] Sistema de cache inteligente
- [ ] Exportación de gráficos
- [ ] Análisis de tendencias temporales
- [ ] Drill-down en gráficos

### 8.4 Fase 4: Optimización y Testing
- [ ] Optimización de performance
- [ ] Testing unitario y de integración
- [ ] Documentación completa
- [ ] Pruebas de carga

## 9. Consideraciones de Escalabilidad

### 9.1 Rendimiento
- **Cache Multi-nivel**: Memoria + Redis (futuro)
- **Procesamiento Asíncrono**: Jobs en background para estadísticas complejas
- **Compresión**: Resultados comprimidos para respuestas grandes

### 9.2 Mantenibilidad
- **Modularidad**: Servicios independientes y testeables
- **Configuración**: Parámetros configurables vía variables de entorno
- **Logging**: Logs detallados para debugging y monitoreo

### 9.3 Extensibilidad
- **Plugins**: Arquitectura de plugins para nuevos tipos de análisis
- **APIs RESTful**: Endpoints bien documentados para integraciones futuras
- **WebSockets**: Actualizaciones en tiempo real (futuro)

## 10. Conclusión

Este diseño proporciona un sistema de estadísticas robusto y escalable que se integra perfectamente con el sistema de búsqueda existente de SIMR. La arquitectura modular permite futuras expansiones y la elección de Chart.js garantiza compatibilidad con Angular.js mientras proporciona visualizaciones ricas e interactivas.
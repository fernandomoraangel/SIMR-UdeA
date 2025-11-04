# Plan de Implementación: Sistema de Roles y Permisos para SIMR

## Contexto del Proyecto

La aplicación SIMR (Sistema de Información de Músicas Regionales) es una aplicación CRUD desarrollada con arquitectura MEAN stack, pero actualmente utiliza AngularJS en el frontend. El backend está construido con Node.js/Express y MongoDB.

## Análisis del Sistema Actual

### Sistema de Permisos Actual (AccessControl)
- **Biblioteca**: `accesscontrol` (v2.x)
- **Roles fijos**: `user`, `editor`, `admin`
- **Permisos estáticos**: Definidos en código duro
- **Limitaciones**:
  - Roles no personalizables desde interfaz web
  - Permisos fijos por rol
  - No permite granularidad por menú específico
  - Requiere cambios en código para modificar permisos

### Requisitos del Nuevo Sistema

1. **Roles Iniciales**:
   - **Administrador**: Control total del sistema
   - **Lector**: Solo lectura de todos los recursos
   - **Investigador**: Lectura + creación/edición de recursos propios
   - **Catalogador**: Lectura + gestión completa de catálogos
   - **Bibliotecólogo**: Lectura + gestión de fondos documentales

2. **Características Requeridas**:
   - Roles personalizables desde interfaz web
   - Permisos por menú específico (lectura/escritura)
   - Herencia de permisos
   - Gestión de usuarios por administradores
   - Interfaz intuitiva para configuración

## Análisis de Bibliotecas

### AccessControl (Actual)
**Ventajas**:
- Ya implementado y funcionando
- API simple y directa
- Buen rendimiento
- Soporte para herencia de roles

**Desventajas**:
- Configuración en código (no dinámico)
- No soporta políticas complejas
- Difícil de mantener para roles dinámicos

### Casbin (Alternativa Recomendada)
**Ventajas**:
- Modelo de políticas flexible y expresivo
- Soporte para múltiples modelos de control de acceso (RBAC, ABAC, etc.)
- Políticas almacenadas en base de datos
- Alto rendimiento
- Comunidad activa

**Desventajas**:
- Curva de aprendizaje más pronunciada
- Mayor complejidad de configuración inicial
- Requiere migración del sistema actual

### Decisión: Mantener AccessControl con Mejoras

Dado que AccessControl ya está implementado y funciona bien, y considerando que los requisitos no necesitan la complejidad de Casbin, **recomendamos mantener AccessControl pero con una arquitectura mejorada**:

- Almacenar permisos en base de datos
- Sistema de roles dinámicos
- Interfaz web para gestión
- Mantener compatibilidad con el código existente

## Arquitectura Propuesta

### 1. Modelo de Datos

#### Role Model (Nuevo)
```javascript
{
  _id: ObjectId,
  name: String, // "Lector", "Investigador", etc.
  code: String, // "lector", "investigador" (único)
  description: String,
  permissions: [{
    resource: String, // "obra", "recurso", "proyecto", etc.
    actions: [String], // ["read"], ["read", "create", "update"]
    scope: String // "any" o "own"
  }],
  isSystem: Boolean, // true para roles iniciales
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

#### User Model (Actualizado)
```javascript
{
  // ... campos existentes
  roles: [ObjectId], // Referencias a roles asignados
  customPermissions: [{ // Permisos adicionales específicos
    resource: String,
    actions: [String],
    scope: String
  }]
}
```

### 2. Arquitectura de Permisos

#### Recursos del Sistema
- `user`: Gestión de usuarios
- `obra`: Obras musicales
- `recurso`: Recursos documentales
- `proyecto`: Proyectos de investigación
- `medio`: Medios de almacenamiento
- `sistema`: Sistemas de información
- `coleccion`: Colecciones
- `ejemplar`: Ejemplares
- `genero`: Géneros musicales
- `materia`: Materias
### Fase 5: Sistema de Usuarios (Nuevo)
12. **Implementar sistema de recuperación de contraseña**
13. **Crear formulario de registro administrativo**
14. **Actualizar flujo de autenticación**
- `instrumento`: Instrumentos
- `fondo`: Fondos documentales
- `archivo`: Archivos
- `diccionario`: Diccionarios
- `idioma`: Idiomas

#### Acciones por Recurso
- `create`: Crear nuevos elementos
- `read`: Leer/ver elementos
- `update`: Modificar elementos existentes
- `delete`: Eliminar elementos

#### Ámbito
- `any`: Cualquier elemento del recurso
- `own`: Solo elementos creados por el usuario

### 3. Roles Iniciales Propuestos

#### Administrador
- **Permisos**: Control total sobre todos los recursos
- **Alcance**: `any` para todas las acciones
- **Propósito**: Gestión completa del sistema

#### Lector
- **Permisos**: Solo lectura
- **Alcance**: `any` para `read` en todos los recursos
- **Propósito**: Consulta de información sin modificaciones

#### Investigador
- **Permisos**: Lectura + creación/edición de recursos propios
- **Alcance**:
  - `any` para `read`
  - `own` para `create`, `update`, `delete`
- **Propósito**: Investigación y aporte de contenido propio

#### Catalogador
- **Permisos**: Gestión completa de catálogos
- **Alcance**: `any` para todas las acciones en recursos de catálogo
- **Propósito**: Mantenimiento de catálogos del sistema

#### Bibliólogo
- **Permisos**: Gestión de fondos documentales
- **Alcance**: `any` para todas las acciones en fondos y recursos relacionados
- **Propósito**: Gestión de archivos y fondos documentales

## Plan de Implementación

### Fase 1: Preparación y Diseño
1. ✅ **Análisis del sistema actual** - Completado
2. ✅ **Evaluación de bibliotecas** - Completado
3. ✅ **Diseño de arquitectura** - Completado
4. **Crear modelos de datos para roles dinámicos**
5. **Actualizar modelo de usuario**

### Fase 2: Backend
6. **Implementar middleware de autorización actualizado**
7. **Crear rutas API para gestión de roles y permisos**
8. **Crear script de migración para roles iniciales**

### Fase 3: Frontend
### Compatibilidad con Docker
- **Desarrollo**: `docker-compose.dev.yml` - Sin cambios significativos, el sistema mantendrá la misma estructura de contenedores
- **Producción**: `docker-compose.prod.yml` - Verificar volúmenes de datos, no se requieren cambios en la configuración de contenedores

### Seguridad de Acceso
- **Control de menú**: Los usuarios solo verán en el menú las funciones a las que tienen acceso (implementado vía directivas AngularJS)
- **Protección de URLs**: Si un usuario conoce la URL de un formulario al que no tiene acceso, se le denegará el acceso mediante middleware de autorización en el backend
- **Validación en múltiples niveles**: Frontend (ocultar elementos) + Backend (validar permisos en cada request)

### Sistema de Registro y Recuperación
- **Registro público**: Solo lectura (información básica), sin posibilidad de registro directo
- **Registro administrativo**: Formulario de registro con validación del administrador para usuarios que requieren roles específicos
- **Recuperación de contraseña**: Sistema para recordar/restablecer contraseñas vía email
9. **Actualizar AngularJS para gestión de roles**
10. **Crear interfaz de administración de roles**

### Fase 4: Integración y Testing
11. **Integrar cambios con configuración Docker**
12. **Actualizar documentación**
13. **Testing y validación**

## Consideraciones Técnicas

### Compatibilidad con Docker
- **Desarrollo**: `docker-compose.dev.yml` - Sin cambios significativos
- **Producción**: `docker-compose.prod.yml` - Verificar volúmenes de datos

### Base de Datos
- **MongoDB**: Almacenar roles y permisos en colecciones separadas
- **Migración**: Script para crear roles iniciales sin afectar usuarios existentes

### Seguridad
- **Validación**: Verificar permisos en cada endpoint
- **Herencia**: Sistema de herencia de permisos entre roles
- **Auditoría**: Logs de cambios en roles y permisos

### Escalabilidad
- **Cache**: Implementar cache de permisos para mejor rendimiento
- **Índices**: Crear índices apropiados en MongoDB
- **Paginación**: Para listas de roles y usuarios

## Riesgos y Mitigaciones

### Riesgo: Pérdida de permisos durante migración
**Mitigación**: Backup completo de base de datos + script de rollback

### Riesgo: Incompatibilidad con código existente
**Mitigación**: Mantener compatibilidad con AccessControl actual durante transición

### Riesgo: Complejidad de interfaz de usuario
**Mitigación**: Diseño intuitivo con ejemplos y validaciones

## Métricas de Éxito

1. **Funcionalidad**: Todos los roles iniciales funcionan correctamente
2. **Usabilidad**: Administradores pueden crear roles personalizados fácilmente
3. **Rendimiento**: Sin degradación significativa en tiempos de respuesta
4. **Seguridad**: No hay vulnerabilidades de escalada de privilegios
5. **Mantenibilidad**: Código fácil de extender para nuevos recursos/acciones

## Próximos Pasos

Una vez aprobado este plan, procederemos con la implementación siguiendo las fases descritas. El sistema mantendrá compatibilidad con la implementación actual mientras agrega las funcionalidades requeridas.

---

**Fecha**: Diciembre 2024
**Versión**: 1.0
**Autor**: Arquitecto del Sistema SIMR
# Sistema de Roles y Permisos - SIMR

## 📋 Descripción

Sistema completo de **Roles y Permisos (RBAC)** para el Sistema de Información Musical de Repertorio (SIMR). Implementa autenticación basada en roles con herencia, permisos granulares, auditoría completa y caché de permisos en memoria.

## 🎯 Características Principales

- ✅ **5 Roles del Sistema** con jerarquía y herencia de permisos
- ✅ **Permisos Granulares** con scopes (any/own) por recurso y acción
- ✅ **Herencia de Roles** - Los roles superiores heredan permisos de los inferiores
- ✅ **Caché de Permisos** en memoria con TTL de 5 minutos
- ✅ **Auditoría Completa** de todos los cambios en roles y asignaciones
- ✅ **Permisos Personalizados** por usuario (customPermissions)
- ✅ **Middleware de Autorización** fácil de usar en rutas
- ✅ **API REST Completa** para gestión de roles y permisos

## 🏗️ Arquitectura

### Jerarquía de Roles

```
admin (prioridad: 100)
  └─> bibliotecologo (prioridad: 70)
      └─> catalogador (prioridad: 50)
          └─> investigador (prioridad: 30)
              └─> lector (prioridad: 10)
```

**Herencia**: Cada rol hereda TODOS los permisos de los roles de menor prioridad.

### Componentes Implementados

```
simr-back/
├── app/
│   ├── models/
│   │   ├── role.server.model.js          # Modelo de roles con permisos
│   │   ├── auditlog.server.model.js      # Modelo de auditoría
│   │   └── user.server.model.js          # Modelo actualizado con roles[]
│   ├── services/
│   │   └── permission.service.js         # Servicio de permisos con caché
│   ├── middleware/
│   │   └── authorize.middleware.js       # Middlewares de autorización
│   ├── controllers/
│   │   ├── roles.server.controller.js    # CRUD de roles
│   │   └── auditlog.server.controller.js # Consulta de logs
│   └── routes/
│       ├── roles.server.routes.js        # Endpoints de roles
│       └── auditlog.server.routes.js     # Endpoints de auditoría
├── init-roles.js                         # Script: Crear roles del sistema
├── assign-admin.js                       # Script: Asignar rol admin
└── setup-roles.js                        # Script: Setup completo
```

## 🚀 Instalación y Configuración

### 1. Inicializar Roles del Sistema

Ejecuta uno de estos comandos desde `simr-back/`:

**Opción A: Setup completo (recomendado)**
```bash
# Crea roles Y asigna admin a un usuario
node setup-roles.js admin
```

**Opción B: Solo crear roles**
```bash
node init-roles.js
```

**Opción C: Solo asignar admin**
```bash
# Primero ejecuta init-roles.js, luego:
node assign-admin.js admin
```

### 2. Verificar Roles Creados

Los roles creados son:

| Rol                | Prioridad | Permisos Directos | Hereda de      | Descripción                       |
| ------------------ | --------- | ----------------- | -------------- | --------------------------------- |
| **lector**         | 10        | 31                | -              | Solo lectura de recursos públicos |
| **investigador**   | 30        | 18                | lector         | Gestión de sus propios proyectos  |
| **catalogador**    | 50        | 57                | investigador   | Crear y editar catálogos          |
| **bibliotecologo** | 70        | 18                | catalogador    | Gestión completa de colecciones   |
| **admin**          | 100       | 12                | bibliotecologo | Acceso total al sistema           |

**Total de permisos únicos**: ~136 permisos combinados

### 3. Permisos por Recurso

Cada recurso tiene 4 acciones principales:
- `create` - Crear nuevos registros
- `read` - Leer/consultar registros
- `update` - Actualizar registros existentes
- `delete` - Eliminar registros

**Scopes**:
- `own` - Solo sobre recursos propios del usuario
- `any` - Sobre cualquier recurso del sistema

**Recursos del sistema**:
```
obras, actores, recursos, generos, generosnomusicales, materias, 
instrumentos, proyectos, medios, sistemas, fondos, colecciones, 
ejemplares, idiomas, diccionarios, archivos, users, roles
```

## 📖 Uso en el Código

### 1. Proteger Rutas con Middleware

```javascript
const requireAuth = require('../middleware/authJwt');
const { authorize, hasRole, isAdmin } = require('../middleware/authorize.middleware');

// Solo usuarios autenticados
app.route('/api/obras')
  .get(requireAuth, obras.list);

// Solo usuarios con permiso específico
app.route('/api/obras')
  .post(requireAuth, authorize('obras', 'create'), obras.create);

// Solo administradores
app.route('/api/users')
  .delete(requireAuth, isAdmin, users.delete);

// Solo usuarios con rol específico
app.route('/api/catalogos')
  .post(requireAuth, hasRole('catalogador'), catalogos.create);

// Múltiples permisos (ANY - al menos uno)
app.route('/api/archivos')
  .post(
    requireAuth, 
    hasAnyPermission([
      { resource: 'archivos', action: 'create' },
      { resource: 'admin', action: 'manage' }
    ]), 
    archivos.upload
  );

// Múltiples permisos (ALL - todos requeridos)
app.route('/api/system/backup')
  .post(
    requireAuth, 
    hasAllPermissions([
      { resource: 'system', action: 'backup' },
      { resource: 'admin', action: 'manage' }
    ]), 
    system.backup
  );
```

### 2. Verificar Permisos en Controladores

```javascript
// En cualquier controlador
const permissionService = require('../services/permission.service');

exports.updateObra = async (req, res) => {
  try {
    const userId = req.user._id;
    const obra = await Obra.findById(req.params.obraId);

    // Verificar si puede editar ESTA obra específica
    const canEdit = await permissionService.hasPermission(
      userId, 
      'obras', 
      'update', 
      obra.createdBy.equals(userId) ? 'own' : 'any'
    );

    if (!canEdit) {
      return res.status(403).json({ message: 'Sin permisos para editar esta obra' });
    }

    // Continuar con la actualización...
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### 3. Verificar Roles Directamente

```javascript
// En el modelo User
const user = await User.findById(userId);

// Verificar si tiene un rol
const isAdmin = await user.isAdmin();
const isCatalogador = await user.hasRole('catalogador');

// Obtener todos los permisos del usuario
const permissions = await user.getAllPermissions();
// Retorna Map: { 'obras:create' => 'any', 'actores:read' => 'own', ... }

// Verificar permiso específico
const canCreateObras = await user.hasPermission('obras', 'create');
const canDeleteAnyObras = await user.hasPermission('obras', 'delete', 'any');
```

### 4. Usar Permission Service

```javascript
const permissionService = require('../services/permission.service');

// Verificar permisos
const canCreate = await permissionService.hasPermission(userId, 'obras', 'create');

// Verificar roles
const isAdmin = await permissionService.isAdmin(userId);
const hasRole = await permissionService.hasRole(userId, 'catalogador');

// Obtener permisos (usa caché de 5 minutos)
const permissions = await permissionService.getUserPermissions(userId);

// Invalidar caché manualmente
permissionService.invalidateUserCache(userId);
permissionService.clearCache(); // Invalidar todo el caché
```

## 🔌 API Endpoints

### Roles

#### Listar todos los roles
```http
GET /api/roles
Authorization: Bearer <token>

Response:
[
  {
    "_id": "...",
    "name": "admin",
    "description": "Administrador del sistema",
    "priority": 100,
    "isSystem": true,
    "permissions": [...],
    "inheritsFrom": [...]
  },
  ...
]
```

#### Obtener roles del sistema
```http
GET /api/roles/system
Authorization: Bearer <token>

Response:
[
  { "name": "admin", "description": "...", "priority": 100 },
  { "name": "bibliotecologo", "description": "...", "priority": 70 },
  ...
]
```

#### Obtener recursos disponibles
```http
GET /api/roles/resources
Authorization: Bearer <token>

Response:
{
  "resources": [
    "obras", "actores", "recursos", "generos", ...
  ],
  "actions": ["create", "read", "update", "delete"],
  "scopes": ["own", "any"]
}
```

#### Crear rol personalizado
```http
POST /api/roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "editor",
  "description": "Editor de contenido",
  "priority": 40,
  "permissions": [
    { "resource": "obras", "action": "create", "scope": "own" },
    { "resource": "obras", "action": "update", "scope": "own" }
  ],
  "inheritsFrom": ["lector"]
}

Response:
{
  "success": true,
  "role": { ... }
}
```

#### Obtener un rol específico
```http
GET /api/roles/:roleId
Authorization: Bearer <token>

Response:
{
  "_id": "...",
  "name": "catalogador",
  "permissions": [...],
  "allPermissions": 106  # Incluye permisos heredados
}
```

#### Actualizar rol
```http
PUT /api/roles/:roleId
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Nueva descripción",
  "permissions": [...]
}

Response:
{
  "success": true,
  "role": { ... }
}
```

#### Eliminar rol
```http
DELETE /api/roles/:roleId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Rol eliminado exitosamente"
}

Error (si es rol del sistema):
{
  "success": false,
  "message": "No se pueden eliminar roles del sistema"
}
```

### Asignación de Roles a Usuarios

#### Asignar rol a usuario
```http
POST /api/users/:userId/roles/:roleId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Rol asignado exitosamente",
  "user": {
    "_id": "...",
    "username": "juanperez",
    "roles": ["roleId1", "roleId2"]
  }
}
```

#### Remover rol de usuario
```http
DELETE /api/users/:userId/roles/:roleId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Rol removido exitosamente"
}
```

#### Obtener roles de un usuario
```http
GET /api/users/:userId/roles
Authorization: Bearer <token>

Response:
{
  "success": true,
  "roles": [
    {
      "_id": "...",
      "name": "catalogador",
      "description": "..."
    }
  ]
}
```

### Auditoría

#### Listar logs de auditoría
```http
GET /api/auditlogs?page=1&limit=20
Authorization: Bearer <token>

Response:
{
  "logs": [
    {
      "_id": "...",
      "action": "role_assigned",
      "performedBy": { "username": "admin", "email": "..." },
      "targetUser": { "username": "juanperez" },
      "role": { "name": "catalogador" },
      "timestamp": "2025-01-10T10:30:00Z",
      "details": { "reason": "Nuevo catalogador" }
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "pages": 8
  }
}
```

#### Logs de un usuario específico
```http
GET /api/auditlogs/user/:userId?page=1&limit=10
Authorization: Bearer <token>
```

#### Logs de un rol específico
```http
GET /api/auditlogs/role/:roleId
Authorization: Bearer <token>
```

#### Logs por tipo de acción
```http
GET /api/auditlogs/action/:action
Authorization: Bearer <token>

# Acciones válidas:
# - role_created
# - role_updated
# - role_deleted
# - role_assigned
# - role_removed
```

#### Estadísticas de auditoría
```http
GET /api/auditlogs/stats
Authorization: Bearer <token>

Response:
{
  "totalLogs": 523,
  "byAction": {
    "role_assigned": 234,
    "role_created": 45,
    "role_updated": 120,
    ...
  },
  "byRole": {
    "admin": 120,
    "catalogador": 250,
    ...
  },
  "recentActivity": [...]
}
```

#### Limpiar logs antiguos
```http
DELETE /api/auditlogs/clean?days=90
Authorization: Bearer <token>

Response:
{
  "success": true,
  "deletedCount": 150,
  "message": "150 logs eliminados (más antiguos de 90 días)"
}
```

## 🧪 Ejemplos de Uso

### Ejemplo 1: Proteger una ruta completa

```javascript
// routes/obras.server.routes.js
const requireAuth = require('../middleware/authJwt');
const { authorize } = require('../middleware/authorize.middleware');
const obras = require('../controllers/obras.server.controller');

module.exports = function(app) {
  app.route('/api/obras')
    .get(requireAuth, obras.list)                                    // Cualquier usuario autenticado
    .post(requireAuth, authorize('obras', 'create'), obras.create);  // Solo con permiso de crear

  app.route('/api/obras/:obraId')
    .get(requireAuth, obras.read)                                    // Cualquier usuario autenticado
    .put(requireAuth, authorize('obras', 'update'), obras.update)    // Solo con permiso de actualizar
    .delete(requireAuth, authorize('obras', 'delete'), obras.delete); // Solo con permiso de eliminar
};
```

### Ejemplo 2: Verificar scope (own vs any)

```javascript
// controllers/obras.server.controller.js
const permissionService = require('../services/permission.service');

exports.update = async (req, res) => {
  try {
    const userId = req.user._id;
    const obra = await Obra.findById(req.params.obraId).populate('createdBy');

    // ¿Esta obra es del usuario actual?
    const isOwner = obra.createdBy._id.equals(userId);
    
    // Determinar scope requerido
    const requiredScope = isOwner ? 'own' : 'any';
    
    // Verificar permiso con scope apropiado
    const hasPermission = await permissionService.hasPermission(
      userId,
      'obras',
      'update',
      requiredScope
    );

    if (!hasPermission) {
      return res.status(403).json({ 
        message: isOwner 
          ? 'No tiene permisos para editar obras' 
          : 'Solo puede editar sus propias obras'
      });
    }

    // Continuar con actualización...
    obra.titulo = req.body.titulo;
    await obra.save();

    res.json({ success: true, obra });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Ejemplo 3: Asignar permisos personalizados

```javascript
// Dar a un usuario permiso especial para eliminar archivos
// (aunque su rol no lo tenga)

const user = await User.findById(userId);

if (!user.customPermissions) {
  user.customPermissions = [];
}

user.customPermissions.push({
  resource: 'archivos',
  action: 'delete',
  scope: 'any'
});

await user.save();

// Invalidar caché de permisos
const permissionService = require('../services/permission.service');
permissionService.invalidateUserCache(userId);
```

### Ejemplo 4: Crear rol personalizado

```javascript
const Role = require('mongoose').model('Role');

// Crear rol de "moderador" entre investigador y catalogador
const moderadorRole = new Role({
  name: 'moderador',
  description: 'Moderador de contenido',
  priority: 40, // Entre investigador (30) y catalogador (50)
  isSystem: false,
  inheritsFrom: [], // Se llenará automáticamente con investigador
  permissions: [
    { resource: 'obras', action: 'update', scope: 'any' },
    { resource: 'actores', action: 'update', scope: 'any' },
    { resource: 'recursos', action: 'delete', scope: 'own' }
  ]
});

await moderadorRole.save();

// Asignar a un usuario
const user = await User.findOne({ username: 'maria' });
user.roles.push(moderadorRole._id);
await user.save();
```

## 🔒 Seguridad y Mejores Prácticas

### 1. Siempre usar requireAuth PRIMERO

```javascript
// ✅ CORRECTO
app.route('/api/obras')
  .post(requireAuth, authorize('obras', 'create'), obras.create);

// ❌ INCORRECTO - authorize no funcionará sin autenticación
app.route('/api/obras')
  .post(authorize('obras', 'create'), obras.create);
```

### 2. No modificar roles del sistema

Los roles con `isSystem: true` NO deben:
- Eliminarse
- Cambiar su nombre
- Cambiar su prioridad

```javascript
// El controlador ya previene esto, pero como buena práctica:
if (role.isSystem) {
  throw new Error('No se pueden modificar roles del sistema');
}
```

### 3. Invalidar caché al cambiar roles

```javascript
const permissionService = require('../services/permission.service');

// Después de asignar/remover rol
user.roles.push(roleId);
await user.save();
permissionService.invalidateUserCache(user._id);

// Después de modificar un rol
role.permissions.push(newPermission);
await role.save();
permissionService.clearCache(); // Invalidar TODOS los usuarios
```

### 4. Usar auditoría para cambios críticos

```javascript
const AuditLog = require('mongoose').model('AuditLog');

// Registrar operación crítica
await AuditLog.create({
  action: 'role_assigned',
  performedBy: adminUser._id,
  targetUser: user._id,
  role: role._id,
  details: {
    reason: 'Promoción a catalogador',
    approvedBy: 'Director'
  }
});
```

## 🧹 Mantenimiento

### Limpiar logs antiguos (automático)

```javascript
// Ejecutar periódicamente (cron job recomendado)
const AuditLog = require('mongoose').model('AuditLog');

// Eliminar logs de más de 90 días
const deleted = await AuditLog.cleanOldLogs(90);
console.log(`${deleted} logs eliminados`);
```

### Verificar integridad de roles

```javascript
// Script de verificación (ejecutar manualmente cuando sea necesario)
const Role = require('mongoose').model('Role');

const roles = await Role.find({ isSystem: true });

if (roles.length !== 5) {
  console.error('¡ALERTA! Faltan roles del sistema');
  console.log('Ejecute: node init-roles.js');
}

// Verificar prioridades
const priorities = roles.map(r => r.priority).sort((a, b) => a - b);
const expectedPriorities = [10, 30, 50, 70, 100];

if (JSON.stringify(priorities) !== JSON.stringify(expectedPriorities)) {
  console.error('¡ALERTA! Prioridades incorrectas');
}
```

## 📊 Monitoreo y Debugging

### Ver permisos efectivos de un usuario

```javascript
const user = await User.findById(userId).populate('roles');
const allPermissions = await user.getAllPermissions();

console.log(`Usuario: ${user.username}`);
console.log(`Roles: ${user.roles.map(r => r.name).join(', ')}`);
console.log(`Total de permisos: ${allPermissions.size}`);

// Ver permisos detallados
for (const [key, scope] of allPermissions) {
  const [resource, action] = key.split(':');
  console.log(`  ${resource}.${action} => ${scope}`);
}
```

### Debug del caché de permisos

```javascript
const permissionService = require('../services/permission.service');

// Ver estadísticas del caché
const stats = permissionService.getCacheStats(); // Implementar si es necesario
console.log('Caché de permisos:', stats);

// Limpiar caché para debug
permissionService.clearCache();
console.log('Caché limpiado');
```

## ⚠️ Troubleshooting

### Problema: Usuario no tiene permisos esperados

**Solución**:
1. Verificar que los roles están asignados:
   ```javascript
   const user = await User.findById(userId).populate('roles');
   console.log('Roles:', user.roles);
   ```

2. Verificar permisos del rol:
   ```javascript
   const role = await Role.findById(roleId);
   const allPerms = role.getAllPermissions();
   console.log('Permisos totales:', allPerms.size);
   ```

3. Invalidar caché:
   ```javascript
   permissionService.invalidateUserCache(userId);
   ```

### Problema: Middleware de autorización no funciona

**Causas comunes**:
- No llamar `requireAuth` antes de `authorize`
- Usuario no tiene `_id` en `req.user`
- Scope incorrecto (own vs any)

**Verificación**:
```javascript
// Agregar debug al middleware
app.use((req, res, next) => {
  console.log('User:', req.user);
  console.log('Auth:', req.isAuthenticated());
  next();
});
```

### Problema: Roles no se heredan correctamente

**Solución**:
- Verificar que `inheritsFrom` está poblado correctamente
- El método `getAllPermissions()` hace recursión automática
- Asegurarse de que las prioridades están en orden

## 🎓 Preguntas Frecuentes

**¿Puedo tener múltiples roles?**
Sí, un usuario puede tener múltiples roles. Los permisos se combinan (unión).

**¿Qué pasa si hay conflictos de permisos?**
Se usa el scope más permisivo. Si un rol da `own` y otro `any`, se usa `any`.

**¿Los customPermissions sobreescriben los permisos de roles?**
Sí, los `customPermissions` tienen prioridad sobre los permisos de roles.

**¿Cuánto dura el caché de permisos?**
5 minutos (TTL: 300 segundos). Configurable en `permission.service.js`.

**¿Se auditan los cambios en customPermissions?**
Actualmente no. Solo se auditan cambios en roles. Puedes implementarlo manualmente.

**¿Puedo agregar más recursos y acciones?**
Sí, los recursos y acciones son dinámicos. Solo agrega permisos con los nuevos valores.

## 📝 Changelog

### Versión 1.0.0 (2025-01-10)

- ✅ Implementación inicial del sistema de roles
- ✅ 5 roles del sistema con herencia
- ✅ Permisos granulares con scope (own/any)
- ✅ Caché de permisos en memoria
- ✅ Auditoría completa de cambios
- ✅ API REST completa
- ✅ Scripts de inicialización
- ✅ Middleware de autorización
- ✅ Documentación completa

---

## 🤝 Contribuciones

Para agregar nuevos roles o permisos, sigue estas pautas:

1. **Nuevos recursos**: Agrega a `AVAILABLE_RESOURCES` en `role.server.model.js`
2. **Nuevas acciones**: Agrega a `VALID_ACTIONS` en `role.server.model.js`
3. **Nuevos roles del sistema**: Modifica `createSystemRoles()` en `role.server.model.js`
4. **Nuevos tipos de auditoría**: Agrega a `VALID_ACTIONS` en `auditlog.server.model.js`

---

**Sistema implementado y documentado por:** GitHub Copilot  
**Fecha:** Enero 2025  
**Versión:** 1.0.0

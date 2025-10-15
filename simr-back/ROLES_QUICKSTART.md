# 🚀 Inicio Rápido - Sistema de Roles

## ⚡ Configuración en 3 pasos

### 1️⃣ Inicializar roles y asignar admin

```bash
cd simr-back
node setup-roles.js admin
```

**¿Qué hace esto?**
- Crea los 5 roles del sistema (lector, investigador, catalogador, bibliotecologo, admin)
- Asigna el rol "admin" al usuario "admin"

### 2️⃣ Probar que todo funciona

```bash
node test-roles.js
```

**¿Qué verifica?**
- ✅ Existencia de los 5 roles
- ✅ Herencia de permisos
- ✅ Permisos de usuarios
- ✅ Caché de permisos
- ✅ Sistema de auditoría
- ✅ Métodos del modelo User

### 3️⃣ Usar en tus rutas

```javascript
const requireAuth = require('../middleware/authJwt');
const { authorize, isAdmin } = require('../middleware/authorize.middleware');

// Proteger ruta
app.route('/api/obras')
  .post(requireAuth, authorize('obras', 'create'), obras.create);

// Solo administradores
app.route('/api/users')
  .delete(requireAuth, isAdmin, users.delete);
```

## 📚 Documentación Completa

Lee [`ROLES_PERMISOS.md`](./ROLES_PERMISOS.md) para:
- Arquitectura del sistema
- API completa de endpoints
- Ejemplos de uso avanzados
- Troubleshooting
- Mejores prácticas

## 🔑 Jerarquía de Roles

```
admin (100) - Acceso total
  └─> bibliotecologo (70) - Gestión de colecciones
      └─> catalogador (50) - Crear catálogos
          └─> investigador (30) - Gestión de proyectos
              └─> lector (10) - Solo lectura
```

## 🛠️ Scripts Disponibles

| Script                            | Descripción                    |
| --------------------------------- | ------------------------------ |
| `node setup-roles.js <username>`  | Setup completo (roles + admin) |
| `node init-roles.js`              | Solo crear roles del sistema   |
| `node assign-admin.js <username>` | Asignar admin a usuario        |
| `node test-roles.js`              | Ejecutar pruebas del sistema   |

## ⚙️ API Endpoints Principales

```http
GET    /api/roles              # Listar roles
POST   /api/roles              # Crear rol personalizado
GET    /api/roles/system       # Roles del sistema
GET    /api/roles/:roleId      # Obtener rol específico

POST   /api/users/:userId/roles/:roleId    # Asignar rol
DELETE /api/users/:userId/roles/:roleId    # Remover rol
GET    /api/users/:userId/roles            # Roles de usuario

GET    /api/auditlogs          # Logs de auditoría
GET    /api/auditlogs/stats    # Estadísticas
```

## 🔒 Ejemplo de Uso

```javascript
// Proteger una ruta completa
const requireAuth = require('../middleware/authJwt');
const { authorize, hasRole, isAdmin } = require('../middleware/authorize.middleware');

module.exports = function(app) {
  // Cualquier usuario autenticado puede listar
  app.route('/api/obras')
    .get(requireAuth, obras.list);
  
  // Solo usuarios con permiso 'obras:create'
  app.route('/api/obras')
    .post(requireAuth, authorize('obras', 'create'), obras.create);
  
  // Solo catalogadores
  app.route('/api/catalogos')
    .post(requireAuth, hasRole('catalogador'), catalogos.create);
  
  // Solo administradores
  app.route('/api/users/:userId')
    .delete(requireAuth, isAdmin, users.delete);
};
```

## ✅ Verificación

Después de configurar, verifica con:

```bash
# 1. Ver que los roles existen
curl http://localhost:3000/api/roles/system -H "Authorization: Bearer <token>"

# 2. Ver roles de tu usuario
curl http://localhost:3000/api/users/<userId>/roles -H "Authorization: Bearer <token>"

# 3. Probar protección de rutas
curl -X POST http://localhost:3000/api/obras \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"titulo": "Test"}'
```

## 🆘 Problemas Comunes

**Error: "No se pueden eliminar roles del sistema"**
- Los roles con `isSystem: true` están protegidos contra eliminación

**Error: "Usuario no tiene permisos"**
- Verifica que el usuario tiene el rol asignado: `GET /api/users/:userId/roles`
- Invalida el caché: `permissionService.invalidateUserCache(userId)`

**Los permisos no se heredan**
- Ejecuta `node test-roles.js` para verificar la herencia
- Puede ser necesario recrear roles: `node setup-roles.js`

## 📖 Más Información

- 📘 [Documentación Completa](./ROLES_PERMISOS.md)
- 🏗️ [Arquitectura del Sistema](./ARCHITECTURE.md)

---

**¿Listo?** → `node setup-roles.js admin` y empieza a usar el sistema! 🎉

# Sistema de Guards de Rutas - SIMR

## Resumen

Se ha implementado un sistema completo de **Route Guards** (protección de rutas) que impide el acceso directo a URLs restringidas mediante verificación de permisos. Cuando un usuario intenta acceder a una ruta sin los permisos necesarios, el sistema muestra un mensaje de error y lo redirige.

## Arquitectura

### 1. Servicio de Autorización (`Authorization`)

**Ubicación**: `simr-back/public/core/services/authorization.client.service.js`

Servicio centralizado que contiene toda la lógica de permisos:

```javascript
Authorization.canCreate(resource)    // Verifica si puede crear
Authorization.canEdit(resource)      // Verifica si puede editar
Authorization.canDelete(resource)    // Verifica si puede eliminar
Authorization.canList(resource)      // Verifica si puede listar
Authorization.isAdmin()              // Verifica si es admin
Authorization.hasRole(roleName)      // Verifica rol específico
Authorization.hasAnyRole(roles)      // Verifica múltiples roles
Authorization.requirePermission(permission, resource) // Guard principal
```

### 2. Interceptor de Rutas

**Ubicación**: `simr-back/public/core/core.client.module.js`

Interceptor global que se ejecuta en cada cambio de ruta (`$routeChangeStart`):

```javascript
$rootScope.$on('$routeChangeStart', function(event, next, current) {
  // 1. Verificar autenticación
  // 2. Verificar permisos específicos de la ruta
  // 3. Mostrar SweetAlert si no tiene permisos
  // 4. Redirigir a página anterior o login
});
```

### 3. Configuración de Rutas

Cada ruta ahora tiene metadatos de permisos:

```javascript
.when('/obras/create', {
  templateUrl: 'obras/views/create-obra.client.view.html',
  permission: 'create',    // Tipo de permiso requerido
  resource: 'obras'        // Recurso sobre el que aplica
})
```

## Tipos de Permisos

| Permiso         | Descripción                 | Roles Autorizados                  |
| --------------- | --------------------------- | ---------------------------------- |
| `list` / `read` | Ver listados o detalles     | Todos los autenticados             |
| `create`        | Crear nuevos registros      | Admin, Bibliotecólogo, Catalogador |
| `edit`          | Editar registros existentes | Admin, Bibliotecólogo, Catalogador |
| `delete`        | Eliminar registros          | Admin, Bibliotecólogo, Catalogador |
| `admin`         | Funciones administrativas   | Solo Admin                         |

## Configuración por Módulo

### Rutas Públicas (No requieren autenticación)

```javascript
// authentication.client.routes.js
.when('/login', {
  templateUrl: '/authentication/views/login.client.view.html',
  controller: 'AuthenticationController',
  requireAuth: false  // ← Marca como ruta pública
})
```

**Rutas públicas**:
- `/` - Página principal
- `/login` - Inicio de sesión
- `/signup` - Registro

### Rutas de Contenido (Requieren permisos específicos)

```javascript
// obras.client.routes.js
.when('/obras', {
  templateUrl: 'obras/views/list-obra.client.view.html',
  permission: 'list',
  resource: 'obras'
})
.when('/obras/create', {
  templateUrl: 'obras/views/create-obra.client.view.html',
  permission: 'create',
  resource: 'obras'
})
.when('/obras/:obraId/edit', {
  templateUrl: 'obras/views/edit-obra.client.view.html',
  permission: 'edit',
  resource: 'obras'
})
```

**Recursos protegidos**:
- obras, actores, recursos, ejemplares
- proyectos, fondos, colecciones
- instrumentos, medios, sistemas, materias
- generos, generosnomusicales, idiomas, diccionarios

### Rutas Administrativas (Solo Admin)

```javascript
// admin.client.routes.js
.when('/admin/usuarios', {
  templateUrl: '/admin/views/usuarios-lista.client.view.html',
  controller: 'UsuariosListaController',
  permission: 'admin',
  resource: 'usuarios'
})
```

**Rutas admin**:
- `/admin/usuarios` - Gestión de usuarios
- `/admin/roles` - Gestión de roles

## Flujo de Protección

### 1. Usuario intenta acceder a URL directamente

```
Usuario escribe: http://localhost/#!/obras/create
```

### 2. Interceptor captura el cambio de ruta

```javascript
$routeChangeStart ejecuta:
  ├─ ¿Es ruta pública? NO
  ├─ ¿Usuario autenticado? SÍ
  ├─ ¿Tiene permission: 'create'? Verificando...
  └─ Authorization.requirePermission('create', 'obras')
```

### 3. Verificación de permisos

```javascript
Authorization.requirePermission('create', 'obras')
  ├─ ¿Usuario autenticado? SÍ
  ├─ canCreate('obras')
  │   ├─ ¿Es Admin? NO
  │   ├─ ¿Es Lector? SÍ
  │   └─ DENEGADO (lector no puede crear)
  └─ Resultado: FALSE
```

### 4. Acción según resultado

**SI TIENE PERMISOS**:
- ✅ Continúa cargando la ruta
- Usuario ve la página normalmente

**SI NO TIENE PERMISOS**:
- ❌ `event.preventDefault()` - Cancela navegación
- � `$location.path("/")` - Redirige INMEDIATAMENTE a página principal
- �🔔 Muestra SweetAlert después de 100ms:
  ```
  Título: "Acceso denegado"
  Mensaje: "No tienes permisos para acceder a esta función"
  Icono: error
  ```

**SI NO ESTÁ AUTENTICADO**:
- ❌ `event.preventDefault()` - Cancela navegación
- 🔄 `$location.path("/login")` - Redirige INMEDIATAMENTE a login
- 🔔 Muestra SweetAlert después de 100ms:
  ```
  Título: "Acceso denegado"
  Mensaje: "Debes iniciar sesión para acceder a esta página"
  Icono: warning
  ```

> ⚠️ **Nota importante**: La redirección ocurre ANTES de mostrar el SweetAlert para evitar loops infinitos. El mensaje se muestra después de un delay de 100ms.

## Mensajes de Error

### Usuario no autenticado

```javascript
// Usuario no autenticado intenta acceder a ruta protegida
event.preventDefault();
$location.path("/login"); // Redirige INMEDIATAMENTE

// Luego muestra el mensaje (después de 100ms)
setTimeout(function() {
  Swal.fire({
    title: 'Acceso denegado',
    text: 'Debes iniciar sesión para acceder a esta página',
    icon: 'warning',
    confirmButtonText: 'Aceptar'
  });
}, 100);
```

### Usuario sin permisos

```javascript
// Usuario sin permisos intenta acceder a ruta restringida
event.preventDefault();
$location.path("/"); // Redirige INMEDIATAMENTE a página principal

// Luego muestra el mensaje (después de 100ms)
setTimeout(function() {
  Swal.fire({
    title: 'Acceso denegado',
    text: 'No tienes permisos para acceder a esta función',
    icon: 'error',
    confirmButtonText: 'Aceptar'
  });
}, 100);
```

> **Importante**: La redirección ocurre ANTES del SweetAlert para evitar loops infinitos donde el usuario queda atrapado en la misma ruta.

## Ejemplos de Uso

### Ejemplo 1: Usuario Lector intenta crear una obra

```
1. Lector escribe: http://localhost/#!/obras/create
2. Guard verifica: permission: 'create', resource: 'obras'
3. Authorization.canCreate('obras')
   - Lector NO puede crear
   - Retorna: false
4. event.preventDefault() - Cancela navegación
5. $location.path("/") - Redirige inmediatamente a localhost
6. SweetAlert muestra error (después de 100ms)
7. Usuario queda en localhost (/) con mensaje de error
```

### Ejemplo 2: Usuario Catalogador intenta gestionar usuarios

```
1. Catalogador escribe: http://localhost/#!/admin/usuarios
2. Guard verifica: permission: 'admin', resource: 'usuarios'
3. Authorization.requirePermission('admin', 'usuarios')
   - Catalogador NO es Admin
   - Retorna: false
4. event.preventDefault() - Cancela navegación
5. $location.path("/") - Redirige inmediatamente a localhost
6. SweetAlert muestra error (después de 100ms)
7. Usuario queda en localhost (/) con mensaje de error
```

### Ejemplo 3: Usuario Admin crea una obra

```
1. Admin escribe: http://localhost/#!/obras/create
2. Guard verifica: permission: 'create', resource: 'obras'
3. Authorization.canCreate('obras')
   - Admin puede TODO
   - Retorna: true
4. ✅ Página se carga normalmente
```

## Archivos Modificados

### Nuevos Archivos

1. **`simr-back/public/core/services/authorization.client.service.js`**
   - Servicio centralizado de autorización

2. **`Scripts Powershell/add-route-permissions.ps1`**
   - Script para agregar permisos a todas las rutas automáticamente

### Archivos Modificados

1. **`simr-back/public/core/core.client.module.js`**
   - Agregado interceptor de rutas `$routeChangeStart`

2. **`simr-back/public/core/controllers/core.client.controller.js`**
   - Refactorizado para usar servicio Authorization

3. **`simr-back/app/views/index.ejs`**
   - Agregada carga del servicio Authorization

4. **Todos los archivos `*.client.routes.js`** (18 archivos)
   - Agregados metadatos de permisos: `permission` y `resource`
   - Rutas públicas marcadas con `requireAuth: false`

## Pruebas

### Caso 1: Acceso directo sin autenticación

```bash
# En navegador (sin login)
http://localhost/#!/obras/create

Resultado esperado:
✅ SweetAlert: "Debes iniciar sesión"
✅ Redirige a /login
```

### Caso 2: Acceso con rol insuficiente

```bash
# Como Lector
http://localhost/#!/obras/create

Resultado esperado:
✅ Redirige INMEDIATAMENTE a http://localhost/#!/
✅ SweetAlert: "No tienes permisos" (después de 100ms)
✅ Usuario queda en página principal
✅ NO hay loop infinito
```

### Caso 3: Acceso a admin sin ser admin

```bash
# Como Catalogador
http://localhost/#!/admin/usuarios

Resultado esperado:
✅ Redirige INMEDIATAMENTE a http://localhost/#!/
✅ SweetAlert: "No tienes permisos" (después de 100ms)
✅ Usuario queda en página principal
✅ NO hay loop infinito
```

### Caso 4: Acceso legítimo

```bash
# Como Admin
http://localhost/#!/obras/create

Resultado esperado:
✅ Página carga correctamente
✅ No hay mensajes de error
```

## Debugging

### Ver permisos en consola

```javascript
// En consola del navegador
angular.element(document.body).scope().$root.auth.currentUser.roles

// Verificar si puede crear
angular.element(document.body).injector().get('Authorization').canCreate('obras')

// Verificar si es admin
angular.element(document.body).injector().get('Authorization').isAdmin()
```

### Logs del interceptor

El interceptor hace console.log de cada cambio de ruta:
```
Route change detected: /obras/create
Usuario sin permisos suficientes: create obras
```

## Seguridad Multinivel

Este sistema proporciona **3 capas de seguridad**:

1. **UI/Menú**: Oculta opciones que el usuario no puede usar
2. **Route Guards** ← ESTA CAPA: Bloquea acceso directo a URLs
3. **Backend**: Valida permisos en cada endpoint API

> ⚠️ **Importante**: Los guards del frontend NO reemplazan la seguridad del backend. Son complementarios.

## Mejoras Futuras

1. Implementar permisos granulares por registro (ej: solo editar propios recursos)
2. Agregar modo de "solo lectura" para ciertos campos
3. Implementar permisos basados en estado (ej: solo si estado = "borrador")
4. Log de auditoría de intentos de acceso denegados
5. Rate limiting para intentos múltiples de acceso no autorizado

## Soporte

Para reportar problemas o sugerencias:
- GitHub Issues: https://github.com/fernandomoraangel/simr/issues
- Documentación: https://github.com/fernandomoraangel/simr/wiki

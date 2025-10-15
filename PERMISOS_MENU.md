# Sistema de Permisos del Menú - SIMR

## Resumen

Se ha implementado un sistema de control de acceso basado en roles (RBAC) para el menú de navegación. Los elementos del menú ahora aparecen o desaparecen según los roles del usuario autenticado.

## Roles y Jerarquía

| Rol                | Prioridad | Permisos                                |
| ------------------ | --------- | --------------------------------------- |
| **admin**          | 100       | Acceso completo a todas las funciones   |
| **bibliotecologo** | 70        | Puede crear y listar todos los recursos |
| **catalogador**    | 50        | Puede crear y listar todos los recursos |
| **investigador**   | 30        | Solo puede listar (no crear)            |
| **lector**         | 10        | Solo puede listar (no crear)            |

## Lógica Implementada

### Funciones de Permisos (CoreController)

Se agregaron 6 funciones helper en `core.client.controller.js`:

1. **`canCreate(resource)`**
   - Admin: ✅ Siempre puede crear
   - Bibliotecólogo: ✅ Puede crear
   - Catalogador: ✅ Puede crear
   - Investigador: ❌ Solo lectura
   - Lector: ❌ Solo lectura

2. **`canList(resource)`**
   - Todos los usuarios autenticados: ✅ Pueden listar

3. **`isAdmin()`**
   - Solo usuarios con rol "admin": ✅

4. **`hasRole(roleName)`**
   - Verifica si el usuario tiene un rol específico

5. **`hasAnyRole(roleNames)`**
   - Verifica si el usuario tiene alguno de los roles especificados

6. **`isOnlyRole(roleName)`**
   - Verifica si el usuario tiene SOLO ese rol (no roles superiores)

### Aplicación en el Menú

En `core.client.view.html` se aplicaron las siguientes directivas:

#### Menús de Contenido (Obras, Recursos, Proyectos, Fondos, Términos)

```html
<!-- Items de CREAR: Solo Admin, Bibliotecólogo, Catalogador -->
<li data-ng-if="canCreate()">
  <a href="/#!/obras/create">Crear obra</a>
</li>

<!-- Items de LISTAR: Todos los usuarios autenticados -->
<li>
  <a href="/#!/obras">Listar obras</a>
</li>
```

#### Menú de Administración

```html
<!-- TODO el menú: Solo Admin -->
<li class="dropdown" data-ng-if="isAdmin()">
  <a href="#">Administración</a>
  <ul class="dropdown-menu">
    <li><a href="/#!/admin/usuarios">Gestión de Usuarios</a></li>
    <li><a href="/#!/admin/roles">Gestión de Roles</a></li>
  </ul>
</li>
```

## Vista del Menú por Rol

### Admin (100)
✅ Ve TODO:
- Crear obra, Listar obras
- Crear actor, Listar actores
- Crear Recurso, Listar Recursos
- Crear Ejemplar, Listar Ejemplares
- Crear Proyecto, Listar Proyectos
- Crear Fondo, Listar Fondos
- Crear Colección, Listar Colecciones
- Crear Instrumento, Listar Instrumentos
- (y todos los términos...)
- **Administración** (Gestión de Usuarios y Roles)

### Bibliotecólogo (70) y Catalogador (50)
✅ Ve:
- Crear obra, Listar obras
- Crear actor, Listar actores
- Crear Recurso, Listar Recursos
- Crear Ejemplar, Listar Ejemplares
- Crear Proyecto, Listar Proyectos
- Crear Fondo, Listar Fondos
- Crear Colección, Listar Colecciones
- Crear Instrumento, Listar Instrumentos
- (y todos los términos...)

❌ NO ve:
- **Administración**

### Investigador (30) y Lector (10)
✅ Ve SOLO:
- Listar obras
- Listar actores
- Listar Recursos
- Listar Ejemplares
- Listar Proyectos
- Listar Fondos
- Listar Colecciones
- Listar Instrumentos
- (y todos los listar de términos...)

❌ NO ve:
- Ningún "Crear..."
- **Administración**

## Cómo Probar

### 1. Crear Usuarios de Prueba

Conectarse como **admin** y crear usuarios con diferentes roles:

```
Usuario Admin:
- Email: admin@simr.com
- Password: admin123
- Roles: admin

Usuario Catalogador:
- Email: catalogador@simr.com
- Password: cat123
- Roles: catalogador

Usuario Lector:
- Email: lector@simr.com
- Password: lec123
- Roles: lector
```

### 2. Verificar el Menú

1. **Como Admin (admin@simr.com)**:
   - Debería ver TODOS los menús incluido "Administración"
   - Todos los dropdowns deben tener opciones "Crear..." y "Listar..."

2. **Como Catalogador (catalogador@simr.com)**:
   - Debería ver todos los menús EXCEPTO "Administración"
   - Todos los dropdowns deben tener opciones "Crear..." y "Listar..."

3. **Como Lector (lector@simr.com)**:
   - Debería ver todos los menús EXCEPTO "Administración"
   - Todos los dropdowns deben tener SOLO opciones "Listar..." (sin "Crear...")

### 3. Verificar en Consola del Navegador

Para debugging, puedes verificar en la consola:

```javascript
// Ver el usuario actual
angular.element(document.body).scope().$root.auth.currentUser

// Ver si puede crear
angular.element(document.body).scope().$root.canCreate()

// Ver si es admin
angular.element(document.body).scope().$root.isAdmin()
```

## Archivos Modificados

### Backend

1. **`simr-back/config/strategies/local.js`**
   - Agregado `.populate('roles', 'name displayName description priority')` al buscar usuario en login
   - Esto asegura que los roles estén disponibles cuando el usuario inicia sesión

2. **`simr-back/config/strategies/jwt.js`**
   - Agregado `.populate('roles', 'name displayName description priority')` al buscar usuario por JWT
   - Esto asegura que los roles estén disponibles en cada verificación de token

3. **`simr-back/app/controllers/users.server.controller.js`**
   - Agregado `.populate('roles', 'name displayName description priority')` en el método `refreshToken`
   - Esto asegura que los roles estén disponibles cuando se renueva el token

### Frontend

1. **`simr-back/public/core/controllers/core.client.controller.js`**
   - Agregadas 6 funciones de permisos

2. **`simr-back/public/core/views/core.client.view.html`**
   - Agregados `data-ng-if="canCreate()"` a todos los items "Crear..."
   - Cambiado `data-ng-if="auth.isAuthenticated"` a `data-ng-if="isAdmin()"` en menú "Administración"

## Notas Técnicas

- **Herencia de Roles**: Un usuario puede tener múltiples roles. La lógica toma el rol de mayor prioridad.
- **Admin Override**: El rol `admin` siempre tiene acceso completo, independientemente de otros roles.
- **Seguridad Backend**: Estos controles son de UI. El backend ya tiene control de acceso implementado en los controladores y rutas.
- **Performance**: Las funciones usan el objeto `auth.currentUser` que ya está cargado, no hay llamadas adicionales al servidor.

## Mejoras Futuras

1. Implementar permisos granulares por recurso (ej: puede crear obras pero no actores)
2. Agregar indicadores visuales cuando un usuario intenta acceder a una función sin permisos
3. Implementar permisos de "edición propia" vs "edición de otros"
4. Agregar logs de auditoría cuando se intenta acceder a funciones sin permisos

## Troubleshooting

### El menú de Administración no aparece para el usuario admin

**Problema**: El usuario admin inicia sesión pero no ve el menú "Administración".

**Causa**: Los roles no estaban siendo populados cuando el usuario se autentica. El objeto `user.roles` contenía solo IDs de MongoDB en lugar de los objetos completos de roles con el campo `name`.

**Solución Implementada**:
- Agregado `.populate('roles', 'name displayName description priority')` en:
  - Estrategia local de Passport (`local.js`)
  - Estrategia JWT de Passport (`jwt.js`)
  - Método `refreshToken` del controlador de usuarios

Ahora cuando un usuario inicia sesión o verifica su token, los roles se populan correctamente y están disponibles en el frontend.

### Los roles se muestran como IDs en lugar de nombres

**Solución**: Asegurarse de que todas las consultas que devuelven usuarios incluyan `.populate('roles')`.

### El menú no se actualiza al cambiar roles de un usuario

**Solución**: El usuario debe cerrar sesión y volver a iniciar sesión para que los cambios en sus roles se reflejen en el menú.

## Soporte

Para reportar problemas o sugerencias:
- GitHub Issues: https://github.com/fernandomoraangel/simr/issues
- Documentación: https://github.com/fernandomoraangel/simr/wiki

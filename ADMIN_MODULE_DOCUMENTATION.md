# Interfaz de Administración de Usuarios y Roles

## Resumen

Se ha implementado un módulo completo de administración en AngularJS para gestionar usuarios y roles del sistema SIMR. Este módulo se integra perfectamente con el sistema RBAC backend ya existente.

## Archivos Creados

### Estructura del Módulo Admin
```
simr-back/public/admin/
├── admin.client.module.js          # Módulo principal
├── config/
│   └── admin.client.routes.js     # Configuración de rutas
├── controllers/
│   ├── usuarios-lista.client.controller.js   # Controlador lista usuarios
│   ├── usuarios-form.client.controller.js    # Controlador formulario usuarios
│   ├── roles-lista.client.controller.js      # Controlador lista roles
│   └── roles-form.client.controller.js       # Controlador formulario roles
├── services/
│   └── admin.client.service.js    # Servicio para llamadas API
└── views/
    ├── usuarios-lista.client.view.html   # Vista lista usuarios
    ├── usuarios-form.client.view.html    # Vista formulario usuarios
    ├── roles-lista.client.view.html      # Vista lista roles
    └── roles-form.client.view.html       # Vista formulario roles
```

## Funcionalidades Implementadas

### 1. Gestión de Usuarios
- **Listar usuarios**: Tabla con todos los usuarios, sus roles y fecha de creación
- **Crear usuario**: Formulario para crear nuevos usuarios con asignación de roles
- **Editar usuario**: Modificar información básica y asignar/remover roles
- **Eliminar usuario**: Eliminar usuarios del sistema (con confirmación)
- **Asignación de roles**: Checkboxes para seleccionar múltiples roles por usuario

### 2. Gestión de Roles
- **Listar roles**: Tabla con todos los roles ordenados por prioridad
- **Crear rol**: Formulario completo para crear roles con:
  - Nombre (identificador)
  - Nombre para mostrar
  - Descripción
  - Prioridad (0-100)
  - Marca de rol del sistema
  - Herencia de roles
  - Permisos directos por recurso/acción/scope
- **Editar rol**: Modificar características y permisos de roles existentes
- **Eliminar rol**: Eliminar roles personalizados (roles del sistema están protegidos)

### 3. Sistema de Permisos
El formulario de roles incluye una matriz completa de permisos:
- **18 recursos**: obras, actores, recursos, ejemplares, proyectos, fondos, colecciones, medios, sistemas, materias, generos, instrumentos, idiomas, diccionarios, generosNoMusicales, archivos, users, roles
- **5 acciones**: create, read, update, delete, list
- **2 scopes**: own (propios), any (todos)

## Rutas Disponibles

### Usuarios
- `/#!/admin/usuarios` - Lista de usuarios
- `/#!/admin/usuarios/crear` - Crear nuevo usuario
- `/#!/admin/usuarios/:userId/editar` - Editar usuario

### Roles
- `/#!/admin/roles` - Lista de roles
- `/#!/admin/roles/crear` - Crear nuevo rol
- `/#!/admin/roles/:roleId/editar` - Editar rol

## Integración con el Sistema

### 1. Menú de Navegación
Se agregaron dos opciones al menú "Administración":
- Gestión de Usuarios
- Gestión de Roles

### 2. Módulo Angular
El módulo 'admin' fue registrado en `application.js`:
```javascript
angular.module(mainApplicationModuleName, [
  "ngResource",
  "ngRoute",
  "authentication",
  "core",
  "admin",  // <-- NUEVO
  ...
]);
```

### 3. Scripts Cargados
Se agregaron los scripts en `index.ejs`:
- admin.client.module.js
- admin.client.service.js
- Todos los controladores (4)
- admin.client.routes.js

## API Backend

### Endpoints Utilizados

#### Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/users/:userId` - Obtener usuario
- `POST /api/auth/signup` - Crear usuario
- `PUT /api/users/:userId` - Actualizar usuario
- `DELETE /api/users/:userId` - Eliminar usuario

#### Roles de Usuario
- `GET /api/users/:userId/roles` - Obtener roles de usuario
- `POST /api/users/:userId/roles/:roleId` - Asignar rol a usuario
- `DELETE /api/users/:userId/roles/:roleId` - Remover rol de usuario
- `PUT /api/users/:userId/roles` - Actualizar todos los roles (NUEVO)

#### Roles del Sistema
- `GET /api/roles` - Listar todos los roles
- `GET /api/roles/:roleId` - Obtener rol específico
- `POST /api/roles` - Crear nuevo rol
- `PUT /api/roles/:roleId` - Actualizar rol
- `DELETE /api/roles/:roleId` - Eliminar rol

### Nuevo Endpoint Agregado

Se agregó el endpoint `PUT /api/users/:userId/roles` en:
- **Ruta**: `simr-back/app/routes/roles.server.routes.js`
- **Controlador**: `exports.updateUserRoles` en `simr-back/app/controllers/roles.server.controller.js`

Esta función permite actualizar todos los roles de un usuario en una sola operación, reemplazando los roles existentes con un nuevo conjunto.

## Características de Seguridad

1. **Autenticación**: Todas las vistas verifican que el usuario esté autenticado
2. **Autorización**: Los endpoints requieren rol de administrador (isAdmin middleware)
3. **Validación**: Formularios con validación del lado del cliente
4. **Confirmación**: Operaciones destructivas requieren confirmación del usuario
5. **Auditoría**: Todas las operaciones son registradas en AuditLog
6. **Caché**: Se invalida el caché de permisos tras cambios

## Características de UX

1. **Mensajes claros**: Alerts informativos para éxito y error
2. **Estados de carga**: Indicadores de "Cargando..." y botones deshabilitados
3. **Navegación intuitiva**: Botones "Crear", "Editar", "Eliminar" visibles
4. **Formularios amigables**: Labels claros, placeholders, help-text
5. **Visualización de roles**: Labels con colores para fácil identificación
6. **Protección de datos del sistema**: Roles del sistema no pueden eliminarse
7. **Responsive**: Uso de Bootstrap para diseño adaptable

## Próximos Pasos Sugeridos

1. **Probar el módulo**:
   ```bash
   # Reiniciar el servidor backend
   docker-compose -f docker-compose.dev.yml restart simr-back_dev
   ```

2. **Acceder a la aplicación**:
   - URL: http://localhost:4200
   - Login: admin / admin123
   - Ir a: Administración → Gestión de Usuarios / Gestión de Roles

3. **Verificar funcionalidades**:
   - Crear un usuario de prueba
   - Asignar roles al usuario
   - Crear un rol personalizado
   - Verificar permisos en la matriz

4. **Mejoras futuras** (opcionales):
   - Búsqueda y filtrado en las listas
   - Paginación para grandes volúmenes
   - Exportar/importar roles
   - Vista de permisos efectivos del usuario
   - Historial de cambios desde AuditLog
   - Gráficas de estadísticas de uso

## Notas Técnicas

- Compatible con AngularJS 1.x (legacy)
- Usa Bootstrap 3 para estilos
- Servicios RESTful con promesas
- Patrón MVC estándar de AngularJS
- No requiere dependencias adicionales
- Totalmente integrado con el sistema RBAC existente

## Archivos Modificados

1. `simr-back/public/application.js` - Agregado módulo 'admin'
2. `simr-back/public/core/views/core.client.view.html` - Agregadas opciones al menú
3. `simr-back/app/views/index.ejs` - Agregados scripts del módulo admin
4. `simr-back/app/routes/roles.server.routes.js` - Agregado endpoint PUT /api/users/:userId/roles
5. `simr-back/app/controllers/roles.server.controller.js` - Agregada función updateUserRoles()

## ¡Listo para Usar!

El módulo está completamente implementado y listo para ser usado. Solo necesita reiniciar el contenedor backend para cargar los nuevos archivos.

# Módulo de Auditoría - SIMR

## Resumen

Se ha implementado un **módulo completo de auditoría** que permite visualizar todos los registros de acciones realizadas en el sistema. Este módulo es accesible únicamente para usuarios con rol de **Administrador**.

## Características

### 1. Visualización de Logs

El módulo muestra una tabla completa con todos los registros de auditoría que incluyen:

- **Fecha y hora** de la acción
- **Tipo de acción** realizada (crear rol, asignar rol, etc.)
- **Usuario que realizó la acción**
- **Usuario afectado** (si aplica)
- **Rol afectado** (si aplica)
- **Estado** (éxito o error)
- **Detalles** adicionales (IP, user agent, mensajes de error)

### 2. Filtros Avanzados

Los administradores pueden filtrar los logs por:

- **Tipo de acción**: 
  - Rol Creado
  - Rol Actualizado
  - Rol Eliminado
  - Rol Asignado
  - Rol Removido
  - Permiso Agregado
  - Permiso Removido
  - Permiso Actualizado

- **Rango de fechas**: Desde/Hasta
- **Estado**: Exitosos o Con errores

### 3. Paginación

- 50 registros por página (configurable)
- Navegación entre páginas
- Indicador de página actual y total

### 4. Acciones Disponibles

#### Ver Detalles
Muestra información completa del log en un modal:
- Acción realizada
- Usuario que la realizó
- Fecha y hora exacta
- Usuario afectado (si aplica)
- Rol afectado (si aplica)
- Dirección IP
- Mensajes de error (si los hay)

#### Limpiar Logs Antiguos
Permite eliminar logs más antiguos que un número específico de días:
- Por defecto: 90 días
- Rango permitido: 30-365 días
- Muestra confirmación antes de eliminar
- Informa cuántos registros fueron eliminados

## Acceso

### URL
```
http://localhost/#!/admin/auditoria
```

### Permisos
- **Solo Administradores** pueden acceder
- Protegido con Route Guard
- Si un usuario no admin intenta acceder, es redirigido

### Ubicación en el Menú
```
Menú Principal > Administración > Auditoría del Sistema
```

## Arquitectura Técnica

### Backend

#### Modelo (`auditlog.server.model.js`)
```javascript
{
  action: String,           // Tipo de acción
  performedBy: ObjectId,    // Usuario que realizó la acción
  targetUser: ObjectId,     // Usuario afectado
  targetRole: ObjectId,     // Rol afectado
  changes: Mixed,           // Cambios realizados
  previousState: Mixed,     // Estado anterior
  newState: Mixed,          // Nuevo estado
  ipAddress: String,        // IP del usuario
  userAgent: String,        // Navegador/cliente
  success: Boolean,         // Si fue exitoso
  errorMessage: String,     // Mensaje de error (si hay)
  createdAt: Date,          // Timestamp automático
  updatedAt: Date           // Timestamp automático
}
```

#### Controlador (`auditlog.server.controller.js`)

Métodos disponibles:
- `list()` - Listar logs con filtros y paginación
- `getUserLogs()` - Logs de un usuario específico
- `getRoleLogs()` - Logs de un rol específico
- `getActionLogs()` - Logs de un tipo de acción
- `getStats()` - Estadísticas de auditoría
- `cleanOldLogs()` - Eliminar logs antiguos

#### Rutas (`auditlog.server.routes.js`)

```
GET  /api/auditlogs              - Listar logs (admin)
GET  /api/auditlogs/stats        - Estadísticas (admin)
GET  /api/auditlogs/user/:userId - Logs de usuario
GET  /api/auditlogs/role/:roleId - Logs de rol
GET  /api/auditlogs/action/:action - Logs por acción
POST /api/auditlogs/clean        - Limpiar logs antiguos (admin)
```

### Frontend

#### Módulo AngularJS
```
auditoria/
├── auditoria.client.module.js
├── config/
│   └── auditoria.client.routes.js
├── services/
│   └── auditoria.client.service.js
├── controllers/
│   └── auditoria-lista.client.controller.js
└── views/
    └── auditoria-lista.client.view.html
```

#### Rutas del Frontend
```javascript
/admin/auditoria - Lista de logs (admin only)
```

#### Servicio (`AuditoriaService`)

Métodos disponibles:
```javascript
AuditoriaService.list(params)           // Listar con filtros
AuditoriaService.getStats(days)         // Estadísticas
AuditoriaService.getUserLogs(userId)    // Logs de usuario
AuditoriaService.getRoleLogs(roleId)    // Logs de rol
AuditoriaService.getActionLogs(action)  // Logs por acción
AuditoriaService.cleanOldLogs(days)     // Limpiar antiguos
```

## Tipos de Acciones Registradas

| Acción               | Descripción                     |
| -------------------- | ------------------------------- |
| `role_created`       | Se creó un nuevo rol            |
| `role_updated`       | Se modificó un rol existente    |
| `role_deleted`       | Se eliminó un rol               |
| `role_assigned`      | Se asignó un rol a un usuario   |
| `role_removed`       | Se removió un rol de un usuario |
| `permission_added`   | Se agregó un permiso a un rol   |
| `permission_removed` | Se removió un permiso de un rol |
| `permission_updated` | Se actualizó un permiso         |

## Ejemplos de Uso

### 1. Ver todos los logs recientes
```
1. Como Admin, ir a: Administración > Auditoría del Sistema
2. La página carga automáticamente los 50 logs más recientes
3. Navegar entre páginas con los botones de paginación
```

### 2. Filtrar por tipo de acción
```
1. Seleccionar "Rol Asignado" en el filtro de Acción
2. Click en "Filtrar"
3. Se muestran solo los logs de asignación de roles
```

### 3. Buscar acciones en un rango de fechas
```
1. Seleccionar fecha "Desde": 2025-01-01
2. Seleccionar fecha "Hasta": 2025-01-31
3. Click en "Filtrar"
4. Se muestran solo logs de enero 2025
```

### 4. Ver detalles de un log
```
1. Click en botón "Ver" de cualquier log
2. Se abre modal con detalles completos:
   - Usuario que realizó la acción
   - Fecha exacta
   - IP y navegador
   - Información del cambio realizado
```

### 5. Limpiar logs antiguos
```
1. Click en "Limpiar Logs Antiguos"
2. Especificar días a mantener (ej: 90)
3. Confirmar
4. Sistema elimina logs más antiguos que 90 días
5. Muestra cuántos registros fueron eliminados
```

## Indicadores Visuales

### Badges de Acción
- **Verde** (Creado): Rol Creado, Permiso Agregado
- **Azul** (Actualizado): Rol Actualizado, Permiso Actualizado
- **Rojo** (Eliminado): Rol Eliminado, Permiso Removido
- **Amarillo** (Removido): Rol Removido
- **Primario** (Asignado): Rol Asignado

### Badges de Estado
- **Verde con ✓**: Acción exitosa
- **Rojo con ✗**: Acción con error

## Seguridad

### Niveles de Protección

1. **Frontend (Menú)**: 
   - Opción de Auditoría solo visible para admins
   - `ng-if="isAdmin()"` en el menú

2. **Frontend (Route Guard)**:
   - Ruta protegida con `permission: 'admin'`
   - Redirección automática si no es admin

3. **Backend (API)**:
   - Middleware `isAdmin` en todas las rutas
   - Verificación de token JWT
   - Verificación de rol de administrador

### Información Registrada

Cada log captura:
- **performedBy**: ID del usuario que realizó la acción
- **ipAddress**: Dirección IP del cliente
- **userAgent**: Navegador y sistema operativo
- **timestamp**: Fecha y hora exacta
- **changes**: Detalles de los cambios realizados

## Mantenimiento

### Limpieza Automática (Recomendado)

Para evitar que la base de datos crezca indefinidamente, se recomienda:

1. Configurar un cron job o tarea programada
2. Llamar al endpoint `/api/auditlogs/clean` mensualmente
3. Mantener logs de los últimos 90 días (personalizable)

### Limpieza Manual

Desde la interfaz web:
```
Auditoría > Limpiar Logs Antiguos > Especificar días > Confirmar
```

## Mejoras Futuras

1. **Exportación a CSV/Excel**
   - Descargar logs filtrados
   - Formato para análisis externo

2. **Gráficas y Estadísticas**
   - Dashboard con métricas
   - Gráficos de acciones por tiempo
   - Usuarios más activos

3. **Alertas**
   - Notificaciones de acciones críticas
   - Email cuando se eliminan roles
   - Alertas de accesos sospechosos

4. **Búsqueda Avanzada**
   - Búsqueda por texto en cambios
   - Filtros combinados múltiples
   - Búsqueda por IP

5. **Retención Configurable**
   - Políticas de retención por tipo de acción
   - Retención diferenciada (errores vs éxitos)

## Archivos Creados/Modificados

### Nuevos Archivos (Frontend)
- `simr-back/public/auditoria/auditoria.client.module.js`
- `simr-back/public/auditoria/services/auditoria.client.service.js`
- `simr-back/public/auditoria/config/auditoria.client.routes.js`
- `simr-back/public/auditoria/controllers/auditoria-lista.client.controller.js`
- `simr-back/public/auditoria/views/auditoria-lista.client.view.html`

### Archivos Backend (Ya existían)
- `simr-back/app/models/auditlog.server.model.js`
- `simr-back/app/controllers/auditlog.server.controller.js`
- `simr-back/app/routes/auditlog.server.routes.js`

### Archivos Modificados
- `simr-back/public/application.js` - Agregado módulo 'auditoria'
- `simr-back/app/views/index.ejs` - Agregados scripts del módulo
- `simr-back/public/core/views/core.client.view.html` - Agregado enlace en menú

## Pruebas

### Caso 1: Acceso como Admin
```
1. Login como admin
2. Ir a Administración > Auditoría del Sistema
Resultado esperado: ✅ Página carga con logs
```

### Caso 2: Acceso como No-Admin
```
1. Login como lector o catalogador
2. Intentar acceder a /#!/admin/auditoria
Resultado esperado: ✅ Redirige a / con error "Acceso denegado"
```

### Caso 3: Filtros Funcionando
```
1. Como admin, filtrar por "Rol Asignado"
2. Verificar que solo aparezcan logs de ese tipo
Resultado esperado: ✅ Filtro aplicado correctamente
```

### Caso 4: Ver Detalles
```
1. Click en "Ver" de cualquier log
2. Verificar que muestra información completa
Resultado esperado: ✅ Modal con detalles completos
```

## Soporte

Para reportar problemas o sugerencias:
- GitHub Issues: https://github.com/fernandomoraangel/simr/issues
- Documentación: https://github.com/fernandomoraangel/simr/wiki

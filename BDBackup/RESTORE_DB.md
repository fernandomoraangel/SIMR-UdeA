# Restauración de Base de Datos

## Script de restauración

Un script se ha creado en `simr-back/restore-db.js` para restaurar la base de datos MongoDB desde el backup.

### Uso

```bash
# Desde el directorio raíz del proyecto
cd simr-back
npm run restore-db
```

### Requisitos previos

1. **Docker y docker-compose deben estar instalados**
2. **Los contenedores deben estar corriendo:**
   ```bash
   # Desde el directorio raíz del proyecto
   docker-compose -f docker-compose.dev.yml up -d
   ```
3. Verificar que MongoDB esté disponible:
   ```bash
   docker ps | grep mongodb
   ```

### Qué hace el script

1. Conecta a la base de datos MongoDB (simr-dev)
2. Elimina todas las colecciones existentes (incluyendo índices)
3. Importa los documentos desde `BDBackup/simr-backup-2026-07-25.json`

### Credenciales de acceso

Después de la restauración, los datos incluyen un usuario admin:
- **Username:** admin
- **Email:** admin@simr.com
- **Password:** (hash bcrypt en el backup)

> Nota: Para verificar la contraseña del admin, revisa el campo `password` en el documento del usuario en el backup.

### Solución al error "[object Object]" en el login

El bug donde aparecía `[object Object]` en el login al fallar la autenticación ha sido corregido en:
- `simr-front/src/app/features/auth/login/login.component.ts`

La solución mejora el manejo de errores extrayendo correctamente el mensaje del objeto de error recibido del backend.
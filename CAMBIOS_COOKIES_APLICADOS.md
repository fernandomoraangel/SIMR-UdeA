# ✅ Cambios Aplicados para Solucionar el Problema de Cookies

## 📅 Fecha: 7 de Octubre 2025
## 🎯 Objetivo: Permitir que las cookies funcionen con IP externa (172.23.0.97)

---

## 🔧 Cambios Realizados

### **1. ✅ Modificado: `simr-back/config/cookieConfig.js`**

**Cambios aplicados:**

```javascript
// ANTES:
const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // ❌ Bloqueaba cookies en HTTP
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  path: "/",
};

// DESPUÉS:
const baseCookieOptions = {
  httpOnly: true,
  secure: false, // ✅ Permite cookies en HTTP (desarrollo)
  sameSite: "lax", // ✅ Permite cookies en navegación normal
  path: "/",
  domain: process.env.COOKIE_DOMAIN || undefined, // ✅ Sin domain permite IPs
};
```

**¿Por qué este cambio?**
- `secure: false` → Permite cookies en HTTP (necesario sin HTTPS)
- `sameSite: "lax"` → Permite cookies en peticiones de navegación normales
- `domain: undefined` → Permite que las cookies funcionen con IPs (172.23.0.97)

---

### **2. ✅ Modificado: `simr-back/config/express.js`**

**Cambios aplicados:**

```javascript
// ANTES:
app.use(
  cors({
    origin: [...],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    // ❌ Faltaban headers para cookies
  })
);

// DESPUÉS:
app.use(
  cors({
    origin: [...],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Cookie"], // ✅
    exposedHeaders: ["Set-Cookie"], // ✅ Permite exponer Set-Cookie
  })
);
```

**¿Por qué este cambio?**
- `allowedHeaders: [..., "Cookie"]` → Permite enviar cookies en requests
- `exposedHeaders: ["Set-Cookie"]` → Permite que el navegador lea Set-Cookie
- `methods: [..., "PATCH"]` → Método adicional para APIs RESTful

---

## 📋 Pasos para Aplicar en el Servidor

### **En tu servidor externo, ejecuta:**

```bash
# 1. Detener contenedores
docker-compose -f docker-compose.dev.yml down

# 2. Reconstruir el backend (con los cambios)
docker-compose -f docker-compose.dev.yml build simr-back

# 3. Iniciar todos los servicios
docker-compose -f docker-compose.dev.yml up -d

# 4. Verificar logs del backend
docker logs simr-back_dev -f
```

**Busca en los logs:**
- ✅ `"Token extraído de cookies: Token encontrado"`
- ✅ `"Usuario encontrado: [username]"`
- ❌ No debe aparecer: `"Token extraído de cookies: No token"`

---

## 🧪 Verificación Post-Despliegue

### **1. Verificar que las cookies se crean al hacer login:**

1. Abre el navegador en `http://172.23.0.97`
2. Abre **DevTools** (F12)
3. Ve a **Application** → **Cookies** → `http://172.23.0.97`
4. Haz login
5. **DEBERÍAS VER:**
   - ✅ `accessToken` (con valor largo JWT)
   - ✅ `refreshToken` (con valor largo JWT)

### **2. Verificar en Network que Set-Cookie se envía:**

1. En **DevTools** → **Network**
2. Haz login
3. Busca la petición `POST /api/auth/login`
4. Ve a la pestaña **Headers** → **Response Headers**
5. **DEBERÍAS VER:**
   ```
   Set-Cookie: accessToken=eyJhbG...; Path=/; HttpOnly; SameSite=Lax
   Set-Cookie: refreshToken=eyJhbG...; Path=/; HttpOnly; SameSite=Lax
   ```

### **3. Verificar que la sesión persiste:**

1. Haz login exitosamente
2. **Recarga la página (F5)**
3. **DEBERÍA:**
   - ✅ Seguir autenticado (no redirigir a login)
   - ✅ Ver el nombre del usuario en la UI
   - ✅ No ver errores 401 en la consola

---

## 🐛 Troubleshooting

### **Si las cookies NO aparecen:**

**Problema:** Las cookies no se crean en Application → Cookies

**Posibles causas:**

1. **El contenedor backend no se reconstruyó**
   ```bash
   # Forzar rebuild sin caché
   docker-compose -f docker-compose.dev.yml build --no-cache simr-back
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Navegador bloqueando cookies de terceros**
   - Ve a configuración del navegador
   - Busca "Cookies y datos de sitios"
   - Asegúrate que "Permitir todas las cookies" esté activo

3. **Cache del navegador**
   - Presiona Ctrl+Shift+Delete
   - Borra cookies y caché
   - Recarga la página

---

### **Si sigue sin funcionar después de rebuild:**

**Verificar variables de entorno en el contenedor:**

```bash
# Ver variables JWT en el contenedor
docker exec simr-back_dev env | grep JWT

# Deberías ver:
# JWT_SECRET=simr_jwt_secret_development_2024_secure_key
# JWT_EXPIRATION=900
# JWT_REFRESH_SECRET=simr_jwt_refresh_secret_development_2024_secure_key
# JWT_REFRESH_EXPIRATION=604800
```

**Si falta JWT_REFRESH_SECRET:**
- Editar `.env.development` en el servidor
- Agregar: `JWT_REFRESH_SECRET=simr_jwt_refresh_secret_development_2024_secure_key`
- Rebuild: `docker-compose -f docker-compose.dev.yml up -d --force-recreate`

---

### **Errores comunes y soluciones:**

| Error en Consola                      | Causa                        | Solución                                 |
| ------------------------------------- | ---------------------------- | ---------------------------------------- |
| `401 /api/auth/verify`                | No hay cookies               | Verificar que se crearon en Application  |
| `401 /api/auth/refresh`               | refreshToken no existe       | Verificar JWT_REFRESH_SECRET             |
| `Token extraído de cookies: No token` | Cookies no llegan al backend | Verificar CORS y domain config           |
| `Set-Cookie` no en headers            | CORS no expone Set-Cookie    | Verificar `exposedHeaders` en express.js |

---

## 📊 Comparación Antes/Después

### **ANTES (❌ No funcionaba):**
- Cookies con `secure: true` → Rechazadas en HTTP
- Cookies con `sameSite: strict` → Muy restrictivo
- Sin `domain` config → Problemas con IPs
- CORS sin headers de cookies → Bloqueadas

### **DESPUÉS (✅ Debería funcionar):**
- Cookies con `secure: false` → Funcionan en HTTP
- Cookies con `sameSite: lax` → Permisivo
- `domain: undefined` → Funciona con IPs
- CORS con headers explícitos → Permite cookies

---

## ⚠️ Notas Importantes

### **Para PRODUCCIÓN:**

Si en el futuro despliegas en producción con HTTPS, debes:

1. **Cambiar `cookieConfig.js`:**
   ```javascript
   secure: true,  // ← Cambiar a true
   sameSite: "strict",  // ← Cambiar a strict
   domain: process.env.COOKIE_DOMAIN,  // ← Especificar dominio
   ```

2. **Agregar variable en `.env.production`:**
   ```bash
   COOKIE_DOMAIN=.tudominio.com  # Con punto para subdominios
   ```

### **Seguridad:**

- ✅ `httpOnly: true` está activo → Protege contra XSS
- ⚠️ `secure: false` solo para desarrollo → En prod debe ser `true`
- ✅ `sameSite: lax` protege contra CSRF básico

---

## ✅ Checklist Final

Marca cuando completes cada paso:

- [ ] Archivos modificados subidos al servidor
- [ ] Contenedor `simr-back` reconstruido
- [ ] Logs del backend sin errores
- [ ] Login exitoso (status 200)
- [ ] Cookies visibles en DevTools → Application
- [ ] Sesión persiste al recargar (F5)
- [ ] No hay errores 401 en consola
- [ ] `/api/auth/verify` retorna 200 después de login

---

## 📞 Soporte

Si después de aplicar todos los cambios sigue sin funcionar:

1. Revisar logs del backend: `docker logs simr-back_dev --tail 100`
2. Verificar headers de respuesta en Network → Headers
3. Verificar que el rebuild se hizo correctamente
4. Probar limpiar completamente el navegador (Ctrl+Shift+Delete)

---

**Última actualización:** 7 de Octubre 2025
**Estado:** ✅ Cambios aplicados - Pendiente de pruebas en servidor

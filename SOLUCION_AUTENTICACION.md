# 🔧 Solución al Problema de Autenticación en Servidor Externo

## Resumen del Problema
La autenticación está fallando porque:
1. ❌ Cookies configuradas para HTTPS pero el servidor usa HTTP
2. ❌ CORS bloqueando peticiones desde IP externa (172.23.0.97)
3. ❌ Falta variable de entorno `JWT_REFRESH_SECRET`
4. ⚠️ Configuración de cookies `sameSite: strict` muy restrictiva

## Errores en Consola
```
Failed to load resource: the server responded with a status of 401 (Unauthorized)
/api/auth/verify:1
/api/auth/refresh:1
[Auth] Error al renovar token
```

---

## 🛠️ SOLUCIONES A IMPLEMENTAR

### **1. Agregar Variable de Entorno Faltante**

**Archivo:** `.env.development`

**Agregar esta línea:**
```bash
JWT_REFRESH_SECRET=simr_jwt_refresh_secret_development_2024_secure_key
```

**Línea completa del archivo:**
```bash
NODE_ENV=development
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:4200
ANGULARJS_URL=http://localhost:3000
JWT_SECRET=simr_jwt_secret_development_2024_secure_key
JWT_EXPIRATION=900
JWT_REFRESH_SECRET=simr_jwt_refresh_secret_development_2024_secure_key  # ← AGREGAR ESTA
JWT_REFRESH_EXPIRATION=604800
GOOGLE_CLIENT_ID=tu_google_client_id_dev
GOOGLE_CLIENT_SECRET=tu_google_client_secret_dev
# ... resto del archivo
```

---

### **2. Modificar Configuración de Cookies**

**Archivo:** `simr-back/config/cookieConfig.js`

**Cambiar líneas 7-9:**
```javascript
// ANTES (problemático):
secure: process.env.NODE_ENV === "production",
sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",

// DESPUÉS (corrección):
secure: false,  // Cambiar a false si NO usas HTTPS
sameSite: "lax",  // "lax" permite cookies en navegación normal
```

**⚠️ IMPORTANTE:** 
- Solo cambiar `secure: false` si el servidor **NO tiene HTTPS**
- Si tienes HTTPS configurado, dejar `secure: true`

---

### **3. Actualizar CORS para Permitir IP del Servidor**

**Archivo:** `simr-back/config/express.js`

**Opción A: Agregar IP específica (MÁS SEGURO)**

Líneas 71-82, cambiar a:
```javascript
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [process.env.FRONTEND_URL, process.env.ANGULARJS_URL]
        : [
            "http://localhost:4200",
            "http://localhost:3000",
            "http://localhost",
            "http://172.23.0.97",  // ← Agregar IP del servidor
            "http://172.23.0.97:80",  // ← Con puerto explícito
          ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
```

**Opción B: Permitir cualquier origen en desarrollo (SOLO PARA TESTING)**

```javascript
app.use(
  cors({
    origin: process.env.NODE_ENV === "production"
      ? [process.env.FRONTEND_URL, process.env.ANGULARJS_URL]
      : true,  // ← Permite cualquier origen en desarrollo
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
```

---

### **4. Verificar y Actualizar Variables de Entorno en Docker**

**Archivo:** `docker-compose.dev.yml`

Asegurarse que el servicio `simr-back` tiene:
```yaml
simr-back:
  # ... otras configuraciones
  env_file:
    - ./.env.development  # ✅ Ya está
  environment:
    - NODE_ENV=development  # ✅ Ya está
```

---

### **5. Agregar Headers de Cookies en Nginx**

**Archivo:** `nginx.dev.conf`

En la sección `location /api`, **verificar que tenga** estos headers:
```nginx
location /api {
    proxy_pass http://simr-back:3000;
    proxy_http_version 1.1;
    
    # Headers existentes...
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # ← AGREGAR ESTOS para cookies:
    proxy_set_header Cookie $http_cookie;
    proxy_pass_header Set-Cookie;
    
    # Deshabilitar buffering
    proxy_buffering off;
    proxy_cache_bypass $http_upgrade;
}
```

---

## 📝 PASOS PARA APLICAR LAS SOLUCIONES EN EL SERVIDOR

### En tu servidor externo, debes:

1. **Editar `.env.development`:**
   ```bash
   nano .env.development
   # Agregar: JWT_REFRESH_SECRET=simr_jwt_refresh_secret_development_2024_secure_key
   ```

2. **Editar `simr-back/config/cookieConfig.js`:**
   ```bash
   nano simr-back/config/cookieConfig.js
   # Cambiar secure: false y sameSite: "lax"
   ```

3. **Editar `simr-back/config/express.js`:**
   ```bash
   nano simr-back/config/express.js
   # Agregar la IP del servidor al array de origins
   ```

4. **Reconstruir y reiniciar contenedores:**
   ```bash
   docker-compose -f docker-compose.dev.yml down
   docker-compose -f docker-compose.dev.yml build simr-back
   docker-compose -f docker-compose.dev.yml up -d
   ```

5. **Verificar logs:**
   ```bash
   docker logs simr-back_dev -f
   # Buscar errores de JWT o cookies
   ```

---

## 🧪 Verificación Post-Cambios

### 1. Abrir DevTools del navegador (F12)
### 2. Ir a la pestaña **Application** → **Cookies**
### 3. Verificar que existan:
   - `accessToken`
   - `refreshToken`

### 4. En la pestaña **Network**, hacer login y verificar:
   - Request a `/api/auth/login` → Status 200
   - Response debe tener headers `Set-Cookie`
   - Requests subsecuentes a `/api/auth/verify` → Status 200

---

## 🔍 Debugging Adicional

Si sigue sin funcionar, revisar en el backend:

```bash
# Ver logs detallados del backend
docker logs simr-back_dev --tail 100

# Buscar estos mensajes:
# ✅ "Token extraído de cookies: Token encontrado"
# ✅ "Usuario encontrado: [username]"
# ❌ "Token extraído de cookies: No token" → Las cookies no llegan
# ❌ "Refresh token no encontrado" → Cookie no se envía
```

---

## 📌 Notas Importantes

### Sobre `secure: false`:
- ⚠️ Solo usar en desarrollo sin HTTPS
- En producción con HTTPS, **DEBE ser `true`**

### Sobre CORS con `origin: true`:
- ⚠️ Solo para desarrollo/testing
- En producción, **SIEMPRE** especificar dominios exactos

### Sobre `sameSite`:
- `"strict"` → Cookies solo en el mismo dominio (muy restrictivo)
- `"lax"` → Permite cookies en navegación normal (recomendado)
- `"none"` → Requiere `secure: true` (solo HTTPS)

---

## ✅ Checklist de Verificación

- [ ] Variable `JWT_REFRESH_SECRET` agregada en `.env.development`
- [ ] `cookieConfig.js` actualizado con `secure: false` y `sameSite: "lax"`
- [ ] CORS actualizado en `express.js` con IP del servidor
- [ ] Contenedores reconstruidos y reiniciados
- [ ] Cookies visibles en DevTools → Application → Cookies
- [ ] Login exitoso con status 200
- [ ] `/api/auth/verify` retorna status 200
- [ ] No hay errores 401 en la consola

---

## 🆘 Si Aún No Funciona

Revisar específicamente:
1. ¿La IP `172.23.0.97` es la correcta? Verificar con `docker inspect` de la red
2. ¿Nginx está pasando las cookies? Revisar logs de nginx
3. ¿Las variables de entorno se cargaron? Hacer `docker exec simr-back_dev env | grep JWT`
4. ¿El navegador está bloqueando cookies de terceros? Revisar configuración del navegador


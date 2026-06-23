# 🔐 PLAN DE DESPLIEGUE HTTPS - SIMSR-UdeA

**Fecha de creación:** 23 de junio de 2026  
**Objetivo:** Activar HTTPS en puerto 443 con certificados OV `simsr.udea.edu.co`  
**Duración estimada:** 20-30 minutos

---

## 📋 CONTEXTO

**Del acta de reunión (18-03-2026) con Seguridad UdeA:**
- ✅ CSR enviado el 17-04-2026
- ✅ Certificado OV firmado recibido (`simsr.udea.edu.co.cer`)
- ✅ Estrategia: HTTPS directo en puerto 443 (no HTTP primero)
- ✅ Arquitectura: DMZ + Intranet (sin DNS público hasta aprobar)
- ✅ Próxima fase: Escaneos de vulnerabilidades por Seguridad

**Certificados disponibles:**
- `SSL SIMIR/simsr.udea.edu.co.cer` - Certificado principal
- `SSL SIMIR/IntermedioOV.cer` - Certificado intermedio
- `SSL SIMIR/RootOV.cer` - Certificado raíz

---

## 🚀 FLUJO GENERAL

```
FASE 1: Preparar certificados en servidor        (5 min)
        ↓
FASE 2: Editar configuración en máquina local    (5 min)
        ↓
FASE 3: Actualizar repositorio Git               (2 min)
        ↓
FASE 4: Redeploy en servidor                     (10 min - rebuild puede tardar)
        ↓
FASE 5: Verificar HTTPS funcionando              (5 min)
        ↓
FASE 6: Notificar a Seguridad                    (1 min)
```

---

## 📍 FASE 1: PREPARAR CERTIFICADOS EN SERVIDOR (~5 min via SSH)

### PASO 1A: Crear directorio SSL
```bash
sudo mkdir -p /mnt/data/ssl
cd /mnt/data/ssl
```

**Expected:**
- Directorio creado en `/mnt/data/ssl`
- Usuario actual tiene permisos para acceder

---

### PASO 1B: Transferir certificados a servidor

**Ejecutar en tu máquina (NO en SSH)** en PowerShell:

```powershell
scp "C:\Users\ferna\Documents\Desarrollo\SIMR-UdeA\SSL SIMIR\simsr.udea.edu.co.cer" fma@172.23.0.97:/tmp/
scp "C:\Users\ferna\Documents\Desarrollo\SIMR-UdeA\SSL SIMIR\IntermedioOV.cer" fma@172.23.0.97:/tmp/
scp "C:\Users\ferna\Documents\Desarrollo\SIMR-UdeA\SSL SIMIR\RootOV.cer" fma@172.23.0.97:/tmp/
```

**Expected:**
- 3 archivos `.cer` en `/tmp/` del servidor

---

### PASO 1C: Concatenar certificados (en SSH)

**ORDEN CRÍTICO:** Certificado firmado + intermedio + raíz

```bash
# En servidor via SSH
cat /tmp/simsr.udea.edu.co.cer /tmp/IntermedioOV.cer /tmp/RootOV.cer > /tmp/cert.pem

# Verificar que se creó correctamente
cat /tmp/cert.pem | head -5
```

**Expected:**
- Archivo `cert.pem` contiene la cadena completa de certificados
- Primeras líneas muestran `-----BEGIN CERTIFICATE-----`

---

### PASO 1D: Configurar clave privada (en SSH)

**Si la clave privada ya existe en el servidor:**
```bash
# Copiar desde ubicación existente
sudo cp /ruta/a/simsr_udea_edu_co.key /mnt/data/ssl/key.pem
```

**Si la clave está en tu máquina local:**
```bash
# En tu máquina, transferir:
scp C:\ruta\local\simsr_udea_edu_co.key fma@172.23.0.97:/tmp/

# En servidor via SSH:
sudo mv /tmp/simsr_udea_edu_co.key /mnt/data/ssl/key.pem
```

---

### PASO 1E: Mover archivos finales y configurar permisos (en SSH)

```bash
# Mover certificado concatenado
sudo mv /tmp/cert.pem /mnt/data/ssl/cert.pem

# Configurar propietario y permisos correctos
sudo chown root:root /mnt/data/ssl/cert.pem /mnt/data/ssl/key.pem
sudo chmod 644 /mnt/data/ssl/cert.pem
sudo chmod 600 /mnt/data/ssl/key.pem

# Verificar estructura final
sudo ls -la /mnt/data/ssl/
```

**Expected output:**
```
-rw-r--r-- 1 root root  3456 cert.pem      # Certificado legible
-rw------- 1 root root  1234 key.pem       # Clave privada (solo root)
```

---

## 📝 FASE 2: EDITAR CONFIGURACIÓN EN MÁQUINA LOCAL (~5 min)

### PASO 2A: Actualizar `nginx.prod.conf`

**Archivo:** `nginx.prod.conf`

**Cambio 1 - Descomentar bloque HTTPS (líneas 92-143):**

Busca:
```nginx
# Configuración HTTPS (comentada hasta tener certificados SSL)
# server {
#     listen 443 ssl;
#     http2 on;
#     server_name tu-dominio.com;
```

Reemplaza por:
```nginx
# Configuración HTTPS - ACTIVA
server {
    listen 443 ssl http2;
    server_name simsr.udea.edu.co;

    # Configuración SSL
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/certs/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;

    # ... resto del bloque (descomentar todo hasta cierre de })
```

**Puntos clave a verificar:**
- `server_name` = `simsr.udea.edu.co` (exacto)
- `ssl_certificate` = `/etc/ssl/certs/cert.pem`
- `ssl_certificate_key` = `/etc/ssl/certs/key.pem`

---

**Cambio 2 - Descomentar redirección HTTP→HTTPS (líneas 145-150):**

Busca:
```nginx
# Redirección HTTP a HTTPS (comentada hasta tener certificados SSL)
# server {
#     listen 80;
#     server_name tu-dominio.com;
#     return 301 https://$server_name$request_uri;
# }
```

Reemplaza por:
```nginx
# Redirección HTTP a HTTPS - ACTIVA
server {
    listen 80;
    server_name simsr.udea.edu.co;
    return 301 https://$server_name$request_uri;
}
```

**Expected:**
- Puerto 80 redirige a HTTPS
- `server_name` = `simsr.udea.edu.co`

---

### PASO 2B: Actualizar `docker-compose.prod.yml`

**Archivo:** `docker-compose.prod.yml`

**Cambio - Descomentar volumen SSL (línea ~103):**

Busca:
```yaml
volumes:
  - ./nginx.prod.conf:/etc/nginx/conf.d/default.conf:ro
  # Comentado hasta configurar SSL correctamente
  # - /mnt/data/ssl:/etc/ssl/certs:ro
```

Reemplaza por:
```yaml
volumes:
  - ./nginx.prod.conf:/etc/nginx/conf.d/default.conf:ro
  - /mnt/data/ssl:/etc/ssl/certs:ro
```

**Expected:**
- Volumen SSL está activo y mapeado correctamente

---

### PASO 2C (OPCIONAL): Actualizar `.env.production`

**Archivo:** `.env.production`

**Recomendación para esta fase:** Dejarlo como está (funcionará con IP)

Si deseas actualizar ahora (no es crítico):

Cambiar:
```env
API_URL=http://172.23.0.97/api
FRONTEND_URL=http://172.23.0.97
ANGULARJS_URL=http://172.23.0.97/legacy
ALLOWED_ORIGINS=http://172.23.0.97,http://localhost:4200,http://localhost:3000
```

Por:
```env
API_URL=https://simsr.udea.edu.co/api
FRONTEND_URL=https://simsr.udea.edu.co
ANGULARJS_URL=https://simsr.udea.edu.co/legacy
ALLOWED_ORIGINS=https://simsr.udea.edu.co,http://localhost:4200,http://localhost:3000
```

---

## 🔄 FASE 3: GIT COMMIT + PUSH (~2 min - en tu máquina)

```bash
# En carpeta SIMR-UdeA
cd C:\Users\ferna\Documents\Desarrollo\SIMR-UdeA

# Ver cambios
git status

# Agregar archivos
git add nginx.prod.conf docker-compose.prod.yml
# git add .env.production  (solo si lo editaste)

# Commit
git commit -m "Activar HTTPS en producción con certificados OV simsr.udea.edu.co"

# Push
git push origin main
```

**Expected:**
- Archivos pusheados al repositorio
- Rama actualizada en remoto

---

## 🐳 FASE 4: REDEPLOY EN SERVIDOR (~10 min - vía SSH)

### PASO 4A: Actualizar repositorio
```bash
cd ~/SIMR-UdeA
git pull origin main
```

**Expected:**
- Cambios descargados del repositorio

---

### PASO 4B: Detener despliegue actual
```bash
docker compose -f docker-compose.prod.yml down
```

**Expected:**
- Todos los contenedores detenidos

---

### PASO 4C: Rebuild images
```bash
docker compose -f docker-compose.prod.yml build
```

**⚠️ Nota:** Esto puede tardar 2-5 minutos (descarga/compilación de imágenes)

**Expected:**
- Imagen `nginx` reconstruida con cambios de `nginx.prod.conf`
- Imágenes backend y frontend compiladas

---

### PASO 4D: Iniciar contenedores
```bash
docker compose -f docker-compose.prod.yml up -d
```

**Expected:**
- Todos los contenedores iniciados en background

---

## ✅ FASE 5: VERIFICAR HTTPS (~5 min - vía SSH)

### PASO 5A: Verificar contenedores running
```bash
docker compose -f docker-compose.prod.yml ps
```

**Expected output:**
```
NAME                COMMAND             STATUS      PORTS
nginx_prod          "nginx -g..."      Up          0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
simr-back_prod      "node server.js"   Up          
simr-front_prod     "nginx -g..."      Up          
mongodb_prod        "mongod --auth"    Up          
minio_prod          "minio server"     Up          
minio-init          "/bin/sh -c..."    Exited      
```

---

### PASO 5B: Ver logs de Nginx (verificar errores SSL)
```bash
docker compose -f docker-compose.prod.yml logs -f nginx
```

**Buscar líneas como:**
```
[notice] X#X: signal process started
[notice] X#X nginx/1.XX listening on 0.0.0.0:80
[notice] X#X nginx/1.XX listening on 0.0.0.0:443
```

**Si ves errores SSL:**
- Revisar permisos en `/mnt/data/ssl/`
- Verificar que `cert.pem` y `key.pem` existen
- Controlar que `nginx.prod.conf` tiene rutas correctas

---

### PASO 5C: Probar HTTPS localmente
```bash
# Desde servidor via SSH
curl -k https://localhost/health
```

**Expected output:**
```
healthy
```

**✅ Si ves "healthy" → HTTPS FUNCIONA**

---

### PASO 5D (OPCIONAL): Validar cadena de certificados
```bash
# Ver detalles completos del certificado
openssl s_client -connect localhost:443 -servername simsr.udea.edu.co

# Presionar Ctrl+C para salir
# Buscar al final: "Verify return code: 0 (ok)"
```

**Expected:**
- Certificado válido
- Cadena completa mostrada
- `Verify return code: 0 (ok)`

---

## 📢 FASE 6: NOTIFICAR A SEGURIDAD (~1 min)

Crear comentario en el ticket de soporte o enviar email a David Loaiza:

```
Estimado David,

He completado la instalación del certificado OV para simsr.udea.edu.co.
La aplicación está corriendo en HTTPS en la intranet (puerto 443).

✅ Estado actual:
- Certificados instalados en: /mnt/data/ssl/
- Nginx configurado para puerto 443 (HTTPS + HTTP2)
- Redirección HTTP→HTTPS activa
- Aplicación responde: https://simsr.udea.edu.co/health

📋 Próximos pasos (según acta 18-03-2026):
1. Realizar escaneos de vulnerabilidades (infraestructura + aplicación web)
2. Una vez aprobados, configurar IP pública y DNS público
3. Solicitar CAA records si es necesario

Quedo atento para cualquier ajuste o información adicional requerida.

Saludos,
Fernando Mora Ángel
Sistema SIMSR
```

---

## ⚠️ PUNTOS CRÍTICOS

| Punto | Acción | Impacto si falla |
|-------|--------|-----------------|
| **Orden concatenación** | `cert.pem = cert + intermedio + raíz` | SSL error 20 (unable to get local issuer certificate) |
| **Permisos key.pem** | `600` (solo root lectura) | Nginx no puede leer la clave privada |
| **server_name exacto** | `simsr.udea.edu.co` (sin variaciones) | Certificate name mismatch error |
| **Rutas en Nginx** | `/etc/ssl/certs/cert.pem` y `/key.pem` | File not found error en contenedor |
| **Volumen Docker** | `/mnt/data/ssl:/etc/ssl/certs:ro` | Certificados no disponibles en contenedor |
| **Permisos de archivos** | `root:root` propietario | Acceso denegado desde contenedor |

---

## 📋 CHECKLIST PRE-EJECUCIÓN

- [ ] Tienes acceso SSH al servidor (confirmado)
- [ ] Los 3 certificados `.cer` están en `SSL SIMIR/`
- [ ] Tienes la clave privada (`.key`) accesible
- [ ] Git está conectado al repositorio correcto
- [ ] Rama activa es `main`
- [ ] Usuario SSH es `fma`
- [ ] IP del servidor es `172.23.0.97`
- [ ] `/mnt/data/ssl` NO existe (será creado en PASO 1A)

---

## 🔍 TROUBLESHOOTING

### Error: "SSL_ERROR_BAD_CERT_DOMAIN"
- **Causa:** `server_name` en nginx no coincide con CN del certificado
- **Solución:** Verificar que `server_name` = `simsr.udea.edu.co` (exacto)

### Error: "unable to get local issuer certificate"
- **Causa:** Orden incorrecto de concatenación de certificados
- **Solución:** Reintentar PASO 1C: cert + intermedio + raíz (EN ESE ORDEN)

### Error: "Permission denied" en nginx
- **Causa:** Permisos incorrectos en `key.pem`
- **Solución:** Ejecutar `sudo chmod 600 /mnt/data/ssl/key.pem`

### Error: "No such file or directory" (/etc/ssl/certs/)
- **Causa:** Volumen Docker no está mapeado
- **Solución:** Verificar que línea en `docker-compose.prod.yml` está descomentada

### Nginx no responde en puerto 443
- **Causa:** Build no se regeneró con nueva configuración
- **Solución:** Ejecutar `docker compose -f docker-compose.prod.yml build --no-cache`

---

## 📊 RESUMEN DE CAMBIOS

| Archivo | Cambios | Líneas |
|---------|---------|--------|
| `nginx.prod.conf` | Descomentar HTTPS + cambiar dominio | 92-150 |
| `docker-compose.prod.yml` | Descomentar volumen SSL | ~103 |
| `.env.production` | *Opcional por ahora* | - |
| `/mnt/data/ssl/` (servidor) | Crear + copiar certificados | - |

---

## 🎯 ORDEN EXACTO DE EJECUCIÓN

```
1. [SSH]         PASO 1A-1B: Crear /mnt/data/ssl + transferir certificados
2. [SSH]         PASO 1C-1E: Concatenar + configurar permisos
3. [Tu máquina]  PASO 2A-2B: Editar nginx + docker-compose
4. [Tu máquina]  PASO 3: Git commit + push
5. [SSH]         PASO 4A-4D: Git pull + docker rebuild + up
6. [SSH]         PASO 5A-5D: Verificar HTTPS
7. [Email/Chat]  PASO 6: Notificar a Seguridad
```

---

## 📞 CONTACTOS

- **Fernando Mora Ángel** (Solicitante) - fernando.mora@udea.edu.co
- **David Alberto Loaiza Gaviria** (Seguridad) - david.loaiza@udea.edu.co

---

**Documento generado:** 23 de junio de 2026  
**Versión:** 1.0  
**Estado:** Listo para ejecutar

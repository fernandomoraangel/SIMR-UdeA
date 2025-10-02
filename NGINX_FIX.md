# Solución para el problema de nginx_prod reiniciándose

## Problemas identificados

1. **Certificados SSL faltantes**: Nginx no podía encontrar los certificados SSL configurados
2. **Sintaxis deprecated**: La directiva `listen ... http2` está obsoleta
3. **Puerto incorrecto**: Configuración mezclaba puertos de desarrollo y producción

## Solución implementada

### 1. Nueva configuración de nginx (`nginx.prod.conf`)

- Configuración HTTP temporal sin SSL
- Puertos corregidos (simr-front:80 en lugar de simr-front:4200)
- Sintaxis moderna de nginx
- Configuración SSL comentada para habilitarla más tarde

### 2. Docker Compose actualizado

- Utiliza la nueva configuración `nginx.prod.conf`
- Volumen SSL comentado temporalmente
- Mantiene la estructura de red y dependencias

### 3. Scripts para generar certificados SSL

- `generate-ssl-certs.sh` (Linux/macOS/WSL)
- `generate-ssl-certs.ps1` (Windows PowerShell)

## Pasos para implementar la solución

### Opción A: Solo HTTP (Inmediato)

1. Los archivos ya están configurados
2. Ejecutar: `docker compose -f docker-compose.prod.yml up -d`
3. La aplicación estará disponible en http://localhost

### Opción B: Habilitar HTTPS

1. Generar certificados SSL:
   ```bash
   # En Linux/macOS/WSL
   chmod +x generate-ssl-certs.sh
   ./generate-ssl-certs.sh
   
   # En Windows PowerShell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   .\generate-ssl-certs.ps1
   ```

2. Actualizar `docker-compose.prod.yml`:
   ```yaml
   volumes:
     - ./nginx.prod.conf:/etc/nginx/conf.d/default.conf:ro
     - ./ssl:/etc/ssl/certs:ro  # Descomentar esta línea
   ```

3. Descomentar la configuración HTTPS en `nginx.prod.conf`

4. Reiniciar el contenedor:
   ```bash
   docker compose -f docker-compose.prod.yml restart nginx
   ```

## Verificación

1. Verificar que los contenedores estén ejecutándose:
   ```bash
   docker compose -f docker-compose.prod.yml ps
   ```

2. Verificar logs de nginx:
   ```bash
   docker compose -f docker-compose.prod.yml logs nginx
   ```

3. Probar la aplicación:
   - HTTP: http://localhost
   - HTTPS: https://localhost (si SSL está habilitado)

## Notas importantes

- Los certificados autofirmados generarán una advertencia en el navegador (normal para desarrollo)
- Para producción real, usar certificados válidos de Let's Encrypt o un CA comercial
- El directorio `/mnt/data/ssl` en el docker-compose original sugiere que esperaba certificados en el servidor, asegúrate de que existan o usa la configuración local propuesta
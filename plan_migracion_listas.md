# Plan de Migración de Listas a Base de Datos

## 1. Resumen del Proyecto

Este plan detalla las fases y pasos necesarios para migrar las listas hardcodeadas en `simr-back/public/listas.js` a una colección en MongoDB. Se creará una nueva interfaz de usuario en el menú "Términos" para la gestión (CRUD) de estas listas, con permisos restringidos a los roles de "bibliotecólogo" y "admin".

**Stack Tecnológico:**
*   **Backend:** Node.js, Express.js
*   **Frontend:** AngularJS
*   **Base de Datos:** MongoDB
*   **Entorno:** Docker

## 2. Fases del Proyecto

---

### **Fase 1: Preparación y Diseño**

*   [ ] **1.1. Diseño del Modelo de Datos (MongoDB):**
    *   Definir un esquema para la colección `listas`.
    *   Campos:
        *   `nombre_lista`: String (p. ej., "tipos", "estados", "roles"). Indexado para búsquedas rápidas.
        *   `elementos`: Array de Strings (los ítems de cada lista).
        *   `metadata`: Object (para listas complejas como `nNormalizados`).
        *   `fecha_creacion`: Date.
        *   `fecha_modificacion`: Date.
        *   `usuario_modifico`: ObjectId (referencia a la colección `users`).

*   [ ] **1.2. Diseño de la Arquitectura del Módulo (AngularJS):**
    *   Crear un nuevo módulo de AngularJS llamado `listas`.
    *   Definir la estructura de archivos:
        *   `simr-back/public/listas/listas.client.module.js`
        *   `simr-back/public/listas/config/listas.client.routes.js`
        *   `simr-back/public/listas/controllers/listas.client.controller.js`
        *   `simr-back/public/listas/services/listas.client.service.js`
        *   `simr-back/public/listas/views/list-listas.client.view.html`

*   [ ] **1.3. Diseño de la API (Node.js/Express):**
    *   Definir los endpoints de la API RESTful para las listas:
        *   `GET /api/listas`: Obtener todas las listas.
        *   `GET /api/listas/:nombre_lista`: Obtener los elementos de una lista específica.
        *   `POST /api/listas`: Crear una nueva lista (o añadir un elemento).
        *   `PUT /api/listas/:lista_id`: Actualizar un elemento de una lista.
        *   `DELETE /api/listas/:lista_id/:elemento_id`: Eliminar un elemento de una lista.

---

### **Fase 2: Desarrollo del Backend**

*   [ ] **2.1. Crear el Modelo de Mongoose:**
    *   Implementar el esquema `Lista` en un nuevo archivo de modelo: `simr-back/app/models/lista.server.model.js`.

*   [ ] **2.2. Implementar los Controladores del Servidor:**
    *   Crear `simr-back/app/controllers/listas.server.controller.js`.
    *   Implementar la lógica CRUD para la gestión de listas.
    *   Asegurar que las operaciones de escritura (create, update, delete) registren `usuario_modifico`.

*   [ ] **2.3. Implementar las Rutas del Servidor y Permisos:**
    *   Crear `simr-back/app/routes/listas.server.routes.js`.
    *   Proteger las rutas de escritura para que solo los roles `admin` y `bibliotecólogo` tengan acceso.
    *   La ruta de lectura (`GET`) debe ser accesible para cualquier usuario autenticado.

---

### **Fase 3: Desarrollo del Frontend**

*   [ ] **3.1. Crear el Módulo de AngularJS `listas`:**
    *   Implementar los archivos base del módulo (module, routes, controller, service, view).

*   [ ] **3.2. Desarrollar el Servicio `ListasService`:**
    *   Implementar las llamadas a la API definidas en la Fase 1.3.

*   [ ] **3.3. Desarrollar la Interfaz de Usuario:**
    *   En `list-listas.client.view.html`, crear una tabla con las columnas "Lista" y "Elemento".
    *   Añadir un `<select>` para filtrar por `nombre_lista`.
    *   Implementar botones para "Agregar", "Editar" y "Eliminar" elementos.
    *   Usar `ng-dialog` o similar para los modales de confirmación y edición/creación.
    *   Utilizar la directiva `has-permission` o `editor-only` para mostrar/ocultar los controles de edición.

*   [ ] **3.4. Integrar el Módulo en el Menú "Términos":**
    *   Añadir una nueva entrada de menú que redirija a la vista de listas. El Menú está en la vista HTML que se encuentra en public/core.
    *   Esta entrada del menú solo debe ser accesible a los usuarios autorizados

---

### **Fase 4: Migración de Datos**

*   [ ] **4.1. Crear el Script de Migración:**
    *   Desarrollar un script en Node.js (`simr-back/scripts/migrate-lists.js`).
    *   El script leerá `simr-back/public/listas.js`, transformará los datos al nuevo esquema y los insertará en la colección `listas` de MongoDB.
    *   El script debe ser idempotente (verificar si los datos ya existen antes de insertar).
    *   Añadir un comando en `package.json` para ejecutar el script dentro del contenedor de Docker.

*   [ ] **4.2. Ejecutar la Migración en Desarrollo:**
    *   Una vez que el backend esté listo y probado, ejecutar el script de migración en el entorno de desarrollo.

---

### **Fase 5: Actualización y Refactorización**

*   [ ] **5.1. Identificar Usos de las Listas Antiguas:**
    *   Buscar en todo el código de `simr-back` las importaciones y usos de `listas.js`.

*   [ ] **5.2. Refactorizar Componentes:**
    *   Modificar todos los componentes (controladores, directivas, etc.) que usan las listas hardcodeadas para que ahora consuman los datos desde el `ListasService` o un servicio similar que obtenga los datos de la API.

*   [ ] **5.3. Eliminar el Archivo Antiguo:**
    *   Una vez que todas las dependencias hayan sido actualizadas, eliminar el archivo `simr-back/public/listas.js`.

---

## 3. Checklist y Riesgos

### Checklist de Verificación
- [ ] El modelo de datos soporta tanto listas simples como complejas.
- [ ] Los endpoints de la API están protegidos correctamente por roles.
- [ ] La interfaz de usuario permite filtrar, agregar, editar y eliminar elementos.
- [ ] Los controles de edición solo son visibles para roles autorizados.
- [ ] El script de migración transfiere todos los datos correctamente.
- [ ] Todos los componentes de la aplicación consumen las listas desde la API.
- [ ] El archivo `listas.js` ha sido eliminado.

### Riesgos Potenciales
*   **Pérdida de Datos:** Un error en el script de migración podría causar la pérdida de datos. **Mitigación:** Realizar backups y ejecutar el script primero en un entorno de desarrollo.
*   **Conflictos de Permisos:** Una configuración incorrecta de los permisos podría dar acceso no autorizado. **Mitigación:** Pruebas exhaustivas de los roles y permisos en la API.
*   **Funcionalidad Rota:** El refactorizaje para usar la nueva API podría romper componentes existentes. **Mitigación:** Realizar pruebas de regresión completas después del refactorizaje.

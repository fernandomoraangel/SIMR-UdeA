# Resumen: Fix Números Normalizados - Recursos

## 🔍 Problema Identificado

En la vista **"Crear recurso"** (`/#!/recursos/create`), la sección **"Números normalizados"** no muestra las opciones en el dropdown selector.

### Causa Raíz

1. **Datos no existen en la base de datos**: Los datos están definidos estáticamente en `public/listas.js` pero nunca se migraron a la colección MongoDB `listas`.

2. **Estructura incorrecta**: El controlador cargaba `lista.elementos` (strings simples) en lugar de `lista.metadata` (objetos con estructura `{sigla, frase}`).

3. **Vista espera estructura específica**: El HTML esperaba objetos con propiedades:
   ```javascript
   { sigla: "ISBN", frase: "International Standard Book Number" }
   ```

## ✅ Solución Implementada

### 1. Archivos Modificados

#### `simr-back/public/recursos/controllers/recursos.client.controller.js`
**Cambio**: Modificada función `loadListas()` para usar `metadata` cuando existe.

```javascript
// ANTES:
$scope[lista.nombre_lista] = lista.elementos;
if (lista.metadata && lista.metadata.length > 0) {
  $scope[lista.nombre_lista + "_metadata"] = lista.metadata;
}

// DESPUÉS:
if (lista.metadata && lista.metadata.length > 0) {
  $scope[lista.nombre_lista] = lista.metadata;
} else {
  $scope[lista.nombre_lista] = lista.elementos;
}
```

#### `simr-back/public/recursos/views/create-recurso.client.view.html`
**Cambio**: Limpiado código innecesario y simplificado la vista.

```html
<!-- ANTES -->
<option ng-repeat="n in nNormalizados | orderBy: n.frase track by $index" value="{{n.sigla}}">
  {{n.sigla}} {{n.frase}}
  <span ng-if="nNormalizados_metadata && nNormalizados_metadata[$index]">
    ({{nNormalizados_metadata[$index].nombre}}: {{nNormalizados_metadata[$index].numero}})
  </span>
</option>

<!-- DESPUÉS -->
<option ng-repeat="n in nNormalizados | orderBy: n.frase track by $index" value="{{n.sigla}}">
  {{n.sigla}} <span ng-if="n.frase">- {{n.frase}}</span>
</option>
```

#### `simr-back/public/recursos/views/edit-recurso.client.view.html`
**Cambio**: Mismo ajuste que en create-recurso para consistencia.

### 2. Archivos Creados

#### `simr-back/scripts/insert-nNormalizados-lista.js`
Script Node.js para insertar/actualizar los datos de nNormalizados en MongoDB.

**Datos insertados**:
- 8 tipos de números normalizados (ISBN, ISSN, DOI, etc.)
- Estructura con `elementos` (strings) y `metadata` (objetos con sigla y frase)

#### `Scripts Powershell/insert-nNormalizados.ps1`
Script PowerShell para facilitar la ejecución del script de inserción.

### 3. Documentación

#### `FIX_NUMEROS_NORMALIZADOS.md`
Documentación completa del problema, análisis y solución implementada.

## 🚀 Cómo Aplicar la Solución

### Paso 1: Insertar datos en MongoDB

Opción A - Usando PowerShell (recomendado):
```powershell
.\Scripts Powershell\insert-nNormalizados.ps1
```

Opción B - Manualmente:
```powershell
cd simr-back
node scripts\insert-nNormalizados-lista.js
```

### Paso 2: Reiniciar el servidor backend

Si el servidor está corriendo, reiniciarlo para que cargue los cambios del controlador.

### Paso 3: Verificar en el navegador

1. Abrir la aplicación
2. Navegar a `/#!/recursos/create`
3. Expandir la sección "Números normalizados"
4. Verificar que el dropdown muestra:
   - Depósito legal
   - DOI - Digital Object Identifier System
   - ISAN - International Standard Audiovisual Number
   - ISBN - International Standard Book Number
   - ISMN - International Standard Music Number
   - ISRC - International Standard Recording Code
   - ISSN - International Standard Serial Number
   - ISWC - International Standard Musical Work Code

## 📊 Estructura de Datos

### En MongoDB (colección `listas`):
```javascript
{
  nombre_lista: "nNormalizados",
  elementos: [
    "Depósito legal",
    "DOI - Digital Object Identifier System",
    // ...
  ],
  metadata: [
    { sigla: "Depósito legal", frase: "" },
    { sigla: "DOI", frase: "Digital Object Identifier System" },
    // ...
  ]
}
```

### En AngularJS (variable $scope):
```javascript
$scope.nNormalizados = [
  { sigla: "Depósito legal", frase: "" },
  { sigla: "DOI", frase: "Digital Object Identifier System" },
  // ...
]
```

## ✨ Beneficios

1. **Datos centralizados**: Los números normalizados ahora están en la base de datos, no hardcodeados.
2. **Fácil mantenimiento**: Se pueden agregar/modificar desde la interfaz de administración de listas.
3. **Consistencia**: Misma estructura de datos en create y edit.
4. **Reutilizable**: El patrón de usar `metadata` se puede aplicar a otras listas complejas.

## 🔧 Mantenimiento Futuro

Para agregar más números normalizados:

1. Ir a la interfaz de administración de listas
2. Buscar la lista "nNormalizados"
3. Agregar nuevos elementos en `metadata` con la estructura `{sigla, frase}`

O ejecutar un script similar al de inserción con los nuevos datos.

## 📝 Notas Técnicas

- El campo `metadata` en el modelo `Lista` es de tipo `Mixed` (flexible)
- La API `/api/listas` devuelve todas las listas con sus elementos y metadata
- El servicio `Listas` ya estaba correctamente configurado
- No se requieren cambios en el backend (servidor)
- Compatible con otras listas que usen la misma estructura

---

**Fecha**: 2025-10-17  
**Módulo**: Recursos  
**Componente**: Números Normalizados  
**Estado**: ✅ Resuelto

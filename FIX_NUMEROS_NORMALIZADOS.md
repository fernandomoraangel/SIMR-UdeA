# Fix: Números Normalizados no se muestran en Crear Recurso

## Problema Identificado

La sección "Números normalizados" en la vista "Crear recurso" (`/#!/recursos/create`) no muestra los datos correctamente porque:

1. **La vista espera datos estructurados**: El HTML en `create-recurso.client.view.html` (línea 181) espera un array de objetos con esta estructura:
   ```javascript
   nNormalizados = [
     { sigla: "ISBN", frase: "International Standard Book Number" },
     { sigla: "ISSN", frase: "International Standard Serial Number" },
     // ...
   ]
   ```

2. **Los datos no se cargan desde la base de datos**: 
   - El controlador tiene una función `loadListas()` que intenta cargar listas dinámicamente desde la API
   - Sin embargo, los datos de `nNormalizados` no se están cargando correctamente
   - Los datos están definidos en `public/listas.js` pero no están en la base de datos

3. **Asignación incorrecta**: La función `loadListas()` asigna datos como:
   ```javascript
   $scope[lista.nombre_lista] = lista.elementos;
   ```
   Pero para `nNormalizados`, necesitamos que `lista.elementos` contenga objetos con `sigla` y `frase`, no strings simples.

## Archivos Involucrados

- **Vista**: `simr-back/public/recursos/views/create-recurso.client.view.html` (líneas 176-211)
- **Controlador**: `simr-back/public/recursos/controllers/recursos.client.controller.js` (líneas 37-48)
- **Datos actuales**: `simr-back/public/listas.js` (líneas 1-9)
- **Modelo**: `simr-back/app/models/lista.server.model.js`
- **Servicio**: `simr-back/public/listas/services/listas.client.service.js`

## Solución

### Paso 1: Verificar/Insertar datos en la base de datos

Necesitamos asegurarnos de que la colección `listas` en MongoDB tenga un documento para `nNormalizados`:

```javascript
{
  nombre_lista: "nNormalizados",
  elementos: [
    "Depósito legal",
    "DOI - Digital Object Identifier System",
    "ISAN - International Standard Audiovisual Number",
    "ISBN - International Standard Book Number",
    "ISMN - International Standard Music Number",
    "ISRC - International Standard Recording Code",
    "ISSN - International Standard Serial Number",
    "ISWC - International Standard Musical Work Code"
  ],
  metadata: [
    { sigla: "Depósito legal", frase: "" },
    { sigla: "DOI", frase: "Digital Object Identifier System" },
    { sigla: "ISAN", frase: "International Standard Audiovisual Number" },
    { sigla: "ISBN", frase: "International Standard Book Number" },
    { sigla: "ISMN", frase: "International Standard Music Number" },
    { sigla: "ISRC", frase: "International Standard Recording Code" },
    { sigla: "ISSN", frase: "International Standard Serial Number" },
    { sigla: "ISWC", frase: "International Standard Musical Work Code" }
  ]
}
```

### Paso 2: Modificar el controlador

Actualizar la función `loadListas()` en el controlador para manejar correctamente los metadatos:

```javascript
// Cargar listas dinámicas desde la API
$scope.loadListas = function () {
  Listas.query(function (listas) {
    listas.forEach(function (lista) {
      // Para listas con metadata (como nNormalizados), usar metadata en lugar de elementos
      if (lista.metadata && lista.metadata.length > 0) {
        $scope[lista.nombre_lista] = lista.metadata;
      } else {
        $scope[lista.nombre_lista] = lista.elementos;
      }
    });
  });
};
```

### Paso 3: Actualizar la vista (opcional)

Si queremos simplificar, la vista ya está correctamente configurada en la línea 181:

```html
<option ng-repeat="n in nNormalizados | orderBy: n.frase track by $index" value="{{n.sigla}}">
  {{n.sigla}} {{n.frase}}
</option>
```

## Implementación

### Script para insertar datos en MongoDB

Crear un archivo `simr-back/scripts/insert-nNormalizados-lista.js`:

```javascript
const mongoose = require('mongoose');
const config = require('../config/config');

mongoose.connect(config.db);

const Lista = mongoose.model('Lista');

const nNormalizadosData = {
  nombre_lista: 'nNormalizados',
  elementos: [
    'Depósito legal',
    'DOI - Digital Object Identifier System',
    'ISAN - International Standard Audiovisual Number',
    'ISBN - International Standard Book Number',
    'ISMN - International Standard Music Number',
    'ISRC - International Standard Recording Code',
    'ISSN - International Standard Serial Number',
    'ISWC - International Standard Musical Work Code'
  ],
  metadata: [
    { sigla: 'Depósito legal', frase: '' },
    { sigla: 'DOI', frase: 'Digital Object Identifier System' },
    { sigla: 'ISAN', frase: 'International Standard Audiovisual Number' },
    { sigla: 'ISBN', frase: 'International Standard Book Number' },
    { sigla: 'ISMN', frase: 'International Standard Music Number' },
    { sigla: 'ISRC', frase: 'International Standard Recording Code' },
    { sigla: 'ISSN', frase: 'International Standard Serial Number' },
    { sigla: 'ISWC', frase: 'International Standard Musical Work Code' }
  ]
};

async function insertNNormalizados() {
  try {
    // Verificar si ya existe
    const existing = await Lista.findOne({ nombre_lista: 'nNormalizados' });
    
    if (existing) {
      console.log('Actualizando lista existente...');
      await Lista.findByIdAndUpdate(existing._id, nNormalizadosData);
      console.log('Lista nNormalizados actualizada exitosamente');
    } else {
      console.log('Creando nueva lista...');
      const lista = new Lista(nNormalizadosData);
      await lista.save();
      console.log('Lista nNormalizados creada exitosamente');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

insertNNormalizados();
```

## Verificación

Después de implementar la solución:

1. Ejecutar el script de inserción: `node simr-back/scripts/insert-nNormalizados-lista.js`
2. Reiniciar el servidor backend
3. Abrir la aplicación en el navegador
4. Navegar a `/#!/recursos/create`
5. Expandir la sección "Números normalizados"
6. Verificar que el dropdown muestra las opciones correctamente:
   - Depósito legal
   - DOI (Digital Object Identifier System)
   - ISAN (International Standard Audiovisual Number)
   - ISBN (International Standard Book Number)
   - etc.

## Notas Adicionales

- El modelo `Lista` ya soporta el campo `metadata` (tipo Mixed)
- La API `/api/listas` ya está configurada correctamente
- El servicio AngularJS `Listas` ya está inyectado en el controlador
- Solo necesitamos asegurar que los datos existan en la BD y que el controlador los procese correctamente

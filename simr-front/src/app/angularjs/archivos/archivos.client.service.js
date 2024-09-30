'use strict';

angular.module('archivos')
  .factory('Archivos', ['$resource', '$http', function ($resource, $http) {
    var apiUrl = 'http://localhost:3000'; // Reemplaza esto con la URL base de tu API

    var Archivo = $resource(apiUrl + '/api/archivos/:archivoId', 
      { archivoId: '@_id' }, 
      { 
        update: { method: 'PUT' }
      }
    );
    
    return {
      resoure: Archivo,

      deleteFile: function (filename) {
        return $http.delete(apiUrl + '/delete/' + filename)
          .then(function (response) {
            return response.data;
          })
          .catch(function (error) {
            console.error('Error al eliminar el archivo:', error);
            throw error;
          });
      },

      // Otros métodos que utilizan el recurso
      getAll: function() {
        return Archivo.query().$promise;
      },

      get: function(id) {
        return Archivo.get({ archivoId: id }).$promise;
      },

      create: function(archivo) {
        return Archivo.save(archivo).$promise;
      },

      update: function(archivo) {
        return Archivo.update({ archivoId: archivo._id }, archivo).$promise;
      }

    };
  }]);



//   'use strict';

// angular.module('archivos')
//   .factory('Archivos', ['$resource', '$http', function ($resource, $http) {
//     var apiUrl = 'localhost:3000'; // Reemplaza esto con la URL base de tu API

//     var Archivo = $resource(apiUrl + '/api/archivos/:archivoId', 
//       { archivoId: '@_id' }, 
//       { 
//         update: { method: 'PUT' }
//       }
//     );

//     return {
//       resource: Archivo,
      
//       deleteFile: function (filename) {
//         return $http.delete(apiUrl + '/delete/' + filename)
//           .then(function (response) {
//             return response.data;
//           })
//           .catch(function (error) {
//             console.error('Error al eliminar el archivo:', error);
//             throw error;
//           });
//       },

//       // Puedes agregar más métodos aquí que utilicen el recurso
//       getAll: function() {
//         return Archivo.query().$promise;
//       },

//       get: function(id) {
//         return Archivo.get({ archivoId: id }).$promise;
//       },

//       create: function(archivo) {
//         return Archivo.save(archivo).$promise;
//       },

//       update: function(archivo) {
//         return Archivo.update({ archivoId: archivo._id }, archivo).$promise;
//       }
//     };
//   }]);
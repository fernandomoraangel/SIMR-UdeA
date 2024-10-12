'use strict';

// angular.module('archivos')
angular.module('archivos', [])
  .factory('ArchivoService2', [
    '$resource',
    '$http',
    '$window',
    '$rootScope',
    function (
      $resource,
      $http,
      $window,
      $rootScope
    ) {
      var apiUrl = 'http://localhost:3000'; // Reemplaza esto con la URL base de tu API

      var Archivo = $resource(apiUrl + '/api/archivos/:archivoId',
        { archivoId: '@_id' },
        {
          update: { method: 'PUT' }
        }
      );

      var angularAppOrigin = 'http://localhost:4200';
      var angularWindowFileUpload;
      var angularWindowFileList;
      var listenerActivo = false; // Bandera para controlar si el listener ya está activo
      var fileInfo2 = {}; // Información del archivo subido
      var mensajeAEnviar = { type: '', message: '', dbCollection: '' }; // Mensaje a Enviar


      // Listener de mensajes
      function recibirMensaje(event) {
        if (event.origin !== angularAppOrigin) return;

        if (event.data.type === 'FILE_UPLOAD') {
          $rootScope.$apply(function () {
            console.log('(Mensaje recibido) Archivo subido:', JSON.parse(event.data.message));
            const fileInfo = JSON.parse(event.data.message);
            const datosArchivo = {
              nombre: fileInfo.originalName,
              id: fileInfo.documentId,
              minioObjectName: fileInfo.minioObjectName
            };
            $rootScope.$broadcast('archivoSubido', datosArchivo);
          });
        } else if (event.data.type === 'FILE_LIST' && event.data.status === 'READY') {
          $rootScope.$apply(function () {
            console.log('Ventana emergente lista:', event.data.message);
            $rootScope.$broadcast('archivoListo', event.data.message);
          });
          // enviarMensaje('FILE_LIST', '670481898842df4cf111f335', 'obras');
          enviarMensaje(mensajeAEnviar.type, mensajeAEnviar.message, mensajeAEnviar.dbCollection);
        }
      }

      // Agregar el listener si no está ya activo
      function agregarListener() {
        if (!listenerActivo) {
          $window.addEventListener('message', recibirMensaje, false);
          listenerActivo = true;
          console.log('Event Listener agregado');
        }
      }

      // Remover el listener
      function removerListener() {
        if (angularWindowFileUpload && !angularWindowFileUpload.closed) {
          angularWindowFileUpload.close();
          console.log('Ventana emergente de subir archivo cerrada');
        }
        if (listenerActivo) {
          $window.removeEventListener('message', recibirMensaje, false);
          listenerActivo = false;
          console.log('Event Listener removido');
        }
      }

      // Funciones para abrir ventanas
      function subirArchivo() {
        console.log('Subiendo archivo...');
        if (angularWindowFileUpload && !angularWindowFileUpload.closed) {
          angularWindowFileUpload.focus();
        } else {
          angularWindowFileUpload = $window.open(angularAppOrigin + '/files/upload', 'AngularApp', 'width=563,height=365');
        }
      }

      function mostrarArchivos(documentId, dbCollection) {
        if (angularWindowFileList && !angularWindowFileList.closed) {
          angularWindowFileList.focus();
        } else {
          angularWindowFileList = $window.open(angularAppOrigin + '/files', 'AngularApp', '_blank');
          mensajeAEnviar = {
            type: 'FILE_LIST',
            message: documentId,
            dbCollection: dbCollection
          };
          console.log('Mensaje a enviar (mostrarArchivos):', mensajeAEnviar);
        }
      }

      // Enviar mensaje a la ventana emergente
      function enviarMensaje(type, message, dbCollection) {
        const messagePreprocessed = { type: type, message: message, dbCollection: dbCollection };
        switch (type) {
          case 'FILE_LIST':
            if (angularWindowFileList && !angularWindowFileList.closed) {
              console.log('Enviando mensaje a Angula(FILE_LIST):', messagePreprocessed);
              angularWindowFileList.postMessage(messagePreprocessed, angularAppOrigin);
            }
            break;
          case 'FILE_UPLOAD':
            if (angularWindowFileUpload && !angularWindowFileUpload.closed) {
              console.log('Enviando mensaje a Angular(FILE_UPLOAD):', message);
              angularWindowFileUpload.postMessage(messagePreprocessed, angularAppOrigin);
            }
            break;
          default:
            console.error('Tipo no reconocido:', type);
        }
      }

      function deleteFile(filename) {
        return $http.delete(apiUrl + '/delete/' + filename)
          .then(function (response) {
            return response.data;
          })
          .catch(function (error) {
            console.error('Error al eliminar el archivo:', error);
            throw error;
          });
      }

      function sayHello() {
        console.log('Hello from ArchivosService');
        Swal.fire({
          title: "¡Hola!",
          text: "Hola desde el servicio de archivos",
          icon: "info",
          confirmButtonText: "Cerrar",
        });
        console.log('(ArchivoService) FileInfo:', fileInfo2);
      }





      return {
        resoure: Archivo,
        enviarMensaje: enviarMensaje,
        agregarListener: agregarListener,
        removerListener: removerListener,
        subirArchivo: subirArchivo,
        mostrarArchivos: mostrarArchivos,
        deleteFile: deleteFile,
        sayHello: sayHello,


        // =======================================


        // deleteFile: function (filename) {
        //   return $http.delete(apiUrl + '/delete/' + filename)
        //     .then(function (response) {
        //       return response.data;
        //     })
        //     .catch(function (error) {
        //       console.error('Error al eliminar el archivo:', error);
        //       throw error;
        //     });
        // },

        // Otros métodos que utilizan el recurso
        getAll: function () {
          return Archivo.query().$promise;
        },

        get: function (id) {
          return Archivo.get({ archivoId: id }).$promise;
        },

        create: function (archivo) {
          return Archivo.save(archivo).$promise;
        },

        update: function (archivo) {
          return Archivo.update({ archivoId: archivo._id }, archivo).$promise;
        }

      };
    }]);

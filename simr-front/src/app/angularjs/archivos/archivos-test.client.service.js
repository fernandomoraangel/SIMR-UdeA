angular.module('archivos')
  .factory('ArchivoServiceTest', [
    '$resource', '$http', '$window', '$rootScope',
    function ($resource, $http, $window, $rootScope) {
      var apiUrl = 'http://localhost:3000';
      var angularAppOrigin = 'http://localhost:4200';
      var Archivo = $resource(apiUrl + '/api/archivos/:archivoId', { archivoId: '@_id' }, { update: { method: 'PUT' } });
      var angularWindowFileUpload;
      var angularWindowFileList;
      var listenerActivo = false;
      var mensajeAEnviar = { type: '', message: '', dbCollection: '' }; // Mensaje a Enviar

      var service = {
        agregarListener: agregarListener,
        removerListener: removerListener,
        subirArchivo: subirArchivo,
        mostrarArchivos: mostrarArchivos,
        deleteFile: deleteFile,
        getAll: function () { return Archivo.query().$promise; },
        get: function (id) { return Archivo.get({ archivoId: id }).$promise; },
        create: function (archivo) { return Archivo.save(archivo).$promise; },
        update: function (archivo) { return Archivo.update({ archivoId: archivo._id }, archivo).$promise; }
      };

      function recibirMensaje(event) {
        if (event.origin !== angularAppOrigin) return;

        if (event.data.type === 'FILE_UPLOAD') {
          $rootScope.$apply(function () {
            // const fileInfo = JSON.parse(event.data.message);
            const {originalName, documentId, minioObjectName} = JSON.parse(event.data.message);
            const datosArchivo = {
              nombre: originalName,
              id: documentId,
              minioObjectName: minioObjectName
            };
            // const datosArchivo = {
            //   nombre: fileInfo.originalName,
            //   id: fileInfo.documentId,
            //   minioObjectName: fileInfo.minioObjectName
            // };
            console.log('Archivo subido (ArchivoService):', datosArchivo);
            $rootScope.$broadcast('archivoSubido', datosArchivo);
          });
        } else if (event.data.type === 'FILE_LIST' && event.data.status === 'READY') {
          $rootScope.$apply(function () {
            $rootScope.$broadcast('archivoListo', event.data.message);
          });
          // Responder a la ventana emergente con los datos necesarios para cargar los archivos
          enviarMensaje(mensajeAEnviar.type, mensajeAEnviar.message, mensajeAEnviar.dbCollection);
        }
      }

      function agregarListener() {
        if (!listenerActivo) {
          $window.addEventListener('message', recibirMensaje, false);
          listenerActivo = true;
        }
        console.log('Listener activo:', listenerActivo);
      }

      function removerListener() {
        if (listenerActivo) {
          $window.removeEventListener('message', recibirMensaje, false);
          listenerActivo = false;
        }
        if (angularWindowFileUpload && !angularWindowFileUpload.closed) {
          angularWindowFileUpload.close();
        }
        console.log('Listener activo:', listenerActivo);
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

      function subirArchivo() {
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

      return service;
      // return {
      //   agregarListener: agregarListener,
      //   removerListener: removerListener,
      //   subirArchivo: subirArchivo,
      //   mostrarArchivos: mostrarArchivos,
      //   deleteFile: deleteFile
      // }
    }
  ]);
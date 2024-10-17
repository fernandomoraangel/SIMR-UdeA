angular.module('archivos', [])
  .factory('ArchivoService', [
    '$resource',
    '$http',
    '$window',
    '$rootScope',
    function ($resource, $http, $window, $rootScope) {
      // var apiUrl = 'http://localhost:3000';
      var apiUrl = 'http://localhost:3000/files';
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
        correrPrueba210: correrPrueba210,
        loadFiles: loadFiles,
        getDocumentFiles: getDocumentFiles,
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
            const { originalName, documentId, minioObjectName } = JSON.parse(event.data.message);
            const fileInfo = {
              nombre: originalName,
              id: documentId,
              minioObjectName: minioObjectName
            };
            // const datosArchivo = {
            //   nombre: fileInfo.originalName,
            //   id: fileInfo.documentId,
            //   minioObjectName: fileInfo.minioObjectName
            // };
            console.log('Archivo subido (ArchivoService):', fileInfo);
            $rootScope.$broadcast('archivoSubido', fileInfo);
            // console.log('Archivo subido (ArchivoService):', datosArchivo);
            // $rootScope.$broadcast('archivoSubido', datosArchivo);
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

      function correrPrueba210() {
        console.log('Prueba (ArchivoService)');
      }

      function loadFiles() {
        console.log('(ArchivoService) Cargando archivos...');
        return [{
          "nombre": "aurora-borealis.jpg",
          "id": "670f51a5fb934de32915faf8",
          "minioObjectName": "aurora-borealis-1729057188513.jpg"
        }];
        // ArchivoService.getAll().then(function (response) {
        //   console.log('Archivos cargados:', response);
        //   $scope.archivosCargados = response;
        // });
      }

      function mostrarArchivos(documentId, dbCollection) {
        if (angularWindowFileList && !angularWindowFileList.closed) {
          angularWindowFileList.focus();
        } else {
          // angularWindowFileList = $window.open(angularAppOrigin + '/files', 'AngularApp', '_blank');
          angularWindowFileList = $window.open(angularAppOrigin + '/files', '_blank');
          mensajeAEnviar = {
            type: 'FILE_LIST',
            message: documentId,
            dbCollection: dbCollection
          };
          console.log('Mensaje a enviar (mostrarArchivos):', mensajeAEnviar);
        }
      }

      function deleteFile(fileName, fileId) {
        const url = `${apiUrl}/${fileName}`;
        const additionalFileInfo = { fileInfo: { id: fileId } };
        const options = {
          headers: {
            'Content-Type': 'application/json'
          }
        };
        return $http.delete(url, angular.extend(options, { data: additionalFileInfo }))
          .then(response => {
            return response.data; // Devuelve el mensaje de la respuesta
          })
          .catch(error => {
            console.error('Error en la eliminación:', error);
            throw error;
          });
      }

      function getDocumentFiles(dbCollection, documentId) {
        return $http({
          method: 'GET',
          url: apiUrl + '/document-files',
          params: {
            collection: dbCollection,
            documentId: documentId
          }
        }).then(response => {
          return response.data;
        })
        .catch(error => {
          console.error('Error al obtener archivos:', error);
        });

        // return $http.get(`${apiUrl}/document-files/${dbCollection}/${documentId}`)
        //   .then(response => {
        //     return response.data;
        //   })
        //   .catch(error => {
        //     console.error('Error al obtener archivos:', error);
        //     throw error;
        //   });
      }

      return service;
    }
  ]);
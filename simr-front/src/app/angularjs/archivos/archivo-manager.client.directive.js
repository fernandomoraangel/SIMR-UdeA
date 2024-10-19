angular.module('archivos')
  .directive('archivoManager', ['ArchivoService', function (ArchivoService) {
    return {
      restrict: 'E',
      scope: {
        templateType: '@',
        archivosCargados: '=?',
        archivosPorEliminar: '=?',
        documentId: '@?',
        dbCollection: '@?'
      },
      templateUrl: function (element, attrs) {
        switch (attrs.templateType) {
          case 'create-view':
            return 'archivos/templates/create-view.html';
          case 'detail-view':
            return 'archivos/templates/detail-view.html';
          case 'edit-view':
            return 'archivos/templates/edit-view.html';
          default:
            return `
              <p>No template found ${attrs.templateType}</p>
            `;
        }
      },

      link: function (scope, element, attrs) {
        // Imprimir un mensaje cuando la directiva se cargue
        console.log('Directiva miDirectiva cargada');

        // También puedes imprimir otros datos, como atributos o el scope
        console.log('Atributos:', attrs);

        // Imprimir cuando se haga clic en el elemento de la directiva
        element.on('click', function () {
          console.log('Elemento clickeado');
        });
      },

      // controller: function ($scope) {
      controller: function ($scope, $element, $attrs) {

        // Inicializar valores por defecto para atributos opcionales
        $scope.templateType = $scope.templateType || 'default';
        $scope.documentId = $scope.documentId || '';
        $scope.dbCollection = $scope.dbCollection || '';
        $scope.archivosCargados = $scope.archivosCargados || [];
        // $scope.archivosCargados = ArchivoService.loadFiles();
        // $scope.archivosCargados = ArchivoService.getDocumentFiles($scope.dbCollection, $scope.documentId);


        if ($attrs.templateType === 'edit-view') {
          $scope.archivosPorEliminar = $scope.archivosPorEliminar || [];
        }


        // if ($attrs.templateType === 'edit-view') {
        //   ArchivoService.getDocumentFiles($scope.dbCollection, $scope.documentId)
        //     .then(response => {
        //       console.log('response:', response);

        //       $scope.archivosCargados = response.map(archivo => {
        //         return {
        //           nombre: archivo.name,
        //           id: archivo.id,
        //           minioObjectName: archivo.name
        //         };
        //       });

        //       console.log('(Directive - getDocumentFiles) archivosCargados:', $scope.archivosCargados);

        //       // $scope.archivosCargados = response;

        //       // Usamos map para cambiar los nombres de los atributos

        //       // let datos = response.map(archivo => {
        //       //   return {
        //       //     nombre: archivo.name,
        //       //     id: archivo.id,
        //       //     minioObjectName: archivo.name
        //       //   };
        //       // });
        //       // console.log('datos:', datos);

        //     })
        //     .catch(error => {
        //       console.error('Error al obtener los archivos:', error);
        //       $scope.archivosCargados = [];
        //     });
        // } else {
        //   $scope.archivosCargados = [];
        // }

        console.log('(Directiva) archivosCargados:', $scope.archivosCargados);


        console.log('documentId:', $scope.documentId);
        console.log('dbCollection:', $scope.dbCollection);

        $scope.loadFiles = function () {
          console.log('(loadFiles) Cargando archivos...');
          $scope.archivosCargados = [{
            "nombre": "aurora-borealis.jpg",
            "id": "670f51a5fb934de32915faf8",
            "minioObjectName": "aurora-borealis-1729057188513.jpg"
          }];
          // $scope.$apply();
          // ArchivoService.getAll().then(function (response) {
          //   console.log('Archivos cargados:', response);
          //   $scope.archivosCargados = response;
          // });
        };


        // Initialize archivosCargados if not defined
        // if (!$scope.archivosCargados) {
        // $scope.archivosCargados = [];
        // $scope.archivosCargados = [{ nombre: 'archivo1' }, { nombre: 'archivo2' }];
        // console.log('archivosCargados inicializado:', $scope.archivosCargados);
        // }

        // Verificar si se proporcionaron atributos "requeridos"
        if (!$attrs.templateType) {
          // throw new Error('archivoManager: El atributo templateType es requerido.');
          console.warn('archivoManager: El atributo templateType no fue proporcionado. Usando valor por defecto.');
        }

        ArchivoService.agregarListener();

        $scope.subirArchivo = function () {
          console.log('Subir archivo (Directiva)');
          console.log('documentId:', $scope.documentId);
          console.log('dbCollection:', $scope.dbCollection);
          ArchivoService.subirArchivo();
        };

        $scope.mostrarArchivos = function () {
          console.log('Mostrar archivos');
          console.log('documentId:', $scope.documentId);
          console.log('dbCollection:', $scope.dbCollection);
          ArchivoService.mostrarArchivos($scope.documentId, $scope.dbCollection);
        };

        $scope.eliminarArchivo = function (archivo) {
          console.log('(Directiva) archivosCargados:', $scope.archivosCargados);
          console.log('(Eliminar archivo) archivo:', archivo);
          console.log('documentId:', $scope.documentId, 'dbCollection', $scope.dbCollection);
          const index = $scope.archivosCargados.indexOf(archivo);
          if (index > -1) {
            Swal.fire({
              title: "¡Advertencia de eliminación!",
              text:
                "Va a eliminar:" +
                $scope.archivosCargados[index].nombre,
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: "Confirmar",
              cancelButtonText: "Cancelar",
            }).then((result) => {
              if (result.isConfirmed) {
                // ArchivoService.deleteFile(archivo.minioObjectName)
                ArchivoService.deleteFile(archivo.minioObjectName, archivo.id);
                $scope.archivosCargados.splice(index, 1);
                // funcion propia de Angular.Js refresca mi scope y recarga mis datos
                // $scope.$apply();
                Swal.fire(
                  "Eliminado!",
                  "El archivo ha sido eliminado.",
                  "success"
                );
              }
            });
          }
        };

        $scope.$on('archivoSubido', function (event, fileInfo) {
          console.log('Archivo subido! (Directiva):', fileInfo);
          try {
            $scope.archivosCargados.push(fileInfo);
            console.log('Nuevo archivo cargado:', $scope.archivosCargados);
            // if (!$scope.$$phase) {
            //   $scope.$apply();
            // }
          } catch (error) {
            console.error('Error al agregar archivo:', error);
          }
        });

        // $scope.$on('mensajePrueba', function (event, data) {
        $scope.$on('archivoEliminado', function (event, data) {
          console.log('event:', event);
          console.log('(Directiva) Archivo Eliminado:', data);
          const fileDeleted = JSON.parse(data);
          console.log('fileDeleted:', fileDeleted);

          if (fileDeleted.documentId !== $scope.documentId) {
            console.log('El archivo eliminado no pertenece a este documento.');
            return;
          }

          console.log('archivosPorEliminar (antes):', $scope.archivosPorEliminar);
          $scope.archivosPorEliminar.push({ _id: fileDeleted.id });
          console.log('archivosPorEliminar (después):', $scope.archivosPorEliminar);

          // console.log('archivosCargados (antes):', $scope.archivosCargados);
          // $scope.archivosCargados = $scope.archivosCargados.filter((archivo) => {
          //   return archivo.id !== fileDeleted.id;
          // });
          // console.log('archivosCargados (después):', $scope.archivosCargados);
        });

        $scope.$on('$destroy', function () {
          ArchivoService.removerListener();
        });
      }
    };
  }]);

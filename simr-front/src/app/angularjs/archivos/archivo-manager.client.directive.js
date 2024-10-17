angular.module('archivos')
  .directive('archivoManager', ['ArchivoService', function (ArchivoService) {
    return {
      restrict: 'E',
      scope: {
        templateType: '@',
        archivosCargados: '=?',
        documentId: '@?',
        dbCollection: '@?'
      },
      templateUrl: function (element, attrs) {
        switch (attrs.templateType) {
          case 'create-view':
            // Add your template for 'vista-create' here
            return 'archivos/templates/create-view.html';
          case 'detail-view':
            // Add your template for 'vista-detail' here
            return 'archivos/templates/detail-view.html';
          case 'edit-view':
            return 'archivos/templates/edit-view.html';
          default:
            return `
            <p>No template found ${attrs.templateType}</p>
          `;
        }
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
        // $scope.archivosCargados = [{
        //   "nombre": "aurora-borealis.jpg",
        //   "id": "670f51a5fb934de32915faf8",
        //   "minioObjectName": "aurora-borealis-1729057188513.jpg"
        // }];

        // console.log('Cargando archivos...');
        // $scope.archivosCargados = [{
        //   "nombre": "aurora-borealis.jpg",
        //   "id": "670f51a5fb934de32915faf8",
        //   "minioObjectName": "aurora-borealis-1729057188513.jpg"
        // }];


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
          console.log('Subir archivo (Controlador)');
          console.log('documentId:', $scope.documentId);
          console.log('dbCollection:', $scope.dbCollection);
          ArchivoService.subirArchivo();
        };

        $scope.correrPrueba210 = function () {
          console.log('Prueba (Directiva)');
          ArchivoService.correrPrueba210();
        }

        $scope.mostrarArchivos = function () {
          console.log('Mostrar archivos');
          console.log('documentId:', $scope.documentId);
          console.log('dbCollection:', $scope.dbCollection);
          ArchivoService.mostrarArchivos($scope.documentId, $scope.dbCollection);
        };

        $scope.eliminarArchivo = function (archivo) {
          console.log('(Eliminar archivo) archivo:', archivo);
          console.log('documentId:', $scope.documentId, 'dbCollection', $scope.dbCollection);
          var index = $scope.archivosCargados.indexOf(archivo);
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

        // $scope.$on('archivoSubido', function (event, fileInfo) {
        //   console.log('Archivo subido! (Directiva):', fileInfo);
        //   try {
        //     $scope.archivosCargados.push(fileInfo);
        //     console.log('Nuevo archivo cargado:', $scope.archivosCargados);
        //   } catch (error) {
        //     console.error('Error al agregar archivo:', error);
        //   }
        // });

        $scope.$on('$destroy', function () {
          ArchivoService.removerListener();
        });
      }
    };
  }]);



/***
Utilizar la directiva en los diferentes módulos:

<archivo-manager archivos-cargados="vm.archivosCargados" document-id="{{vm.obraId}}" db-collection="obras"></archivo-manager>

Para implementar esta solución, sigue estos pasos:

1. Actualiza el ArchivoService con el código proporcionado en el primer artifact.
2. Crea un nuevo archivo para la directiva (por ejemplo, archivoManagerDirective.js) y agrega el código del segundo artifact.
3. Asegúrate de que ambos archivos estén incluidos en tu index.html o en el bundle de tu aplicación.
4. Utiliza la directiva <archivo-manager> en los templates de tus módulos donde necesites manejar archivos.
***/
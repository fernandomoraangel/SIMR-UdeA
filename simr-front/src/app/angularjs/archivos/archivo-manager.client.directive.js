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
      template: function (element, attrs) {
        switch (attrs.templateType) {
          case 'create-view':
            // Add your template for 'vista-create' here
            return `
              <div>
                <button archivosCargados="archivosCargados" class="form-control" ng-click="subirArchivo($event)">Subir
                  Archivo</button>

                <div ng-model="todoerase" ng-repeat="archivo in archivosCargados track by $index" class="campo">
                  <h2 class="glyphicon glyphicon-remove" style="color:red" ng-model="archivo" ng-click="eliminarArchivo(archivo);">
                  </h2>
                  <!-- Separar para que no se mezcle con el borrado -->
                  <em>
                    {{archivo.nombre}}
                  </em>
                </div>
              </div>
            `;
          case 'detail-view':
            // Add your template for 'vista-detail' here
            return `
              <input type="button" class="form-control" id="btnSubirArchivo" value="Mostrar Archivos"
                ng-click="mostrarArchivos(obra.id)">
            `;
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
        $scope.archivosCargados = $scope.archivosCargados || [];
        $scope.documentId = $scope.documentId || '';
        $scope.dbCollection = $scope.dbCollection || '';

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

        $scope.subirArchivo = function (event) {
          event.preventDefault(); // Prevenir comportamiento por defecto
          event.stopPropagation(); // Detener la propagación del evento
          console.log('Subir archivo (Controlador)');
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
                ArchivoService.deleteFile(archivo.minioObjectName, archivo.id)
                $scope.archivosCargados.splice(index, 1);
                // funcion propia de Angular.Js refresca mi scope y recarga mis datos
                $scope.$apply();
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
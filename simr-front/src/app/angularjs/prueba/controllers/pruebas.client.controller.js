// "use Strict";

//Controller pruebas
angular.module("pruebas").controller("PruebasController", [
  "$scope",
  "$routeParams",
  "$location",
  "Authentication",
  "Pruebas",
  function ($scope, $routeParams, $location, Authentication, Pruebas) {
    //Exponer el servicio Authentication
    $scope.authentication = Authentication;
    $scope.idEstados = [];
    //Preparar datos
    $scope.actualizarTodo = function () {
      $scope.idEstados = this.prueba.estados;
    };

    // Funciones auxiliares
    //Variables globales para ordenar la vista de lista
    $scope.propertyName = "prueba";
    $scope.reverse = false;

    //Ordena la vista de lista
    $scope.sortBy = function (propertyName) {
      $scope.reverse =
        $scope.propertyName === propertyName ? !$scope.reverse : false;
      $scope.propertyName = propertyName;
    };

    $scope.darFormato = function (y) {
      while (y.indexOf("undefined,") > 0) {
        y =
          y.slice(0, y.indexOf("undefined,")) +
          y.slice(y.indexOf("undefined,") + 10, length);
      }

      y = y.slice(0, y.length - 2);
      return y;
    };

    //Crear método controller para crear nuevos pruebas
    $scope.create = function () {
      //Usar los campos form para crear un nuevo objeto $resource
      var prueba = new Pruebas({
        prueba: this.prueba,
      });
      //Usar el método '$save' para enviar una petición POST apropiada
      prueba.$save(
        function (response) {
          //Si el prueba fue creado de la manera correcta, redireccionar a la página del prueba
          Swal.fire({
            title: "¡Registro correcto!",
            text: "El registro se ha creado correctamente",
            icon: "success",
            confirmButtonText: "Cerrar",
          });
          $location.path("pruebas/" + response._id);
        },
        function (errorResponse) {
          //En caso contrario, presentar mensaje de error
          Swal.fire({
            title: "¡Error!",
            text: ($scope.error = errorResponse.data.message),
            icon: "error",
            confirmButtonText: "Cerrar",
          });
          $scope.error = errorResponse.data.message;
        }
      );
    };
    //Método controller para recuperar la lista de registros
    $scope.find = function () {
      //Usar el método 'querry' de prueba, para enviar una petición GET apropiada
      $scope.pruebas = Pruebas.query();
    };

    //Método controller para recuperar una única obra
    // $scope.findOne = function () {
    //   //Usa el método 'get' de prueba para enviar una petición GET apropiada
    //   $scope.prueba = Pruebas.get({
    //     pruebaId: $routeParams.pruebaId,
    //   });
    // };
    $scope.findOne = function () {
      $scope.prueba = Pruebas.get({ pruebaId: $routeParams.pruebaId }, function (response) {
        console.log(response); // Depuración
        $scope.prueba = response;
      });
    };

    //Método controller para actualizar una único prueba
    $scope.update = function () {
      for (var i in $scope.idPruebas) {
        prueba = new Pruebas({
          prueba: $scope.idPruebas[i].id,
        });

        //Usar el método '$save' de actor para enviar una petición POST apropiada
        prueba.$save(
          function (response) {
            //$location.path('obras/' + obraId);
          },
          function (errorResponse) {
            //En caso contrario, presentar mensaje de error
            $scope.error = errorResponse.data.message;
            alert("Problemas al crear el registro " + $scope.error);
          }
        );
      }

      //Usa el método $update de obra para enviar la petición PUT adecuada
      $scope.prueba.$update(
        function () {
          Swal.fire({
            title: "¡Registro correcto!",
            text: "El registro se ha actualizado correctamente",
            icon: "success",
            confirmButtonText: "Cerrar",
          });
          //Si la actualización es correcta, redireccionar
          $location.path("pruebas/" + $scope.prueba._id);
        },
        function (errorResponse) {
          Swal.fire({
            title: "¡Error!",
            text: ($scope.error = errorResponse.data.message),
            icon: "error",
            confirmButtonText: "Cerrar",
          });
          $scope.error = errorResponse.data.message;
        }
      );
    };

    //Método controller para borrar una obra
    $scope.delete = function (prueba) {
      //Confirmación
      Swal.fire({
        title: "¡Advertencia de eliminación!",
        text: "¿Realmente desea borrar el registro?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          if (prueba) {
            //Borrado
            //Usar el método '$remove' del la obra para borrarla
            prueba.$remove(function () {
              //Eliminar la obra de la lista
              for (var i in $scope.pruebas) {
                if ($scope.pruebas[i] === prueba) {
                  $scope.pruebas.splice(i, 1);
                }
              }
            });
          } else {
            //En otro caso usar el método $remove para borrar
            //Borrado exitoso
            $scope.prueba.$remove(function () {
              Swal.fire({
                title: "Eliminación exitosa!",
                text: "El registro se ha eliminado correctamente",
                icon: "success",
                confirmButtonText: "Cerrar",
              });
              $location.path("pruebas");
            });
          }
        }
      });
    };
  },
]);

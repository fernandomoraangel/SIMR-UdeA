// "use Strict";

//Controller idiomas
angular.module("idiomas").controller("IdiomasController", [
  "$scope",
  "$routeParams",
  "$location",
  "Authentication",
  "Idiomas",
  function ($scope, $routeParams, $location, Authentication, Idiomas) {
    //Exponer el servicio Authentication
    $scope.authentication = Authentication;
    $scope.idEstados = [];
    //Preparar datos
    $scope.actualizarTodo = function () {
      $scope.idEstados = this.idioma.estados;
    };

    // Funciones auxiliares
    //Variables globales para ordenar la vista de lista
    $scope.propertyName = "idioma";
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

    //Crear método controller para crear nuevos idiomas
    $scope.create = function () {
      //Usar los campos form para crear un nuevo objeto $resource
      var idioma = new Idiomas({
        idioma: this.idioma,
      });
      //Usar el método '$save' para enviar una petición POST apropiada
      idioma.$save(
        function (response) {
          //Si el idioma fue creado de la manera correcta, redireccionar a la página del idioma
          Swal.fire({
            title: "¡Registro correcto!",
            text: "El registro se ha creado correctamente",
            icon: "success",
            confirmButtonText: "Cerrar",
          });
          $location.path("idiomas/" + response._id);
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
      //Usar el método 'querry' de idioma, para enviar una petición GET apropiada
      $scope.idiomas = Idiomas.query();
    };

    //Método controller para recuperar una única obra
    // $scope.findOne = function () {
    //   //Usa el método 'get' de idioma para enviar una petición GET apropiada
    //   $scope.idioma = Idiomas.get({
    //     idiomaId: $routeParams.idiomaId,
    //   });
    // };
    $scope.findOne = function () {
      $scope.idioma = Idiomas.get({ idiomaId: $routeParams.idiomaId }, function (response) {
        console.log(response); // Depuración
        $scope.idioma = response;
      });
    };

    //Método controller para actualizar una único idioma
    $scope.update = function () {
      for (var i in $scope.idIdiomas) {
        idioma = new Idiomas({
          idioma: $scope.idIdiomas[i].id,
        });

        //Usar el método '$save' de actor para enviar una petición POST apropiada
        idioma.$save(
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
      $scope.idioma.$update(
        function () {
          Swal.fire({
            title: "¡Registro correcto!",
            text: "El registro se ha actualizado correctamente",
            icon: "success",
            confirmButtonText: "Cerrar",
          });
          //Si la actualización es correcta, redireccionar
          $location.path("idiomas/" + $scope.idioma._id);
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
    $scope.delete = function (idioma) {
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
          if (idioma) {
            //Borrado
            //Usar el método '$remove' del la obra para borrarla
            idioma.$remove(function () {
              //Eliminar la obra de la lista
              for (var i in $scope.idiomas) {
                if ($scope.idiomas[i] === idioma) {
                  $scope.idiomas.splice(i, 1);
                }
              }
            });
          } else {
            //En otro caso usar el método $remove para borrar
            //Borrado exitoso
            $scope.idioma.$remove(function () {
              Swal.fire({
                title: "Eliminación exitosa!",
                text: "El registro se ha eliminado correctamente",
                icon: "success",
                confirmButtonText: "Cerrar",
              });
              $location.path("idiomas");
            });
          }
        }
      });
    };
  },
]);

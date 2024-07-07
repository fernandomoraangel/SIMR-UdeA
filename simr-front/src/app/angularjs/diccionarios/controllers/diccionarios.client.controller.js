"use scrict";

//Controller diccinarios
angular.module("diccionarios").controller("DiccionariosController", [
  "$scope",
  "$routeParams",
  "$location",
  "Authentication",
  "Diccionarios",
  function ($scope, $routeParams, $location, Authentication, Diccionarios) {
    //Exponer el servicio Authentication
    $scope.authentication = Authentication;
    $scope.idEstados = [];
    $scope.diccionarios = Diccionarios.query();
    //Preparar datos
    $scope.actualizarTodo = function () {
      $scope.idEstados = this.diccionario.estados;
    };

    // Funciones auxiliares

    //Variables globales para ordenar la vista de lista
    $scope.propertyName = "tabla";
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
      return y;
    };

    $scope.mostrarAyuda = function (tabla, campo) {
      var out = new Object();
      for (var i in $scope.diccionarios) {
        if (
          $scope.diccionarios[i].campo === campo &&
          $scope.diccionarios[i].tabla === tabla
        ) {
          //Los nombres se acortan en una letra para evitar duplicaciones por tratarse de la tabla del diccionario
          $scope.campo = $scope.diccionarios[i].definicion;
          $scope.campoLargo = $scope.diccionarios[i].campoLargo;
          return;
        }
      }
      $scope.campo = "Datos del diccionario no encontrados";
      return;
    };

    //Crear método controller para crear nuevos idiomas
    $scope.create = function () {
      //Usar los campos form para crear un nuevo objeto $resource
      var diccionario = new Diccionarios({
        tabla: this.tabla,
        campo: this.campo,
        definicion: this.definicion,
        campoLargo: this.campoLargo,
      });
      //Usar el método '$save' para enviar una petición POST apropiada
      diccionario.$save(
        function (response) {
          //Si el diccionario fue creado de la manera correcta, redireccionar a la página del diccionario
          Swal.fire({
            title: "¡Registro correcto!",
            text: "El registro se ha creado correctamente",
            icon: "success",
            confirmButtonText: "Cerrar",
          });
          $location.path("diccionarios/" + response._id);
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
      //Usar el método 'querry' de diccionario, para enviar una petición GET apropiada
      $scope.diccionarios = Diccionarios.query();
    };

    //Método controller para recuperar una única obra
    $scope.findOne = function () {
      //Usa el método 'get' de idioma para enviar una petición GET apropiada
      $scope.diccionario = Diccionarios.get({
        diccionarioId: $routeParams.diccionarioId,
      });
    };

    //Método controller para actualizar una único diccionario
    $scope.update = function () {
      for (var i in $scope.idDiccionarios) {
        diccionario = new Diccionarios({
          diccionario: $scope.idDiccionarios[i].id,
        });

        /* $scope.update = function () {
			//Usa el método $update de obra para enviar la petición PUT adecuada
			$scope.diccionario.$update(
			  function () {
				//Si la actualización es correcta, redireccionar
				$location.path("diccionarios/" + $scope.diccionario._id);
			  },
			  function (errorResponse) {
				$scope.error = errorResponse.data.message;
			  }
			);
		  }; */

        //Usar el método '$save' de actor para enviar una petición POST apropiada
        diccionario.$save(
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
      $scope.diccionario.$update(
        function () {
          Swal.fire({
            title: "¡Registro correcto!",
            text: "El registro se ha actualizado correctamente",
            icon: "success",
            confirmButtonText: "Cerrar",
          });
          //Si la actualización es correcta, redireccionar
          $location.path("diccionarios/" + $scope.diccionario._id);
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

    //Método controller para borrar un diccionario
    $scope.delete = function (diccionario) {
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
          if (diccionario) {
            //Borrado
            //Usar el método '$remove' del la obra para borrarla
            diccionario.$remove(function () {
              //Eliminar la obra de la lista
              for (var i in $scope.obras) {
                if ($scope.diccionarios[i] === diccionario) {
                  $scope.diccionarios.splice(i, 1);
                }
              }
            });
          } else {
            //En otro caso usar el método $remove para borrar
            //Borrado exitoso
            $scope.diccionario.$remove(function () {
              Swal.fire({
                title: "Eliminación exitosa!",
                text: "El registro se ha eliminado correctamente",
                icon: "success",
                confirmButtonText: "Cerrar",
              });
              $location.path("diccionarios");
            });
          }
        }
      });
    };
  },
]);

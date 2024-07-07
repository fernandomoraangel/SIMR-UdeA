"use scrict";

//Controller obras
angular.module("ejemplares").controller("EjemplaresController", [
  "$scope",
  "$routeParams",
  "$location",
  "Authentication",
  "Ejemplares",
  "Recursos",
  "Fondos",
  "Colecciones",
  "Diccionarios",
  function (
    $scope,
    $routeParams,
    $location,
    Authentication,
    Ejemplares,
    Recursos,
    Fondos,
    Colecciones,
    Diccionarios
  ) {
    //Exponer el servicio Authentication
    $scope.authentication = Authentication;
    $scope.estados = estados;
    $scope.disponibilidades = disponibilidades;
    $scope.idEstados = [];
    $scope.recursos = Recursos.query();
    $scope.fondos = Fondos.query();
    $scope.coleccions = Colecciones.query();
    $scope.diccionarios = Diccionarios.query();

    //Preparar datos
    $scope.actualizarTodo = function () {
      $scope.idEstados = this.ejemplar.estados;
    };

    // Funciones auxiliares
    $scope.nombrarSi = function (nombre, x) {
      if (x === "undefined" || x === "" || x === undefined) {
        return;
      } else {
        if (nombre != "") {
          return " " + nombre + ": " + x;
        } else {
          return " " + x;
        }
      }
    };

    //Variables globales para ordenar la vista de lista
    $scope.propertyName = "recurso";
    $scope.reverse = false;

    //Ordena la vista de lista
    $scope.sortBy = function (propertyName) {
      $scope.reverse =
        $scope.propertyName === propertyName ? !$scope.reverse : false;
      $scope.propertyName = propertyName;
    };

    $scope.mostrarAyuda = function (tabla, campo) {
      for (var i in $scope.diccionarios) {
        if (
          $scope.diccionarios[i].campo === campo &&
          $scope.diccionarios[i].tabla === tabla
        ) {
          $scope.campo = $scope.diccionarios[i].definicion;
          $scope.campoLargo = $scope.diccionarios[i].campoLargo;
          return;
        }
      }
      $scope.campo = "Datos del diccionario no encontrados";
      return;
    };

    $scope.darFormato = function (y) {
      while (y.indexOf("undefined,") > 0) {
        y =
          y.slice(0, y.indexOf("undefined,")) +
          y.slice(y.indexOf("undefined,") + 10, length);
      }
      return y;
    };

    //Carga de vectores

    $scope.cargaEstados = function (d) {
      for (var i in d) {
        delete d[i]._id;
      }
      $scope.idEstados = [].concat(d);
    };
    $scope.verRecurso = function (x) {
      y = "";
      for (var i in x) {
        y = $scope.recursoAux(x);
      }
      return y;
    };

    $scope.recursoAux = function (aux) {
      for (var i in $scope.recursos) {
        if ($scope.recursos[i].id === aux) {
          return $scope.recursos[i].titulo;
        }
      }
    };

    $scope.verFondo = function (x) {
      y = "";
      for (var i in x) {
        y = $scope.fondoAux(x);
      }
      return y;
    };

    $scope.fondoAux = function (aux) {
      for (var i in $scope.fondos) {
        if ($scope.fondos[i].id === aux) {
          return $scope.fondos[i].nombre;
        }
      }
    };

    $scope.verColeccion = function (x) {
      y = "";
      for (var i in x) {
        y = $scope.coleccionAux(x);
      }
      return y;
    };

    $scope.coleccionAux = function (aux) {
      for (var i in $scope.coleccions) {
        if ($scope.coleccions[i].id === aux) {
          return $scope.coleccions[i].nombre;
        }
      }
    };

    $scope.verEstados = function (x) {
      y = "";
      for (var i in x) {
        //FIXME: Hacer que no muestre undefinied
        if (x[i].contenido === undefined) {
          c = "";
        } else {
          c = x[i].contenido;
        }

        y = y + x[i].etiqueta + ": " + c;
        //Poner coma al final
        if (i != x.length - 1) {
          y = y + "; ";
        }
      }
      return $scope.darFormato(y);
    };
    //Menú descriptores libres
    $scope.estadoAdd = function () {
      existe = false;
      x =
        "etiqueta:" +
        this.estadoEtiqueta +
        ",contenido:" +
        this.estadoContenido;
      var properties = x.split(",");
      var obj = {};
      properties.forEach(function (property) {
        var tup = property.split(":");
        obj[tup[0]] = tup[1];
      });
      if (this.estadoEtiqueta === undefined || this.estadoEtiqueta === "") {
        //Mostrar mensaje de error
        Swal.fire({
          title: "¡Error!",
          text: "Debe diligenciar por lo menos el estado",
          icon: "error",
          confirmButtonText: "Cerrar",
        });
      } else {
        if ($scope.idEstados.indexOf(x) === -1) {
          for (var i in $scope.idEstados) {
            if ($scope.idEstados[i].etiqueta === this.estadoEtiqueta) {
              //Mensaje de error
              Swal.fire({
                title: "¡Error!",
                text: "El estado ya se encuentra en la lista",
                icon: "error",
                confirmButtonText: "Cerrar",
              });
              existe = true;
              return;
            }
          }
        }
        if (existe === false) {
          $scope.idEstados.push(obj);
          this.estadoEtiqueta = "";
          this.estadoContenido = "";
        }
      }
    };

    $scope.estadoRemove = function (x) {
      for (var i in $scope.idEstados) {
        if ($scope.idEstados[i].etiqueta === x) {
          Swal.fire({
            title: "¡Advertencia de eliminación!",
            text:
              "Va a eliminar  " +
              $scope.idEstados[i].etiqueta +
              ", " +
              $scope.idEstados[i].contenido,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Confirmar",
            cancelButtonText: "Cancelar",
          }).then((result) => {
            if (result.isConfirmed) {
              $scope.idEstados.splice(i - 1, 1);
              // funcion propia de Angular.Js refresca mi scope y recarga mis datos
              $scope.$apply();
              Swal.fire(
                "Eliminado!",
                "El estado ha sido eliminado.",
                "success"
              );
            }
          });
        }
      }
    };

    $scope.estadoEdit = function (x, y) {
      document.getElementById("estadoEtiquetaId").value = x;
      document.getElementById("estadoContenidoId").value = y;
      //Devuelve los datos al modelo Angularjs
      $scope.estadoEtiqueta = x;
      $scope.estadoContenido = y;
      //Busca y si encuentra elimina del vector correspondiente
      for (var i in $scope.idEstados) {
        if (
          $scope.idEstados[i].etiqueta === x &&
          $scope.idEstados[i].contenido === y
        ) {
          $scope.idEstados.splice(i, 1);
        }
      }
    };

    //Crear método controller para crear nuevas obras
    $scope.create = function () {
      //Usar los campos form para crear un nuevo objeto $resource obra
      var ejemplar = new Ejemplares({
        recurso: this.recurso,
        numeroEjemplar: this.numeroEjemplar,
        disponibilidad: this.disponibilidad,
        fondo: this.fondo,
        coleccion: this.coleccion,
        procedencia: this.procedencia,
        estados: $scope.idEstados,
      });
      //Usar el método '$save' de obra para enviar una petición POST apropiada
      ejemplar.$save(
        function (response) {
          //Si la obra fue creada de la manera correcta, redireccionar a la página de la obra
          Swal.fire({
            title: "¡Registro correcto!",
            text: "El registro se ha creado correctamente",
            icon: "success",
            confirmButtonText: "Cerrar",
          });
          $location.path("ejemplares/" + response._id);
        },
        function (errorResponse) {
          //En caso contrario, presentar mensaje de error
          alert("No creado: " + errorResponse.data.message);
          $scope.error = errorResponse.data.message;
        }
      );
    };
    //Método controller para recuperar la lista de obras
    $scope.find = function () {
      //Usar el método 'querry' de obra, para enviar una petición GET apropiada
      $scope.ejemplares = Ejemplares.query();
    };

    //Método controller para recuperar una única obra
    $scope.findOne = function () {
      //Usa el método 'get' de obra para enviar una petición GET apropiada
      $scope.ejemplar = Ejemplares.get({
        ejemplarId: $routeParams.ejemplarId,
      });
    };

    //Método controller para actualizar
    $scope.update = function () {
      if ($scope.idEstados.length != 0) {
        $scope.ejemplar.estados = $scope.idEstados;
      }

      //FIXME:¿Qué es esto?, creo que se puede borrar
      //Agregar actores
      for (var i in $scope.idActores) {
        actorObra = new ActoresObras({
          actor: $scope.idActores[i].id,
          obra: $routeParams.obraId,
          roll: $scope.idActores[i].rol,
        });

        //Usar el método '$save' de actor para enviar una petición POST apropiada
        actorObra.$save(
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
      $scope.ejemplar.$update(
        function () {
          //Si la actualización es correcta, redireccionar
          Swal.fire({
            title: "¡Registro correcto!",
            text: "El registro se ha actualizado correctamente",
            icon: "success",
            confirmButtonText: "Cerrar",
          });
          $location.path("ejemplares/" + $scope.ejemplar._id);
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
    $scope.delete = function (ejemplar) {
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
          if (ejemplar) {
            //Borrado
            //Usar el método '$remove' del la obra para borrarla
            ejemplar.$remove(function () {
              //Eliminar la obra de la lista
              for (var i in $scope.ejemplares) {
                if ($scope.ejemplares[i] === ejemplar) {
                  $scope.ejemplares.splice(i, 1);
                }
              }
            });
          } else {
            //En otro caso usar el método $remove para borrar
            //Borrado exitoso
            $scope.ejemplar.$remove(function () {
              Swal.fire({
                title: "Eliminación exitosa!",
                text: "El registro se ha eliminado correctamente",
                icon: "success",
                confirmButtonText: "Cerrar",
              });
              $location.path("ejemplares");
            });
          }
        }
      });
    };
  },
]);

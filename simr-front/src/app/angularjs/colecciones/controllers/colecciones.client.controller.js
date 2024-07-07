"use scrict";

//Controller obras
angular.module("colecciones").controller("ColeccionesController", [
  "$scope",
  "$routeParams",
  "$location",
  "Authentication",
  "Colecciones",
  "Diccionarios",
  function (
    $scope,
    $routeParams,
    $location,
    Authentication,
    Colecciones,
    Diccionarios
  ) {
    //Exponer el servicio Authentication
    $scope.authentication = Authentication;
    $scope.tiposFondosColecciones = tiposFondosColecciones;
    $scope.idActores = [];
    $scope.idFechas = [];
    $scope.idCoberturas = [];
    $scope.idProyectos = [];
    $scope.todoInput = [];
    $scope.actorName = [];
    $scope.diccionarios = Diccionarios.query();
    //Preparar datos
    $scope.actualizarTodo = function () {
      $scope.idEstados = this.ejemplar.estados;
    };
    //Preparar datos
    window.onload = function () {
      $scope.loadDate();
    };

    $scope.updateFecha = function () {
      //Calcular precisión para la fecha
      var precisionyFechaCreacion = precisionFecha(
        document.getElementById("fechaCreacion").value
      );
      this.fechaDeCreacion = precisionyFechaCreacion.fecha;
      var precisionCreacion = precisionyFechaCreacion.precision;
      $scope.coleccion.fechaDeCreacion = precisionyFechaCreacion.fecha;
      $scope.coleccion.precision = precisionCreacion;
    };

    $scope.loadDate = function () {
      fecha = formatDateYMD(
        $scope.coleccion.fechaDeCreacion,
        $scope.coleccion.precision
      );
      $scope.fechaDeCreacion = fecha;
      document.getElementById("fechaCreacion").value = fecha;
    };

    // Funciones auxiliares
    //Validación
    $scope.validarFecha = (fecha, id) => validarFecha(fecha, id);
    $scope.formatDate = (date, precision = "AMD") =>
      formatDate(date, precision);
    $scope.formatDateYMD = (date, precision = "AMD") =>
      formatDateYMD(date, precision);
    //Variables globales para ordenar la vista de lista
    $scope.propertyName = "nombre";
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

    $scope.obraAux = function (aux) {
      //var tmp=JSON.parse($scope.obrasAux);

      for (var i in $scope.obrasAux) {
        if ($scope.obrasAux[i]._id === aux) {
          return $scope.obrasAux[i].titulo;
        }
      }
    };
    $scope.updateActores = function () {
      $scope.actores = Actores.query();
    };

    $scope.actorAdd = function (x) {
      //alert(x);
      var properties = x.split(",");
      var obj = {};
      properties.forEach(function (property) {
        var tup = property.split(":");
        obj[tup[0]] = tup[1];
      });
      $scope.idActores.push(obj);
    };

    $scope.actorRemove = function (x) {
      for (var i in $scope.idActores) {
        if ($scope.idActores[i].id === x) {
          //alert("va a eliminar a "+ $scope.idActores[i].name);
          $scope.idActores.splice(i, 1);
        }
      }
    };

    $scope.fechaAdd = function (f) {
      //alert(f);
      var properties = f.split(",");
      var obj = {};
      properties.forEach(function (property) {
        var tup = property.split(":");
        obj[tup[0]] = tup[1];
      });
      $scope.idFechas.push(obj);
    };

    $scope.fechaRemove = function (f) {
      for (var i in $scope.idFechas) {
        //alert("va a eliminar a "+ $scope.idFechas[i].date);
        if ($scope.idFechas[i].date === f) {
          $scope.idFechas.splice(i, 1);
        }
      }
    };

    $scope.coberturaAdd = function (c) {
      //alert(c);
      var properties = c.split(",");
      var obj = {};
      properties.forEach(function (property) {
        var tup = property.split(":");
        obj[tup[0]] = tup[1];
      });
      $scope.idCoberturas.push(obj);
    };

    $scope.coberturaRemove = function (c) {
      for (var i in $scope.idCoberturas) {
        alert("va a eliminar a " + $scope.idCoberturas[i].place);
        if ($scope.idCoberturas[i].place === c) {
          $scope.idCoberturas.splice(i, 1);
        }
      }
    };

    $scope.proyectoAdd = function (p) {
      //alert(p);
      var properties = p.split(",");
      var obj = {};
      properties.forEach(function (property) {
        var tup = property.split(":");
        obj[tup[0]] = tup[1];
      });
      $scope.idProyectos.push(obj);
    };

    $scope.proyectoRemove = function (p) {
      for (var i in $scope.idProyectos) {
        //alert("va a eliminar a "+ $scope.idProyectos[i].name);
        if ($scope.idProyectos[i].name === p) {
          $scope.idProyectos.splice(i, 1);
        }
      }
    };

    //Crear método controller para crear nuevos registros
    $scope.create = function () {
      //Calcular precisión para la fecha
      var precisionyFechaCreacion = precisionFecha(this.fechaDeCreacion);
      this.fechaDeCreacion = precisionyFechaCreacion.fecha;
      var precisionCreacion = precisionyFechaCreacion.precision;

      //Usar los campos form para crear un nuevo objeto $resource obra
      var coleccion = new Colecciones({
        nombre: this.nombre,
        tipo: this.tipo,
        propiedadComodato: this.propiedadComodato,
        fechaDeCreacion: this.fechaDeCreacion,
        precision: precisionCreacion,
      });
      //Usar el método '$save' de obra para enviar una petición POST apropiada
      coleccion.$save(
        function (response) {
          Swal.fire({
            title: "¡Registro correcto!",
            text: "El registro se ha creado correctamente",
            icon: "success",
            confirmButtonText: "Cerrar",
          });
          //Si la obra fue creada de la manera correcta, redireccionar a la página de la obra
          $location.path("colecciones/" + response._id);
        },
        function (errorResponse) {
          //En caso contrario, presentar mensaje de error
          $scope.error = errorResponse.data.message;
          alert("No creado:" + errorResponse.data.message);
        }
      );
    };
    //Método controller para recuperar la lista de obras
    $scope.find = function () {
      //Usar el método 'querry' de obra, para enviar una petición GET apropiada
      $scope.colecciones = Colecciones.query();
    };

    //Método controller para recuperar una única obra
    $scope.findOne = function () {
      //Usa el método 'get' de obra para enviar una petición GET apropiada
      $scope.coleccion = Colecciones.get({
        coleccionId: $routeParams.coleccionId,
      });
    };

    //Método controller para actualizar una única obra
    $scope.update = function () {
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
      $scope.coleccion.$update(
        function () {
          Swal.fire({
            title: "¡Registro correcto!",
            text: "El registro se ha actualizado correctamente",
            icon: "success",
            confirmButtonText: "Cerrar",
          });
          //Si la actualización es correcta, redireccionar
          $location.path("colecciones/" + $scope.coleccion._id);
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
    $scope.delete = function (coleccion) {
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
          if (coleccion) {
            //Borrado
            //Usar el método '$remove' del la obra para borrarla
            obra.$remove(function () {
              //Eliminar la obra de la lista
              for (var i in $scope.colecciones) {
                if ($scope.colecciones[i] === coleccion) {
                  $scope.colecciones.splice(i, 1);
                }
              }
            });
          } else {
            //En otro caso usar el método $remove para borrar
            //Borrado exitoso
            $scope.coleccion.$remove(function () {
              Swal.fire({
                title: "Eliminación exitosa!",
                text: "El registro se ha eliminado correctamente",
                icon: "success",
                confirmButtonText: "Cerrar",
              });
              $location.path("colecciones");
            });
          }
        }
      });
    };
  },
]);

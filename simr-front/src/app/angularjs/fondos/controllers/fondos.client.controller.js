"use scrict";

//Controller fondos
angular.module("fondos").controller("FondosController", [
  "$scope",
  "$routeParams",
  "$location",
  "Authentication",
  "Obras",
  "Actores",
  "Fondos",
  "Diccionarios",
  function (
    $scope,
    $routeParams,
    $location,
    Authentication,
    Obras,
    Actores,
    Fondos,
    Diccionarios
  ) {
    //Exponer el servicio Authentication
    $scope.authentication = Authentication;
    $scope.tiposFondosColecciones = tiposFondosColecciones;
    $scope.idActores = [];
    $scope.idFechas = [];
    $scope.idCoberturas = [];
    $scope.idProyectos = [];
    $scope.actores = Actores.query();
    $scope.obrasAux = Obras.query();
    $scope.todoInput = [];
    $scope.actorName = [];
    $scope.diccionarios = Diccionarios.query();

    //Preparar datos
    $scope.actualizarTodo = function () {
      $scope.idEstados = this.ejemplar.estados;
    };
    window.onload = function () {
      $scope.loadDate();
    };

    $scope.loadDate = function () {
      fecha = formatDateYMD(
        $scope.fondo.fechaDeCreacion,
        $scope.fondo.precision
      );
      $scope.fechaDeCreacion = fecha;
      document.getElementById("fechaCreacion").value = fecha;
    };

    // Funciones auxiliares

    //Variables globales para ordenar la vista de lista
    $scope.propertyName = "nombre";
    $scope.reverse = false;

    //Ordena la vista de lista
    $scope.sortBy = function (propertyName) {
      $scope.reverse =
        $scope.propertyName === propertyName ? !$scope.reverse : false;
      $scope.propertyName = propertyName;
    };

    $scope.cargaFecha = function (f, p) {
      $scope.fechaDeCreacion = formatDateYMD(f, p);
    };

    $scope.updateFecha = function () {
      //Calcular precisión para la fecha
      var precisionyFechaCreacion = precisionFecha(
        document.getElementById("fechaCreacion").value
      );
      this.fechaDeCreacion = precisionyFechaCreacion.fecha;
      var precisionCreacion = precisionyFechaCreacion.precision;
      $scope.fondo.fechaDeCreacion = precisionyFechaCreacion.fecha;
      $scope.fondo.precision = precisionCreacion;
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
    $scope.validarFecha = (fecha, id) => validarFecha(fecha, id);
    $scope.formatDate = (date, precision = "AMD") =>
      formatDate(date, precision);
    $scope.formatDateYMD = (date, precision = "AMD") =>
      formatDateYMD(date, precision);
    $scope.parseFecha = function (d) {
      const timestamp = Date.parse(d);
      //console.log(timestamp); // 1686240000000
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        //console.log(date); // 2022-12-18T00:00:00.000Z
        const formattedDate = date.toISOString().slice(0, 10);
        //console.log(formattedDate); // 2022-12-18

        // Get a reference to the input element
        var inputElement = document.getElementById("fechaCreacion");

        // Set the value of the input element
        inputElement.setAttribute("value", formattedDate);
      }
    };

    $scope.verFecha = function (x) {
      y = "";
      for (var i in x) {
        y = y + $scope.formatDate(x[i].fechaDeCreacion, x[i].precision);
        if (i != x.length - 1) {
          y = y + ", ";
        }
      }
      return $scope.darFormato(y);
    };

    $scope.verRecurso = function (x) {
      y = "";
      for (var i in x) {
        y = $scope.recursoAux(x);
      }
      return y;
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

    //Crear método controller para crear nuevas registros
    $scope.create = function () {
      //Calcular precisión para la fecha
      var precisionyFechaCreacion = precisionFecha(this.fechaDeCreacion);
      this.fechaDeCreacion = precisionyFechaCreacion.fecha;
      var precisionCreacion = precisionyFechaCreacion.precision;
      //Usar los campos form para crear un nuevo objeto $resource obra
      var fondo = new Fondos({
        nombre: this.nombre,
        tipo: this.tipo,
        propiedadComodato: this.propiedadComodato,
        fechaDeCreacion: this.fechaDeCreacion,
        precision: precisionCreacion,
      });
      //Usar el método '$save' de obra para enviar una petición POST apropiada
      fondo.$save(
        function (response) {
          //Si la obra fue creada de la manera correcta, redireccionar a la página de la obra
          Swal.fire({
            title: "¡Registro correcto!",
            text: "El registro se ha creado correctamente",
            icon: "success",
            confirmButtonText: "Cerrar",
          });
          $location.path("fondos/" + response._id);
        },
        function (errorResponse) {
          //En caso contrario, presentar mensaje de error
          Swal.fire({
            title: "¡Error!",
            text: ($scope.error = errorResponse.data.message),
            icon: "error",
            confirmButtonText: "Cerrar",
          });
        }
      );
    };
    //Método controller para recuperar la lista de fondos
    $scope.find = function () {
      //Usar el método 'querry' de fondo, para enviar una petición GET apropiada
      $scope.fondos = Fondos.query();
    };

    //Método controller para recuperar una única fondo
    $scope.findOne = function () {
      //Usa el método 'get' de fondo para enviar una petición GET apropiada
      $scope.fondo = Fondos.get({
        fondoId: $routeParams.fondoId,
      });
    };

    //Método controller para actualizar un único fondo
    $scope.update = function () {
      //Usa el método $update de fondo para enviar la petición PUT adecuada
      $scope.fondo.$update(
        function () {
          //Si la actualización es correcta, redireccionar
          Swal.fire({
            title: "¡Registro correcto!",
            text: "El registro se ha actualizado correctamente",
            icon: "success",
            confirmButtonText: "Cerrar",
          });
          $location.path("fondos/" + $scope.fondo._id);
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

    //Método controller para borrar una fondo
    $scope.delete = function (fondo) {
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
          if (fondo) {
            //Borrado
            //Usar el método '$remove' del fondo para borrarlo
            fondo.$remove(function () {
              //Eliminar la obra de la lista
              for (var i in $scope.fondos) {
                if ($scope.fondos[i] === fondo) {
                  $scope.fondos.splice(i, 1);
                }
              }
            });
          } else {
            //En otro caso usar el método $remove para borrar
            //Borrado exitoso
            $scope.fondo.$remove(function () {
              Swal.fire({
                title: "Eliminación exitosa!",
                text: "El registro se ha eliminado correctamente",
                icon: "success",
                confirmButtonText: "Cerrar",
              });
              $location.path("fondos");
            });
          }
        }
      });
    };
  },
]);

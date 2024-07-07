"use scrict";

//Controller proyectos
angular.module("proyectos").controller("ProyectosController", [
  "$scope",
  "$routeParams",
  "$location",
  "Authentication",
  "Proyectos",
  "Actores",
  "Diccionarios",
  function (
    $scope,
    $routeParams,
    $location,
    Authentication,
    Proyectos,
    Actores,
    Diccionarios
  ) {
    //Exponer el servicio Authentication
    $scope.authentication = Authentication;
    //Específicos de proyecto
    $scope.roles = [
      "Asesor",
      "Auxiliar administrativo",
      "Co-investigador",
      "Colaborador",
      "Estudiante de doctorado",
      "Estudiante de maestría",
      "Estudiante de pregrado",
      "Investigador principal",
      "Investigador",
      "Servicios técnicos",
    ];
    $scope.estadosProyecto = estadosProyecto;
    //Específicos de proyecto
    $scope.eventos = [
      "Acta de finalización",
      "Acta de inicio",
      "Análisis de datos",
      "Construcción de informe",
      "Envío a convocatoria",
      "Finalización",
      "Formulación",
      "Inicio",
      "Procesamiento de información",
      "Prórroga",
      "Solicitud de prórroga",
      "Terminación",
      "Trabajo de campo",
    ];
    $scope.dEtiquetas = dEtiquetas;
    $scope.idActores = [];
    $scope.idFechas = [];
    $scope.idDescriptores = [];
    $scope.actores = Actores.query();
    $scope.todoInput = [];
    $scope.actorName = [];
    $scope.idEnlaces = [];
    $scope.diccionarios = Diccionarios.query();
    var control = 0;

    //Preparar datos
    $scope.actualizarTodo = function () {
      $scope.idActores = this.proyecto.investigadores;
      $scope.idFechas = this.proyecto.fechasAsociadas;
      $scope.idDescriptores = this.proyecto.descriptoresLibres;
      $scope.idEnlaces = this.proyecto.vinculoRelacionado;
    };

    // Funciones auxiliares
    $scope.validarFecha = (fecha, id) => validarFecha(fecha, id);
    $scope.validarUrloRuta = (url, id) => validarUrloRuta(url, id);
    $scope.formatDate = (date, precision = "AMD") =>
      formatDate(date, precision);
    $scope.nombrarSi = (nombre, x) => nombrarSi(nombre, x);

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

    $scope.abrirVentana = function (url) {
      window.open(url);
    };

    //Cargar los campos que tienen vectores para la vista de edición
    $scope.cargaActores = function (d) {
      for (var i in d) {
        delete d[i]._id;
      }
      $scope.idActores = [].concat(d);
    };

    $scope.cargaFechas = function (d) {
      for (var i in d) {
        delete d[i]._id;
      }
      $scope.idFechas = [].concat(d);
    };

    $scope.cargaDescriptores = function (d) {
      for (var i in d) {
        delete d[i]._id;
      }
      $scope.idDescriptores = [].concat(d);
    };

    $scope.cargaEnlaces = function (d) {
      for (var i in d) {
        delete d[i]._id;
      }
      $scope.idEnlaces = [].concat(d);
    };

    $scope.verInvestigadores = function (x) {
      y = "";
      for (var i in x) {
        y =
          y +
          $scope.actorAux(x[i].id) +
          " (" +
          x[i].rol +
          "), Activo desde: " +
          $scope.formatDate(x[i].activoDesde, x[i].precisionActivoDesde) +
          ", Hasta:" +
          $scope.formatDate(x[i].activoHasta, x[i].precisionActivoHasta);
        //Poner coma al final
        if (i != x.length - 1) {
          y = y + ", ";
        }
      }
      return $scope.darFormato(y);
    };

    $scope.verVinculo = function (x) {
      //Garantiza que Angulasjs no vuelva a ejecutar la función
      if (control == 1) {
        return;
      }
      for (var i in x) {
        //Crear enlace
        var a = document.createElement("a");
        a.title = x[i].etiqueta;
        a.href = x[i].url;
        a.target = "blank";
        var aTexto = document.createTextNode(x[i].etiqueta + " ");
        a.appendChild(aTexto);
        document.getElementById("enlaces").appendChild(a);
        control = 1;
      }
      return;
    };

    $scope.verFechas = function (x) {
      y = "";
      for (var i in x) {
        y =
          y +
          x[i].evento +
          ": " +
          $scope.formatDate(x[i].fecha, x[i].precision);
        if (i != x.length - 1) {
          y = y + ", ";
        }
      }
      return $scope.darFormato(y);
    };

    $scope.verDescriptor = function (x) {
      y = "";
      for (var i in x) {
        y = y + x[i].etiqueta + ": " + x[i].contenido + ", ";
      }
      return $scope.darFormato(y);
    };

    $scope.actorAux = function (aux) {
      for (var i in $scope.actores) {
        if ($scope.actores[i]._id === aux) {
          return $scope.actores[i].fullName;
        }
      }
    };

    $scope.updateActores = function () {
      $scope.actores = Actores.query();
    };

    $scope.actorAdd = function () {
      existe = false;
      //Fecha y precisión
      var precisionyFechaInicio = precisionFecha(this.fechaInicioActivo);
      this.fechaInicioActivo = precisionyFechaInicio.fecha;
      precisionInicio = precisionyFechaInicio.precision;

      //Fecha y precisión
      var precisionyFechaHasta = precisionFecha(this.fechaFinActivo);
      this.fechaFinActivo = precisionyFechaHasta.fecha;
      precisionFin = precisionyFechaHasta.precision;

      var x =
        "id:" +
        this.actor +
        ",rol:" +
        this.rol +
        ",activoDesde:" +
        this.fechaInicioActivo +
        ",activoHasta:" +
        this.fechaFinActivo +
        ",precisionActivoDesde:" +
        precisionInicio +
        ",precisionActivoHasta:" +
        precisionFin;

      var properties = x.split(",");
      var obj = {};
      properties.forEach(function (property) {
        var tup = property.split(":");
        obj[tup[0]] = tup[1];
      });
      if (
        this.actor === undefined ||
        this.actor === "" ||
        this.rol === undefined ||
        this.rol === ""
      ) {
        //Mostrar mensaje de error
        Swal.fire({
          title: "¡Error!",
          text: "Debe seleccionar un actor y un rol",
          icon: "error",
          confirmButtonText: "Cerrar",
        });
      } else {
        if ($scope.idActores.indexOf(x) === -1) {
          for (var i in $scope.idActores) {
            if (
              $scope.idActores[i].id === this.actor &&
              $scope.idActores[i].rol === this.rol
            ) {
              //Mensaje de error
              Swal.fire({
                title: "¡Error!",
                text: "El actor y rol se encuentran ya en la lista",
                icon: "error",
                confirmButtonText: "Cerrar",
              });
              existe = true;
              this.actor = "";
              this.rol = "";
              return;
            }
          }
        }
        if (existe === false) {
          $scope.idActores.push(obj);
          this.actor = "";
          this.rol = "";
          this.fechaInicioActivo = "";
          this.fechaFinActivo = "";
        }
      }
    };

    $scope.actorRemove = function (x) {
      for (var i in $scope.idActores) {
        if ($scope.idActores[i].id === x) {
          Swal.fire({
            title: "¡Advertencia de eliminación!",
            text:
              "Va a eliminar  " +
              $scope.actorAux(x) +
              ", " +
              $scope.idActores[i].rol,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Confirmar",
            cancelButtonText: "Cancelar",
          }).then((result) => {
            if (result.isConfirmed) {
              $scope.idActores.splice(i - 1, 1);
              // funcion propia de Angular.Js refresca mi scope y recarga mis datos
              $scope.$apply();
              Swal.fire("Eliminado!", "El actor ha sido eliminado", "success");
            }
          });
        }
      }
    };

    $scope.actorEdit = function (id, rol, desde, hasta) {
      var precisionActivoDesde = "";
      var precisionActivoHasta = "";
      //Busca y si encuentra elimina del vector correspondiente
      for (var i in $scope.idActores) {
        if ($scope.idActores[i].id === id && $scope.idActores[i].rol === rol) {
          precisionActivoDesde = $scope.idActores[i].precisionActivoDesde;
          precisionActivoHasta = $scope.idActores[i].precisionActivoHasta;
          $scope.idActores.splice(i, 1);
        }
      }
      document.getElementById("nombreActorId").value = id;
      document.getElementById("actorRolId").value = rol;
      document.getElementById("activoDesdeId").value = desde;
      document.getElementById("activoHastaId").value = hasta;
      //Devuelve los datos al modelo Angularjs
      $scope.actor = id;
      $scope.rol = rol;
      $scope.fechaInicioActivo = formatDateforEdit(desde, precisionActivoDesde);
      $scope.fechaFinActivo = formatDateforEdit(hasta, precisionActivoHasta);
    };

    $scope.actorEditForEdit = function (id, rol, desde, hasta) {
      var precisionActivoDesde = "";
      var precisionActivoHasta = "";
      //Busca y si encuentra elimina del vector correspondiente
      for (var i in $scope.idActores) {
        if ($scope.idActores[i].id === id && $scope.idActores[i].rol === rol) {
          precisionActivoDesde = $scope.idActores[i].precisionActivoDesde;
          precisionActivoHasta = $scope.idActores[i].precisionActivoHasta;
          $scope.idActores.splice(i, 1);
        }
      }
      fechaActivoDesde = formatDateYMD(desde, precisionActivoDesde);
      fechaActivoHasta = formatDateYMD(hasta, precisionActivoHasta);
      document.getElementById("nombreActorId").value = id;
      document.getElementById("actorRolId").value = rol;
      document.getElementById("activoDesdeId").value = fechaActivoDesde;
      document.getElementById("activoHastaId").value = fechaActivoHasta;
      //Devuelve los datos al modelo Angularjs
      $scope.actor = id;
      $scope.rol = rol;
      $scope.fechaInicioActivo = fechaActivoDesde;
      $scope.fechaFinActivo = fechaActivoHasta;
    };

    //Función para calcular la precisión de una fecha
    precisionFecha = function (fecha) {
      var arr = fecha.split("/");
      var ano = arr[0];
      var mes = arr[1];
      var dia = arr[2];
      var precision = "AMD";
      if (ano == 0) {
        precision = precision.replace("A", "");
        ano = 3000;
      }
      if (mes == 0) {
        precision = precision.replace("M", "");
        mes = 1;
      }
      if (dia == 0) {
        precision = precision.replace("D", "");
        dia = 1;
      }
      var fechayPrecision = new Object();
      fechayPrecision.fecha = ano + "/" + mes + "/" + dia;
      fechayPrecision.precision = precision;
      return fechayPrecision;
    };

    $scope.fechaAdd = function (f) {
      existe = false;
      //Fecha y precisión
      var precisionyFecha = precisionFecha(this.fecha);
      this.fecha = precisionyFecha.fecha;
      precision = precisionyFecha.precision;
      var x =
        "fecha:" +
        this.fecha +
        ",evento:" +
        this.evento +
        ",precision:" +
        precision;
      //Agregar precisión, cambiar los ceros por datos válidos
      var properties = x.split(",");
      var obj = {};
      properties.forEach(function (property) {
        var tup = property.split(":");
        obj[tup[0]] = tup[1];
      });

      if (
        this.fecha === undefined ||
        this.fecha === "" ||
        this.evento === undefined ||
        this.evento === ""
      ) {
        //Mostrar mensaje de error
        Swal.fire({
          title: "¡Error!",
          text: "Debe seleccionar una fecha y un evento",
          icon: "error",
          confirmButtonText: "Cerrar",
        });
      } else {
        if ($scope.idFechas.indexOf(x) === -1) {
          for (var i in $scope.idFechas) {
            if (
              $scope.idFechas[i].fecha === this.fecha ||
              $scope.idFechas[i].evento === this.evento
              //TODO: Resolver comparación de fechas para usar &&
            ) {
              //Mensaje de error
              Swal.fire({
                title: "¡Error!",
                text: "La fecha y el evento ya se encuentran ya en la lista",
                icon: "error",
                confirmButtonText: "Cerrar",
              });
              existe = true;
              this.fecha = "";
              this.evento = "";
              return;
            }
          }
        }
        if (existe === false) {
          $scope.idFechas.push(obj);
          this.fecha = "";
          this.evento = "";
        }
      }
    };

    $scope.fechaRemove = function (f) {
      for (var i in $scope.idFechas) {
        if ($scope.idFechas[i].evento === f) {
          Swal.fire({
            title: "¡Advertencia de eliminación!",
            text:
              "Va a eliminar  " +
              $scope.idFechas[i].fecha +
              ", " +
              $scope.idFechas[i].evento,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Confirmar",
            cancelButtonText: "Cancelar",
          }).then((result) => {
            if (result.isConfirmed) {
              $scope.idFechas.splice(i - 1, 1);
              // funcion propia de Angular.Js refresca mi scope y recarga mis datos
              $scope.$apply();
              Swal.fire(
                "Eliminado!",
                "La mención de responsabilidad ha sido eliminada.",
                "success"
              );
            }
          });
        }
      }
    };

    $scope.fechaEdit = function (evento, fecha) {
      var precisionFecha = "";
      //Busca y si encuentra elimina del vector correspondiente
      for (var i in $scope.idFechas) {
        if (
          $scope.idFechas[i].fecha === fecha &&
          $scope.idFechas[i].evento === evento
        ) {
          precisionFecha = $scope.idFechas[i].precision;
          $scope.idFechas.splice(i, 1);
        }
      }
      document.getElementById("fechaA").value = evento;
      document.getElementById("eventoId").value = fecha;
      //Devuelve los datos al modelo Angularjs
      $scope.evento = evento;
      $scope.fecha = formatDateforEdit(fecha, precision);
    };

    $scope.fechaEditForEdit = function (evento, fecha) {
      var precisionFecha = "";
      //Busca y si encuentra elimina del vector correspondiente
      for (var i in $scope.idFechas) {
        if (
          $scope.idFechas[i].fecha === fecha &&
          $scope.idFechas[i].evento === evento
        ) {
          precisionFecha = $scope.idFechas[i].precision;
          $scope.idFechas.splice(i, 1);
        }
      }
      fechaEditada = formatDateYMD(fecha, precisionFecha);
      document.getElementById("fechaA").value = evento;
      document.getElementById("eventoId").value = fecha;
      //Devuelve los datos al modelo Angularjs
      $scope.evento = evento;
      $scope.fecha = fechaEditada;
    };

    //Menú descriptores libres
    $scope.dDescriptorAdd = function () {
      existe = false;
      var x = "etiqueta:" + this.dEtiqueta + ",contenido:" + this.dContenido;
      var properties = x.split(",");
      var obj = {};
      properties.forEach(function (property) {
        var tup = property.split(":");
        obj[tup[0]] = tup[1];
      });
      if (
        this.dEtiqueta === undefined ||
        this.dEtiqueta === "" ||
        this.dContenido === undefined ||
        this.dContenido === ""
      ) {
        //Mostrar mensaje de error
        Swal.fire({
          title: "¡Error!",
          text: "Debe seleccionar un Debe colocar una etiqueta y un contenido",
          icon: "error",
          confirmButtonText: "Cerrar",
        });
      } else {
        if ($scope.idDescriptores.indexOf(x) === -1) {
          for (var i in $scope.idDescriptores) {
            if (
              $scope.idDescriptores[i].etiqueta === this.dEtiqueta &&
              $scope.idDescriptores[i].contenido === this.dContenido
            ) {
              //Mensaje de error
              Swal.fire({
                title: "¡Error!",
                text: "La etiqueta ya se encuentran en la lista",
                icon: "error",
                confirmButtonText: "Cerrar",
              });
              existe = true;
              return;
            }
          }
        }
        if (existe === false) {
          $scope.idDescriptores.push(obj);
          this.dEtiqueta = "";
          this.dContenido = "";
        }
      }
    };

    $scope.dDescriptorRemove = function (x, y) {
      for (var i in $scope.idDescriptores) {
        if (
          $scope.idDescriptores[i].contenido === y &&
          $scope.idDescriptores[i].etiqueta === x
        ) {
          Swal.fire({
            title: "¡Advertencia de eliminación!",
            text:
              "Va a eliminar  " +
              $scope.idDescriptores[i].etiqueta +
              ", " +
              $scope.idDescriptores[i].contenido,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Confirmar",
            cancelButtonText: "Cancelar",
          }).then((result) => {
            if (result.isConfirmed) {
              $scope.idDescriptores.splice(i - 1, 1); //Nunca se ejecuta
              // funcion propia de Angular.Js refresca mi scope y recarga mis datos
              $scope.$apply();
              Swal.fire(
                "Eliminado!",
                "El descriptor ha sido eliminado.",
                "success"
              );
            }
          });
        }
      }
    };

    $scope.descriptorEdit = function (x, y) {
      document.getElementById("descEtiquetaId").value = x;
      document.getElementById("descContenidoId").value = y;
      //Devuelve los datos al modelo Angularjs
      $scope.dEtiqueta = x;
      $scope.dContenido = y;
      //Busca y si encuentra elimina del vector correspondiente
      for (var i in $scope.idDescriptores) {
        if (
          $scope.idDescriptores[i].etiqueta === x &&
          $scope.idDescriptores[i].contenido === y
        ) {
          $scope.idDescriptores.splice(i, 1);
        }
      }
    };

    //Menú enlaces
    $scope.enlaceAdd = function () {
      existe = false;
      var x = "etiqueta*" + this.eEtiqueta + ",url*" + this.eUrl;
      var properties = x.split(",");
      var obj = {};
      properties.forEach(function (property) {
        var tup = property.split("*");
        obj[tup[0]] = tup[1];
      });
      if (
        this.eEtiqueta === undefined ||
        this.eEtiqueta === "" ||
        this.eUrl === undefined ||
        this.eUrl === ""
      ) {
        //Mostrar mensaje de error
        Swal.fire({
          title: "¡Error!",
          text: "Debe ingresar todos los datos",
          icon: "error",
          confirmButtonText: "Cerrar",
        });
      } else {
        if ($scope.idEnlaces.indexOf(x) === -1) {
          for (var i in $scope.idEnlaces) {
            if (
              $scope.idEnlaces[i].etiqueta === this.eEtiqueta &&
              $scope.idEnlaces[i].url === this.eUrl
            ) {
              //Mensaje de error
              Swal.fire({
                title: "¡Error!",
                text: "El enlace se ya encuentra en la lista",
                icon: "error",
                confirmButtonText: "Cerrar",
              });
              existe = true;
              return;
            }
          }
        }
        if (existe === false) {
          $scope.idEnlaces.push(obj);
          this.eEtiqueta = "";
          this.eUrl = "";
        }
      }
    };

    $scope.enlaceRemove = function (x, y) {
      for (var i in $scope.idEnlaces) {
        if (
          $scope.idEnlaces[i].etiqueta === x &&
          $scope.idEnlaces[i].url === y
        ) {
          Swal.fire({
            title: "¡Advertencia de eliminación!",
            text:
              "Va a eliminar: Descripción " +
              $scope.idEnlaces[i].etiqueta +
              ", Url: " +
              $scope.idEnlaces[i].url,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Confirmar",
            cancelButtonText: "Cancelar",
          }).then((result) => {
            if (result.isConfirmed) {
              $scope.idEnlaces.splice(i - 1, 1);
              // funcion propia de Angular.Js refresca mi scope y recarga mis datos
              $scope.$apply();
              Swal.fire(
                "Eliminado!",
                "El enlace ha sido eliminado.",
                "success"
              );
            }
          });
        }
      }
    };

    $scope.enlaceEdit = function (x, y) {
      document.getElementById("nombreEnlace").value = x;
      document.getElementById("urlEnlace").value = y;
      //Devuelve los datos al modelo Angularjs
      $scope.eEtiqueta = x;
      $scope.eUrl = y;
      //Busca y si encuentra elimina del vector correspondiente
      for (var i in $scope.idEnlaces) {
        if (
          $scope.idEnlaces[i].etiqueta === x &&
          $scope.idEnlaces[i].url === y
        ) {
          $scope.idEnlaces.splice(i, 1);
        }
      }
    };

    //Crear método controller para crear nuevas obras
    $scope.create = function () {
      //Usar los campos form para crear un nuevo objeto $resource obra
      var proyecto = new Proyectos({
        nombre: this.nombre,
        estado: this.estado,
        investigadores: $scope.idActores,
        fechasAsociadas: $scope.idFechas,
        descriptoresLibres: $scope.idDescriptores,
        vinculoRelacionado: $scope.idEnlaces,
      });
      //Usar el método '$save' de obra para enviar una petición POST apropiada
      proyecto.$save(
        function (response) {
          Swal.fire({
            title: "¡Registro correcto!",
            text: "El registro se ha creado correctamente",
            icon: "success",
            confirmButtonText: "Cerrar",
          });
          //Si la obra fue creada de la manera correcta, redireccionar a la página de la obra
          $location.path("proyectos/" + response._id);
        },
        function (errorResponse) {
          //En caso contrario, presentar mensaje de error
          $scope.error = errorResponse.data.message;
        }
      );
    };
    //Método controller para recuperar la lista de obras
    $scope.find = function () {
      //Usar el método 'querry' de obra, para enviar una petición GET apropiada
      $scope.proyectos = Proyectos.query();
    };

    //Método controller para recuperar una única obra
    $scope.findOne = function () {
      //Usa el método 'get' de obra para enviar una petición GET apropiada
      $scope.proyecto = Proyectos.get({
        proyectoId: $routeParams.proyectoId,
      });
    };

    //Método controller para actualizar una única obra
    $scope.update = function () {
      //Agregar vectores para que se actualicen, el  es porque si no se hace click en la carga, el vector queda vacío
      if ($scope.idActores.length != 0) {
        $scope.proyecto.investigadores = $scope.idActores;
      }

      if ($scope.idFechas.length != 0) {
        $scope.proyecto.fechasAsociadas = $scope.idFechas;
      }

      if ($scope.idDescriptores.length != 0) {
        $scope.proyecto.descriptoresLibres = $scope.idDescriptores;
      }

      if ($scope.idEnlaces.length != 0) {
        $scope.proyecto.vinculoRelacionado = $scope.idEnlaces;
      }

      //Usa el método $update de proyecto para enviar la petición PUT adecuada
      $scope.proyecto.$update(
        function () {
          //Si la actualización es correcta, redireccionar
          Swal.fire({
            title: "¡Registro correcto!",
            text: "El registro se ha actualizado correctamente",
            icon: "success",
            confirmButtonText: "Cerrar",
          });
          $location.path("proyectos/" + $scope.proyecto._id);
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
    $scope.delete = function (proyecto) {
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
          if (proyecto) {
            //Borrado
            //Usar el método '$remove' del la obra para borrarla
            proyecto.$remove(function () {
              //Eliminar la obra de la lista
              for (var i in $scope.proyectos) {
                if ($scope.proyectos[i] === proyecto) {
                  $scope.proyectos.splice(i, 1);
                }
              }
            });
          } else {
            //En otro caso usar el método $remove para borrar
            //Borrado exitoso
            $scope.proyecto.$remove(function () {
              Swal.fire({
                title: "Eliminación exitosa!",
                text: "El registro se ha eliminado correctamente",
                icon: "success",
                confirmButtonText: "Cerrar",
              });
              $location.path("proyectos");
            });
          }
        }
      });
    };
  },
]);

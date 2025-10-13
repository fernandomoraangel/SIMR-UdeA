"use strict";

//Controller Actores
angular.module("actores").controller("ActoresController", [
  "$scope",
  "$routeParams",
  "$location",
  "Authentication",
  "Actores",
  "Diccionarios",
  "ArchivoService",
  function (
    $scope,
    $routeParams,
    $location,
    Authentication,
    Actores,
    Diccionarios,
    ArchivoService
  ) {
    //Exponer el servicio Authentication
    // $scope.authentication = Authentication;
    $scope.auth = Authentication.state;
    $scope.diccionarios = Diccionarios.query();
    $scope.coberturas = coberturas;
    $scope.lugares = lugares;
    $scope.dEtiquetas = dEtiquetas;
    $scope.idContenedores = [];
    $scope.idAnotacionesCartograficoTemporales = [];
    $scope.idDescriptores = [];
    $scope.idEnlaces = [];
    $scope.archivosCargados = [];
    $scope.documentId = $routeParams.actorId;
    $scope.actores = Actores.query();
    // $scope.archivos = Archivos.query();

    var vm = this;

    vm.eliminarArchivo = function (filename) {
      Archivos.deleteFile(filename)
        .then(function (data) {
          console.log("Archivo eliminado:", data.message);
        })
        .catch(function (error) {
          console.error("No se pudo eliminar el archivo", error);
        });
    };

    var control = 0;
    // Funciones auxiliares
    $scope.validarFecha = (fecha, id) => validarFecha(fecha, id);
    $scope.validarUrloRuta = (url, id) => validarUrloRuta(url, id);
    $scope.formatDate = (date, precision = "AMD") =>
      formatDate(date, precision);
    $scope.formatDateYMD = (date, precision = "AMD") =>
      formatDateYMD(date, precision);
    $scope.nombrarSi = (nombre, x) => nombrarSi(nombre, x);

    // Función para formatear anotaciones cartográfico temporales sin campos vacíos
    $scope.formatearAnotacionCartografica = function (c) {
      var partes = [];

      if (c.lugar && c.lugar !== "" && c.lugar !== "undefined") {
        partes.push("Lugar: " + c.lugar);
      }
      if (
        c.coberturaAmplitud &&
        c.coberturaAmplitud !== "" &&
        c.coberturaAmplitud !== "undefined"
      ) {
        partes.push("Cobertura: " + c.coberturaAmplitud);
      }
      if (c.evento && c.evento !== "" && c.evento !== "undefined") {
        partes.push("Evento: " + c.evento);
      }
      if (
        c.fechaInicio &&
        c.fechaInicio !== "" &&
        c.fechaInicio !== "undefined"
      ) {
        partes.push(
          "Inicio: " + $scope.formatDate(c.fechaInicio, c.precisionInicio)
        );
      }
      if (c.fechaFin && c.fechaFin !== "" && c.fechaFin !== "undefined") {
        partes.push(
          "Finalización: " + $scope.formatDate(c.fechaFin, c.precisionFin)
        );
      }
      if (c.evidencia && c.evidencia !== "" && c.evidencia !== "undefined") {
        partes.push("Evidencia: " + c.evidencia);
      }

      return partes.join("; ");
    };

    //Variables globales para ordenar la vista de lista
    $scope.propertyName = "apellidos";
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

    // Funciones auxiliares
    //Cargar los campos que tienen vectores para la vista de edición
    //Actualizar para editar

    $scope.cargaContenedores = function (d) {
      //console.log(d);
      for (var i in d) {
        delete d[i]._id;
      }
      $scope.idContenedores = [].concat(d);
    };

    $scope.cargaAnotacionesCartograficoTemporales = function (d) {
      for (var i in d) {
        delete d[i]._id;
      }
      $scope.idAnotacionesCartograficoTemporales = [].concat(d);
    };

    $scope.cargaDescriptores = function (d) {
      //console.log(d);
      for (var i in d) {
        delete d[i]._id;
      }
      $scope.idDescriptores = [].concat(d);
    };

    $scope.cargaEnlaces = function (d) {
      //console.log(d);
      for (var i in d) {
        delete d[i]._id;
      }
      $scope.idEnlaces = [].concat(d);
    };

    $scope.actualizarTodo = function () {
      $scope.idContenedores = this.actor.contenedor;
      $scope.idAnotacionesCartograficoTemporales =
        this.actor.anotacionCartograficoTemporal;
      $scope.idDescriptores = this.actor.descriptores;
      $scope.idEnlaces = this.actor.vinculoRelacionado;
      // $scope.archivosCargados = this.actor.archivosAdjuntos;
    };
    // Ver
    $scope.verContenedores = function (x) {
      let y = "";
      for (var i in x) {
        y = y + $scope.actorAux(x[i].id);
        //Poner coma al final
        if (i != x.length - 1) {
          y = y + ", ";
        }
      }
      return $scope.darFormato(y);
    };

    $scope.verAnotacion = function (x) {
      let y = "";
      for (var i in x) {
        y =
          y +
          "Lugar: " +
          x[i].lugar +
          ", Evento: " +
          x[i].evento +
          ", Amplitud de cobertura: " +
          x[i].coberturaAmplitud +
          ", Inicio: " +
          $scope.formatDate(x[i].fechaInicio, x[i].precisionInicio) +
          ", Fin: " +
          $scope.formatDate(x[i].fechaFin, x[i].precisionFin) +
          ", Evidencia: " +
          x[i].evidencia;
        //Poner coma al final
        if (i != x.length - 1) {
          y = y + ", ";
        }
      }
      return $scope.darFormato(y);
    };

    $scope.verDescriptor = function (x) {
      let y = "";
      for (var i in x) {
        y = y + x[i].etiqueta + ": " + x[i].contenido;
        //Poner coma al final
        if (i != x.length - 1) {
          y = y + "; ";
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
    //Actores
    $scope.updateActores = function () {
      $scope.actores = Actores.query();
    };

    $scope.actorAux = function (aux) {
      for (var i in $scope.actores) {
        if ($scope.actores[i].id === aux) {
          return $scope.actores[i].fullName;
        }
      }
    };

    $scope.actorAdd = function () {
      var existe = false;
      var x = "id:" + this.contenedor;
      var properties = x.split(",");
      var obj = {};
      properties.forEach(function (property) {
        var tup = property.split(":");
        obj[tup[0]] = tup[1];
      });
      if (this.contenedor === undefined || this.contenedor === "") {
        //Mostrar mensaje de error
        Swal.fire({
          title: "¡Error!",
          text: "Debe seleccionar un actor",
          icon: "error",
          confirmButtonText: "Cerrar",
        });
      } else {
        if ($scope.idContenedores.indexOf(x) === -1) {
          for (var i in $scope.idContenedores) {
            if ($scope.idContenedores[i].id === this.contenedor) {
              //Mensaje de error
              Swal.fire({
                title: "¡Error!",
                text: "El actor se ya encuentra en la lista",
                icon: "error",
                confirmButtonText: "Cerrar",
              });
              existe = true;
              this.contenedor = "";
              return;
            }
          }
        }
        if (existe === false) {
          $scope.idContenedores.push(obj);
          this.contenedor = "";
        }
      }
    };

    $scope.actorRemove = function (x) {
      for (var i in $scope.idContenedores) {
        if ($scope.idContenedores[i].id === x) {
          Swal.fire({
            title: "¡Advertencia de eliminación!",
            text: "Va a eliminar a " + $scope.actorAux(x),
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Confirmar",
            cancelButtonText: "Cancelar",
          }).then((result) => {
            if (result.isConfirmed) {
              $scope.idContenedores.splice(i - 1, 1); //Nunca se ejecuta
              // funcion propia de Angular.Js refresca mi scope y recarga mis datos
              $scope.$apply();
              Swal.fire("Eliminado!", "El actor ha sido eliminado.", "success");
            }
          });
        }
      }
    };
    //Anotaciones cartográfico temporales
    $scope.anotacionCartograficoTemporalAdd = function () {
      var existe = false;
      //Calcular precisión para fecha inicio
      var precisionyFechaInicio = precisionFecha(this.fechaDeInicio);
      this.fechaDeInicio = precisionyFechaInicio.fecha;
      var precisionInicio = precisionyFechaInicio.precision;

      //Calcular precisión para fecha fin
      var precisionyFechaFin = precisionFecha(this.fechaDeFin);
      this.fechaDeFin = precisionyFechaFin.fecha;
      var precisionFin = precisionyFechaFin.precision;

      var x =
        "lugar:" +
        this.lugar +
        ",evento:" +
        this.evento +
        ",coberturaAmplitud:" +
        this.coberturaAmplitud +
        ",fechaInicio:" +
        this.fechaDeInicio +
        ",fechaFin:" +
        this.fechaDeFin +
        ",precisionInicio:" +
        precisionInicio +
        ",precisionFin:" +
        precisionFin +
        ",evidencia:" +
        this.evidencia;
      var properties = x.split(",");
      var obj = {};
      properties.forEach(function (property) {
        var tup = property.split(":");
        obj[tup[0]] = tup[1];
      });
      // Validación: al menos un campo debe estar lleno
      if (
        (!this.lugar || this.lugar === "") &&
        (!this.evento || this.evento === "") &&
        (!this.coberturaAmplitud || this.coberturaAmplitud === "") &&
        (!this.fechaDeInicio || this.fechaDeInicio === "") &&
        (!this.fechaDeFin || this.fechaDeFin === "") &&
        (!this.evidencia || this.evidencia === "")
      ) {
        //Mostrar mensaje de error - todos los campos vacíos
        Swal.fire({
          title: "¡Error!",
          text: "Debe completar al menos un campo de la sección de anotaciones cartográfico temporales",
          icon: "error",
          confirmButtonText: "Cerrar",
        });
      } else {
        if ($scope.idAnotacionesCartograficoTemporales.indexOf(x) === -1) {
          for (var i in $scope.idAnotacionesCartograficoTemporales) {
            if (
              $scope.idAnotacionesCartograficoTemporales[i].lugar ===
                this.lugar ||
              $scope.idAnotacionesCartograficoTemporales[i].evento ===
                this.evento
              //TODO: Resolver comparación de fechas para usar &&
            ) {
              //Mensaje de error
              Swal.fire({
                title: "¡Error!",
                text: "EL elemento ya se encuentra en la lista",
                icon: "error",
                confirmButtonText: "Cerrar",
              });
              existe = true;
              this.lugar = "";
              this.evento = "";
              this.coberturaAmplitud = "";
              this.fechaDeInicio = "";
              this.fechaDeFin = "";
              this.evidencia = "";
              return;
            }
          }
        }
        if (existe === false) {
          $scope.idAnotacionesCartograficoTemporales.push(obj);
          this.lugar = "";
          this.evento = "";
          this.coberturaAmplitud = "";
          this.fechaDeInicio = "";
          this.fechaDeFin = "";
          this.evidencia = "";
        }
      }
    };

    $scope.anotacionCartograficoTemporalRemove = function (x) {
      for (var i in $scope.idAnotacionesCartograficoTemporales) {
        if ($scope.idAnotacionesCartograficoTemporales[i].lugar === x) {
          Swal.fire({
            title: "¡Advertencia de eliminación!",
            text:
              "va a eliminar a " +
              $scope.idAnotacionesCartograficoTemporales[i].lugar +
              "; " +
              $scope.idAnotacionesCartograficoTemporales[i].evento +
              "; " +
              $scope.idAnotacionesCartograficoTemporales[i].coberturaAmplitud +
              "; " +
              $scope.formatDate(
                $scope.idAnotacionesCartograficoTemporales[i].fechaInicio,
                $scope.idAnotacionesCartograficoTemporales[i].precisionInicio
              ) +
              "; " +
              $scope.formatDate(
                $scope.idAnotacionesCartograficoTemporales[i].fechaFin,
                $scope.idAnotacionesCartograficoTemporales[i].precisionFin
              ) +
              "; " +
              $scope.idAnotacionesCartograficoTemporales[i].evidencia,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Confirmar",
            cancelButtonText: "Cancelar",
          }).then((result) => {
            if (result.isConfirmed) {
              $scope.idAnotacionesCartograficoTemporales.splice(i - 1, 1);
              // funcion propia de Angular.Js refresca mi scope y recarga mis datos
              $scope.$apply();
              Swal.fire(
                "Eliminado!",
                "La anotación cartográfica-temporal ha sido eliminada",
                "success"
              );
            }
          });
        }
      }
    };

    $scope.anotacionCartograficoTemporalEdit = function (
      lugar,
      coberturaAmplitud,
      evento,
      fechaInicio,
      fechaFin,
      evidencia
    ) {
      var precisionInicio = "";
      var precisionFin = "";
      //Calcular precisión para fecha inicio
      //Busca y si encuentra elimina del vector correspondiente
      for (var i in $scope.idAnotacionesCartograficoTemporales) {
        if (
          $scope.idAnotacionesCartograficoTemporales[i].lugar === lugar &&
          $scope.idAnotacionesCartograficoTemporales[i].evento === evento &&
          $scope.idAnotacionesCartograficoTemporales[i].coberturaAmplitud ===
            coberturaAmplitud &&
          $scope.idAnotacionesCartograficoTemporales[i].fechaInicio ===
            fechaInicio &&
          $scope.idAnotacionesCartograficoTemporales[i].fechaFin === fechaFin &&
          $scope.idAnotacionesCartograficoTemporales[i].evidencia === evidencia
        ) {
          precisionInicio =
            $scope.idAnotacionesCartograficoTemporales[i].precisionInicio;
          precisionFin =
            $scope.idAnotacionesCartograficoTemporales[i].precisionFin;
          $scope.idAnotacionesCartograficoTemporales.splice(i, 1);
        }
      }
      document.getElementById("lugarId").value = lugar;
      document.getElementById("coberturaId").value = coberturaAmplitud;
      document.getElementById("eventoId").value = evento;
      document.getElementById("fInicio").value = fechaInicio;
      document.getElementById("fFin").value = fechaFin;
      document.getElementById("evidenciaId").value = evidencia;
      //Devuelve los datos al modelo Angularjs
      $scope.lugar = lugar;
      $scope.coberturaAmplitud = coberturaAmplitud;
      $scope.evento = evento;
      $scope.fechaDeInicio = formatDateforEdit(fechaInicio, precisionInicio);
      $scope.fechaDeFin = formatDateforEdit(fechaFin, precisionFin);
      $scope.evidencia = evidencia;
    };

    $scope.anotacionCartograficoTemporalEditForEdit = function (
      lugar,
      coberturaAmplitud,
      evento,
      fechaInicio,
      fechaFin,
      evidencia
    ) {
      var precisionInicio = "";
      var precisionFin = "";

      //Calcular precisión para fecha inicio
      //Busca y si encuentra elimina del vector correspondiente
      for (var i in $scope.idAnotacionesCartograficoTemporales) {
        if (
          $scope.idAnotacionesCartograficoTemporales[i].lugar === lugar &&
          $scope.idAnotacionesCartograficoTemporales[i].evento === evento &&
          $scope.idAnotacionesCartograficoTemporales[i].coberturaAmplitud ===
            coberturaAmplitud &&
          $scope.idAnotacionesCartograficoTemporales[i].fechaInicio ===
            fechaInicio &&
          $scope.idAnotacionesCartograficoTemporales[i].fechaFin === fechaFin &&
          $scope.idAnotacionesCartograficoTemporales[i].evidencia === evidencia
        ) {
          precisionInicio =
            $scope.idAnotacionesCartograficoTemporales[i].precisionInicio;
          precisionFin =
            $scope.idAnotacionesCartograficoTemporales[i].precisionFin;
          $scope.idAnotacionesCartograficoTemporales.splice(i, 1);
        }
      }
      fInicio = formatDateYMD(fechaInicio, precisionInicio);
      fFin = formatDateYMD(fechaFin, precisionFin);
      document.getElementById("lugarId").value = lugar;
      document.getElementById("coberturaId").value = coberturaAmplitud;
      document.getElementById("eventoId").value = evento;
      document.getElementById("fInicio").value = fInicio;
      document.getElementById("fFin").value = fFin;
      document.getElementById("evidenciaId").value = evidencia;
      //Devuelve los datos al modelo Angularjs
      $scope.lugar = lugar;
      $scope.coberturaAmplitud = coberturaAmplitud;
      $scope.evento = evento;
      $scope.fechaDeInicio = fInicio;
      $scope.fechaDeFin = fFin;
      $scope.evidencia = evidencia;
    };

    //Menú descriptores libres
    $scope.dDescriptorAdd = function () {
      var existe = false;
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
              $scope.idDescriptores[i].dEtiqueta === this.dEtiqueta &&
              $scope.idDescriptores[i].dContenido === this.dContenido
            ) {
              //Mensaje de error
              Swal.fire({
                title: "¡Error!",
                text: "La etiqueta ya se encuentra en la lista",
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
    var angularAppOrigin = window.location.origin; // Usar el mismo origen (localhost:80)
    var angularWindowFileUpload;
    var angularWindowFileList;

    /*
      filename,
      originalName,
      mimetype,
      size,
      uploadDate,
      minioObjectName,
    */
    // $scope.fileInfo;

    $scope.subirArchivo = function () {
      console.log(
        "Subir archivo (angularWindowFileUpload)",
        angularWindowFileUpload
      );
      this.fileInfo = null;
      ArchivoService.agregarListener(); // Asegurar que el listener esté activo
      if (angularWindowFileUpload && !angularWindowFileUpload.closed) {
        angularWindowFileUpload.focus();
      } else {
        angularWindowFileUpload = window.open(
          "http://localhost/angular/files/upload",
          "AngularApp",
          "width=563,height=365"
        );
      }
    };

    $scope.actorMessage = "";

    // (Testing)
    $scope.myMessageToAngular;
    $scope.sendMessageToAngular = function () {
      // const myMessage = {type: 'FILE_LIST', message: $scope.myMessageToAngular};
      if (angularWindowFileList && !angularWindowFileList.closed) {
        console.log(
          "Enviando mensaje de prueba a Angular:",
          $scope.myMessageToAngular
        );
        $scope.sendMessage("FILE_LIST", $scope.myMessageToAngular);
      } else {
        console.error("La ventana de Angular no está abierta");
      }
    };
    // (Fin de Testing)

    $scope.mostrarArchivos = function (actorId) {
      // if (!angularWindowFileList || angularWindowFileList.closed) {
      if (angularWindowFileList && !angularWindowFileList.closed) {
        angularWindowFileList.focus();
      } else {
        angularWindowFileList = window.open(
          angularAppOrigin + "/files",
          "AngularApp",
          "_blank"
        );
        $scope.actorMessage = actorId;
      }
    };

    // $scope.sendMessage2 = function (message) {
    //   var attempts = 0;
    //   var maxAttempts = 3;
    //   var interval = 500; // milisegundos

    //   function attemptSend() {
    //     if (angularWindowFileUpload && !angularWindowFileUpload.closed) {
    //       console.log('Enviando mensaje a Angular:', message);
    //       angularWindowFileUpload.postMessage(message, angularAppOrigin);
    //     } else if (attempts < maxAttempts) {
    //       attempts++;
    //       setTimeout(attemptSend, interval);
    //     } else {
    //       console.error('No se pudo enviar el mensaje después de varios intentos');
    //     }
    //   }
    //   attemptSend();
    // };

    // (Testing)
    // $scope.myMessageToAngular;
    // $scope.sendMessageToAngular = function () {
    //   try {
    //     if (!angularWindowFileList.closed) {
    //       console.log('angularWindowFileList:', angularWindowFileList);
    //     }
    //     // if (!angularWindowFileUpload.closed) {
    //     //   console.log('angularWindowFileUpload:', angularWindowFileUpload);
    //     // }

    //     // const myMessage = 'Hola desde AngularJS';
    //     if (angularWindowFileList && !angularWindowFileList.closed) {
    //       console.log('Enviando mensaje a Angular:', $scope.myMessageToAngular);
    //       // angularWindowFileUpload.postMessage('Hola desde AngularJS', angularAppOrigin);
    //       angularWindowFileList.postMessage($scope.myMessageToAngular, angularAppOrigin);
    //     } else {
    //       console.error('La ventana de Angular no está abierta');
    //     }

    //   } catch (error) {
    //     console.log('error:', error);
    //   }
    // };
    // (Fin de Testing)

    // $scope.sendMessage = function () {
    //   // alert('Hola desde AngularJS');
    //   // Enviar mensaje a la aplicación Angular
    //   // Para ventanas abiertas con window.open
    //   if (angularWindowFileUpload) {
    //     angularWindowFileUpload.postMessage('Hola desde AngularJS', angularAppOrigin);
    //   }
    //   // Para iframes
    //   var iframe = document.getElementById('angularApp');
    //   iframe.contentWindow.postMessage('Hola desde AngularJS', angularAppOrigin);
    // };

    window.addEventListener(
      "message",
      function (event) {
        if (event.origin !== angularAppOrigin) return;

        if (event.data.type === "FILE_LIST" && event.data.status === "READY") {
          // Listado de Archivos
          console.log("La aplicación Angular está lista para recibir mensajes");
          console.log("Mensaje de Angular:", event);
          console.log("Mensaje de Angular:", event.data);
          $scope.sendMessage("FILE_LIST", $scope.actorMessage, "actores");
        } else if (event.data.type === "FILE_UPLOAD") {
          $scope.$apply(function () {
            $scope.fileInfo = JSON.parse(event.data.message);
            $scope.archivoAdd();
          });
        }
      },
      false
    );

    $scope.sendMessage = function (type, message, dbCollection) {
      const messagePrepared = {
        type: type,
        message: message,
        dbCollection: dbCollection,
      };
      switch (type) {
        case "FILE_LIST":
          if (angularWindowFileList && !angularWindowFileList.closed) {
            console.log(
              "Enviando mensaje a Angula(FILE_LIST):",
              messagePrepared
            );
            angularWindowFileList.postMessage(
              messagePrepared,
              angularAppOrigin
            );
          }
          break;
        case "FILE_UPLOAD":
          if (angularWindowFileUpload && !angularWindowFileUpload.closed) {
            console.log("Enviando mensaje a Angular(FILE_UPLOAD):", message);
            angularWindowFileUpload.postMessage(
              messagePrepared,
              angularAppOrigin
            );
          }
          break;
        default:
          console.error("Tipo no reconocido:", type);
      }
    };

    // // Escuchar mensajes de la aplicación Angular
    // window.addEventListener('message', function (event) {
    //   if (event.origin !== angularAppOrigin) return; // Origen de tu app Angular

    //   $scope.$apply(function () {
    //     // $scope.myMessageFromAngular = JSON.parse(event.data);
    //     $scope.myMessageFromAngular = event.data;
    //     console.log('Mensaje de Angular:', $scope.myMessageFromAngular);
    //   });

    //   // (Working)
    //   // // Escuchar mensajes de la aplicación Angular
    //   // window.addEventListener('message', function (event) {
    //   //   if (event.origin !== 'http://localhost:4200') return; // Origen de tu app Angular

    //   // $scope.$apply(function () {
    //   //   $scope.fileInfo = JSON.parse(event.data);
    //   //   $scope.archivoAdd();
    //   // });

    //   // var fileInfo = JSON.parse(event.data);
    //   // this.fileInfo = JSON.parse(event.data);
    //   // console.log('Información del archivo recibida:', this.fileInfo);
    //   // console.log('fileInfo.originalName', this.fileInfo.originalName);
    //   // Aquí puedes manejar la información del archivo como necesites
    // }, false);

    // window.addEventListener('message', function (event) {
    //   if (event.origin !== angularAppOrigin) return;

    //   $scope.$apply(function () {
    //     $scope.messageFromAngular = event.data;
    //   });
    // }, false);

    // $scope.archivoAdd = function () {
    //   if (this.fileInfo === undefined || this.fileInfo == null) {
    //     Swal.fire({
    //       title: "¡Error!",
    //       text: "Aún no ha subido algún archivo",
    //       icon: "error",
    //       confirmButtonText: "Cerrar",
    //     });
    //     return;
    //   }
    //   // existe = false;

    //   const datosArchivo = {
    //     nombre: this.fileInfo.originalName,
    //     id: this.fileInfo.documentId,
    //     minioObjectName: this.fileInfo.minioObjectName
    //   }

    //   $scope.archivosCargados.push(datosArchivo);
    //   $scope.fileInfo = null;
    // };

    // $scope.archivoRemove = function (x) {
    //   console.log('archivosCargados (antes de eliminar):', $scope.archivosCargados);
    //   for (var i in $scope.archivosCargados) {
    //     if ($scope.archivosCargados[i].id === x.id) {
    //       Swal.fire({
    //         title: "¡Advertencia de eliminación!",
    //         text:
    //           "Va a eliminar:" +
    //           $scope.archivosCargados[i].nombre,
    //         icon: "warning",
    //         showCancelButton: true,
    //         confirmButtonText: "Confirmar",
    //         cancelButtonText: "Cancelar",
    //       }).then((result) => {
    //         if (result.isConfirmed) {
    //           vm.eliminarArchivo(x.minioObjectName);
    //           $scope.archivosCargados.splice(i - 1, 1);
    //           // funcion propia de Angular.Js refresca mi scope y recarga mis datos
    //           $scope.$apply();
    //           Swal.fire(
    //             "Eliminado!",
    //             "El archivo ha sido eliminado.",
    //             "success"
    //           );
    //         }
    //       });
    //     }
    //   }
    //   console.log('archivosCargados (despues de eliminar):', $scope.archivosCargados);

    // };

    $scope.enlaceAdd = function () {
      var existe = false;
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
              $scope.idEnlaces[i].eEtiqueta === this.Etiqueta &&
              $scope.idEnlaces[i].url === this.Url
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

    $scope.enlaceRemove = function (x) {
      console.log("x", x);
      for (var i in $scope.idEnlaces) {
        if ($scope.idEnlaces[i].etiqueta === x) {
          Swal.fire({
            title: "¡Advertencia de eliminación!",
            text:
              "Va a eliminar: Descripción: " +
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

    //Crear método controller para crear nuevas Actores
    $scope.create = function () {
      const idArchivos = $scope.archivosCargados.map((archivo) => ({
        _id: archivo.id,
      }));

      // Revisa si los campos de enlace (etiqueta y url) contienen datos.
      // Si los tienen, los agrega al listado de enlaces
      if (
        this.eEtiqueta != undefined &&
        this.eEtiqueta != "" &&
        this.eUrl != undefined &&
        this.eUrl != ""
      ) {
        const enlace = { etiqueta: this.eEtiqueta, url: this.eUrl };
        $scope.idEnlaces.push(enlace);
      }

      //Usar los campos form para crear un nuevo objeto $resource actor
      var actor = new Actores({
        nombres: this.nombres,
        apellidos: this.apellidos,
        nombreReunion: this.nombreReunion,
        contenedor: $scope.idContenedores,
        anotacionCartograficoTemporal:
          $scope.idAnotacionesCartograficoTemporales,
        descriptores: $scope.idDescriptores,
        vinculoRelacionado: $scope.idEnlaces,
        archivosAdjuntos: idArchivos,
      });

      //Usar el método '$save' de actor para enviar una petición POST apropiada
      actor.$save(
        function (response) {
          //Si el actor fue creada de la manera correcta, redireccionar a la página de la actor
          Swal.fire({
            title: "¡Registro correcto!",
            text: "El registro se ha creado correctamente",
            icon: "success",
            confirmButtonText: "Cerrar",
          });
          $location.path("actores/" + response._id);
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

    //Método controller para recuperar la lista de Actores
    $scope.find = function () {
      //Usar el método 'querry' de actor, para enviar una petición GET apropiada
      $scope.actores = Actores.query();
    };

    //Método controller para recuperar una única actor
    $scope.findOne = function () {
      //Usa el método 'get' de actor para enviar una petición GET apropiada
      $scope.actor = Actores.get({
        actorId: $routeParams.actorId,
      });
    };

    //Método controller para actualizar una única actor
    $scope.update = async function () {
      try {
        //Agregar vectores para que se actualicen, el  es porque si no se hace click en la carga, el vector queda vacío
        if ($scope.idContenedores.length != 0) {
          $scope.actor.contenedor = $scope.idContenedores;
        }

        if ($scope.idAnotacionesCartograficoTemporales.length != 0) {
          $scope.actor.anotacionCartograficoTemporal =
            $scope.idAnotacionesCartograficoTemporales;
        }

        if ($scope.idDescriptores.length != 0) {
          $scope.actor.descriptores = $scope.idDescriptores;
        }

        if ($scope.idEnlaces.length != 0) {
          $scope.actor.vinculoRelacionado = $scope.idEnlaces;
        }

        const archivosActualizados =
          await ArchivoService.actualizarListadoArchivos(
            "actores",
            $scope.documentId,
            $scope.archivosCargados
          );
        $scope.actor.archivosAdjuntos = archivosActualizados || [];

        //Usa el método $update de actor para enviar la petición PUT adecuada
        $scope.actor.$update(
          function () {
            //Si la actualización es correcta, redireccionar
            Swal.fire({
              title: "¡Registro correcto!",
              text: "El registro se ha actualizado correctamente",
              icon: "success",
              confirmButtonText: "Cerrar",
            });
            $location.path("actores/" + $scope.actor._id);
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
      } catch (error) {
        console.error("Error al actualizar:", error);
      }
    };

    //Método controller para borrar una actor
    $scope.delete = function (actor) {
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
          if (actor) {
            //Borrado
            //Usar el método '$remove' del la obra para borrarla
            actor.$remove(function () {
              //Eliminar la obra de la lista
              for (var i in $scope.actores) {
                if ($scope.actores[i] === actor) {
                  $scope.obras.splice(i, 1);
                }
              }
            });
          } else {
            //En otro caso usar el método $remove para borrar
            //Borrado exitoso
            $scope.actor.$remove(function () {
              Swal.fire({
                title: "Eliminación exitosa!",
                text: "El registro se ha eliminado correctamente",
                icon: "success",
                confirmButtonText: "Cerrar",
              });
              $location.path("actores");
            });
          }
        }
      });

      //Si una actor es enviado al método, borrarlo
      if (actor) {
        //Usar el método '$remove' del  actor para borrarlo
        actor.$remove(function () {
          //Eliminar la actor de la lista
          for (var i in $scope.Actores) {
            if ($scope.Actores[i] === actor) {
              $scope.Actores.splice(i, 1);
            }
          }
        });
      } else {
        //En otro caso usar el método $remove para borrar
        $scope.actor.$remove(function () {
          $location.path("actores");
        });
      }
    };

    // Limpiar el listener cuando se destruya el $scope
    $scope.$on("$destroy", function () {
      try {
        window.removeEventListener("message", messageListener);
        console.log("Listener de message removido");
      } catch (error) {
        console.error("Error al remover el listener de message:", error);
      }
    });
  },
]);

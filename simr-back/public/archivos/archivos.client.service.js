angular.module("archivos", []).factory("ArchivoService", [
  "$resource",
  "$http",
  "$window",
  "$rootScope",
  "$q",
  function ($resource, $http, $window, $rootScope, $q) {
    // Variables globales del servicio
    const angularJSOrigin = "http://localhost:3000";
    const apiUrl = "http://localhost:3000/files";
    const angularAppOrigin = window.location.origin;
    const Archivo = $resource(
      apiUrl + "/api/archivos/:archivoId",
      { archivoId: "@_id" },
      { update: { method: "PUT" } }
    );

    // Variables para ventanas
    let angularWindowFileUpload;
    let angularWindowFileList;
    let listenerActivo = false;
    let mensajeAEnviar = { type: "", message: "", dbCollection: "" };

    // Mapeo de tipos de documento a sus colecciones
    const collectionMapping = {
      actores: "Actor",
      generos: "Genero Musical",
      generosNoMusicales: "Genero No Musical",
      instrumentos: "Instrumento",
      materias: "Materia",
      medios: "Medio Sonoro",
      obras: "Obra",
      proyectos: "Proyecto",
      recursos: "Recurso",
      sistemas: "Sistema Sonoro",
    };

    // Funciones base del servicio
    const service = {
      agregarListener,
      removerListener,
      subirArchivo,
      getDocumentFiles,
      mostrarArchivos,
      deleteFile,
      getAll: () => Archivo.query().$promise,
      get: (id) => Archivo.get({ archivoId: id }).$promise,
      create: (archivo) => Archivo.save(archivo).$promise,
      update: (archivo) =>
        Archivo.update({ archivoId: archivo._id }, archivo).$promise,
      actualizarListadoArchivos,
    };

    // Función para recibir mensajes
    function recibirMensaje(event) {
      console.log(
        "📨 (ArchivoService) Mensaje recibido:",
        event.data,
        "desde origen:",
        event.origin
      );

      if (event.origin !== angularAppOrigin) {
        console.log(
          "(ArchivoService) Origen no válido:",
          event.origin,
          "esperado:",
          angularAppOrigin
        );
        return;
      }

      let messageType = "";
      let data = null;

      console.log(
        "(ArchivoService) Mensaje recibido desde origen válido:",
        event.data
      );

      switch (event.data.type) {
        case "FILE_UPLOAD":
          messageType = "archivoSubido";
          const { originalName, documentId, minioObjectName } = JSON.parse(
            event.data.message
          );
          data = {
            nombre: originalName,
            id: documentId,
            minioObjectName: minioObjectName,
          };

          // Forward the FILE_UPLOAD message to the file list window if it's open
          if (angularWindowFileList && !angularWindowFileList.closed) {
            console.log("Forwarding FILE_UPLOAD message to file list window");
            angularWindowFileList.postMessage(event.data, angularAppOrigin);
          }
          break;
        case "FILE_LIST":
          if (event.data.status != "READY") break;
          console.log(
            "✅ Mensaje FILE_LIST READY recibido, enviando datos del documento..."
          );
          messageType = "archivoListo";
          data = event.data.message;
          enviarMensaje(
            mensajeAEnviar.type,
            mensajeAEnviar.message,
            mensajeAEnviar.dbCollection
          );
          break;
        case "FILE_DELETED":
          messageType = "archivoEliminado";
          data = event.data.message;
          break;
        default:
          console.error("Tipo no reconocido:", event.data.type);
          return;
      }

      $rootScope.$apply(() => {
        $rootScope.$broadcast(messageType, data);
      });
    }

    function agregarListener() {
      if (!listenerActivo) {
        $window.addEventListener("message", recibirMensaje, false);
        listenerActivo = true;
        console.log("✅ Listener de postMessage activado");
      }
      console.log("Listener activo:", listenerActivo);
    }

    function removerListener() {
      if (listenerActivo) {
        $window.removeEventListener("message", recibirMensaje, false);
        listenerActivo = false;
      }
      if (angularWindowFileUpload && !angularWindowFileUpload.closed) {
        angularWindowFileUpload.close();
      }
      console.log("Listener activo:", listenerActivo);
    }

    // Enviar mensaje a la ventana emergente
    function enviarMensaje(type, message, dbCollection) {
      const messagePreprocessed = {
        type: type,
        message: message,
        dbCollection: dbCollection,
      };
      switch (type) {
        case "FILE_LIST":
          if (angularWindowFileList && !angularWindowFileList.closed) {
            console.log(
              "Enviando mensaje a Angular(FILE_LIST):",
              messagePreprocessed
            );
            console.log(
              "Enviando mensaje a Angular - angularAppOrigin (FILE_LIST):",
              angularAppOrigin
            );
            angularWindowFileList.postMessage(
              messagePreprocessed,
              angularAppOrigin
            );
          }
          break;
        case "FILE_UPLOAD":
          if (angularWindowFileUpload && !angularWindowFileUpload.closed) {
            console.log("Enviando mensaje a Angular(FILE_UPLOAD):", message);
            angularWindowFileUpload.postMessage(
              messagePreprocessed,
              angularAppOrigin
            );
          }
          break;
        default:
          console.error("Tipo no reconocido:", type);
      }
    }

    function subirArchivo() {
      if (angularWindowFileUpload && !angularWindowFileUpload.closed) {
        angularWindowFileUpload.focus();
      } else {
        // Configuración mejorada para el popup
        const windowFeatures = [
          "width=563",
          "height=365",
          "toolbar=no",
          "location=no",
          "menubar=no",
          "scrollbars=yes",
          "resizable=yes",
          "status=no",
        ].join(",");

        console.log("Abriendo popup de upload de archivos...");
        angularWindowFileUpload = $window.open(
          "http://localhost/angular/files/upload",
          "AngularApp",
          windowFeatures
        );

        // Verificar si el popup se abrió correctamente
        if (angularWindowFileUpload) {
          console.log("Popup abierto exitosamente");
          // Mantener referencia activa al popup
          angularWindowFileUpload.focus();

          // Agregar listener para mensajes del popup Angular
          const messageListener = function (event) {
            console.log("Mensaje recibido del popup:", event);
            if (
              event.origin === window.location.origin &&
              event.data &&
              event.data.type === "FILE_UPLOAD"
            ) {
              console.log(
                "✅ Archivo subido recibido via postMessage:",
                event.data
              );
              handleFileUploadResult(event.data);
              // Limpiar el listener
              $window.removeEventListener("message", messageListener);
            }
          };
          $window.addEventListener("message", messageListener, false);

          // Agregar listener para localStorage como respaldo
          console.log("🚀 INICIANDO POLLING DE LOCALSTORAGE...");
          const checkLocalStorage = setInterval(function () {
            try {
              console.log("🔍 Verificando localStorage para archivos...");
              const storageData = localStorage.getItem(
                "angular_file_upload_result"
              );
              console.log("📦 Datos en localStorage:", storageData);

              if (storageData) {
                const data = JSON.parse(storageData);
                console.log("📊 Datos parseados:", data);
                console.log("⏰ Timestamp actual:", Date.now());
                console.log("⏰ Timestamp del archivo:", data.timestamp);
                console.log("⏰ Diferencia:", Date.now() - data.timestamp);

                // Verificar que el mensaje es reciente (5 minutos para debug)
                if (data.timestamp && Date.now() - data.timestamp < 300000) {
                  console.log(
                    "✅ Archivo subido recibido via localStorage:",
                    data
                  );
                  handleFileUploadResult(data);
                  // Limpiar el localStorage
                  localStorage.removeItem("angular_file_upload_result");
                  clearInterval(checkLocalStorage);
                } else {
                  console.log(
                    "⚠️ Datos en localStorage demasiado antiguos o sin timestamp"
                  );
                  console.log(
                    "⚠️ Timestamp diferencia:",
                    Date.now() - (data.timestamp || 0)
                  );
                }
              } else {
                console.log("📭 No hay datos en localStorage");
              }
            } catch (error) {
              console.error("❌ Error leyendo localStorage:", error);
            }
          }, 500);

          // Opcional: agregar listener para cuando se cierre el popup
          const checkClosed = setInterval(function () {
            if (angularWindowFileUpload.closed) {
              clearInterval(checkClosed);
              clearInterval(checkLocalStorage);
              $window.removeEventListener("message", messageListener);
              console.log("Popup cerrado");
              angularWindowFileUpload = null;
            }
          }, 1000);
        } else {
          console.error("No se pudo abrir el popup (posiblemente bloqueado)");
          alert(
            "No se pudo abrir la ventana de subida de archivos. Verifique que los popups no estén bloqueados."
          );
        }
      }
    }

    // Función para manejar el resultado de la subida de archivos
    function handleFileUploadResult(data) {
      console.log("🎯 Procesando resultado de subida de archivo:", data);

      try {
        let fileInfo;

        // Si data.message es string, parsearlo
        if (typeof data.message === "string") {
          fileInfo = JSON.parse(data.message);
        } else {
          fileInfo = data.message;
        }

        console.log("📁 Información del archivo procesada:", fileInfo);

        // Mostrar notificación de éxito
        if (typeof Swal !== "undefined") {
          Swal.fire({
            title: "¡Éxito!",
            text: `Archivo "${fileInfo.originalName}" subido correctamente`,
            icon: "success",
            confirmButtonText: "Aceptar",
          });
        } else {
          alert(`Archivo "${fileInfo.originalName}" subido correctamente`);
        }

        // Disparar evento personalizado para que el controlador lo capture
        const customEvent = new CustomEvent("fileUploadSuccess", {
          detail: fileInfo,
        });
        window.dispatchEvent(customEvent);

        console.log("✅ Resultado de subida procesado exitosamente");
      } catch (error) {
        console.error("❌ Error procesando resultado de subida:", error);
      }
    }

    async function actualizarListadoArchivos(
      dbCollection,
      documentId,
      archivosNuevos
    ) {
      try {
        if (!collectionMapping[dbCollection]) {
          throw new Error(`Tipo de colección no soportado: ${dbCollection}`);
        }
        let archivosActuales =
          (await getDocumentFiles(dbCollection, documentId)) || [];

        // Preparando datos para actualizar
        archivosActuales = archivosActuales.map((archivo) => ({
          _id: archivo.id,
        }));
        const archivosNuevosPreparados = archivosNuevos.map((archivo) => ({
          _id: archivo.id,
        }));

        const archivosActualizados = [
          ...archivosActuales,
          ...(archivosNuevosPreparados || []),
        ];
        return archivosActualizados;
      } catch (error) {
        console.error(`Error actualizando archivos de ${dbCollection}:`, error);
        throw error;
      }
    }

    // function mostrarArchivos(documentId, dbCollection) {
    function mostrarArchivos(documentId, documentName, dbCollection) {
      console.log("📂 Abriendo ventana de archivos para:", {
        documentId,
        documentName,
        dbCollection,
      });

      if (angularWindowFileList && !angularWindowFileList.closed) {
        angularWindowFileList.close();
      }

      const documentInfo = {
        documentId: documentId,
        documentName: documentName,
        dbCollection: dbCollection,
      };

      mensajeAEnviar = {
        type: "FILE_LIST",
        message: documentInfo,
      };
      console.log("📝 Mensaje a enviar (mostrarArchivos):", mensajeAEnviar);

      // Guardar los datos en localStorage para que Angular los lea
      localStorage.setItem(
        "angular_file_list_params",
        JSON.stringify({
          documentId: documentId,
          documentName: documentName,
          dbCollection: dbCollection,
          timestamp: Date.now(),
        })
      );
      console.log("💾 Datos guardados en localStorage");

      // Configuración de la ventana emergente
      const windowFeatures = [
        "width=1200",
        "height=800",
        "toolbar=no",
        "location=no",
        "menubar=no",
        "scrollbars=yes",
        "resizable=yes",
        "status=no",
      ].join(",");

      angularWindowFileList = $window.open(
        angularAppOrigin + "/angular/files",
        "FileListWindow",
        windowFeatures
      );
    }

    function deleteFile(fileName, fileId) {
      const url = `${apiUrl}/${fileName}`;
      const additionalFileInfo = { fileInfo: { id: fileId } };
      const options = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      return $http
        .delete(url, angular.extend(options, { data: additionalFileInfo }))
        .then((response) => {
          return response.data; // Devuelve el mensaje de la respuesta
        })
        .catch((error) => {
          console.error("Error en la eliminación:", error);
          throw error;
        });
    }

    function getDocumentFiles(dbCollection, documentId) {
      return $http({
        method: "GET",
        url: apiUrl + "/document-files",
        params: {
          collection: dbCollection,
          documentId: documentId,
        },
      })
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          console.error("Error al obtener archivos:", error);
        });
    }

    return service;
  },
]);

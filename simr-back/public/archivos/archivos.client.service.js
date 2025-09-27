angular.module("archivos", []).factory("ArchivoService", [
  "$resource",
  "$http",
  "$window",
  "$rootScope",
  "$q",
  function ($resource, $http, $window, $rootScope, $q) {
    // var apiUrl = 'http://localhost:3000';
    const apiUrl = "http://localhost:3000/files";
    const angularAppOrigin = window.FRONTEND_URL;
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
      if (event.origin !== angularAppOrigin) return;

      let messageType = "";
      let data = null;

      console.log("(ArchivoService) Mensaje recibido:", event.data);

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
          break;
        case "FILE_LIST":
          if (event.data.status != "READY") break;
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
        angularWindowFileUpload = $window.open(
          angularAppOrigin + "/files/upload",
          "AngularApp",
          "width=563,height=365"
        );
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
      if (angularWindowFileList && !angularWindowFileList.closed) {
        angularWindowFileList.close();
      }
      angularWindowFileList = $window.open(
        angularAppOrigin + "/files",
        "_blank"
      );

      const documentInfo = {
        documentId: documentId,
        documentName: documentName,
        dbCollection: dbCollection,
      };

      mensajeAEnviar = {
        type: "FILE_LIST",
        message: documentInfo,
      };
      console.log("Mensaje a enviar (mostrarArchivos):", mensajeAEnviar);
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

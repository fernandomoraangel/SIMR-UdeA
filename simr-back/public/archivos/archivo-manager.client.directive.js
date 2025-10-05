angular.module("archivos").directive("archivoManager", [
  "ArchivoService",
  function (ArchivoService) {
    return {
      restrict: "E",
      scope: {
        templateType: "@",
        archivosCargados: "=?",
        archivosPorEliminar: "=?",
        documentId: "@?",
        documentName: "@?",
        dbCollection: "@?",
      },
      templateUrl: function (element, attrs) {
        switch (attrs.templateType) {
          case "create-view":
            return "archivos/templates/create-view.html";
          case "detail-view":
            return "archivos/templates/detail-view.html";
          case "edit-view":
            return "archivos/templates/edit-view.html";
          default:
            return `
              <p>No template found ${attrs.templateType}</p>
            `;
        }
      },

      link: function (scope, element, attrs) {
        // Imprimir un mensaje cuando la directiva se cargue
        console.log("Directiva miDirectiva cargada");

        // También puedes imprimir otros datos, como atributos o el scope
        console.log("Atributos:", attrs);

        // Imprimir cuando se haga clic en el elemento de la directiva
        element.on("click", function () {
          console.log("Elemento clickeado");
        });
      },

      controller: function ($scope, $element, $attrs) {
        // Inicializar valores por defecto para atributos opcionales
        $scope.templateType = $scope.templateType || "default";
        $scope.documentId = $scope.documentId || "";
        $scope.documentName = $attrs.documentName || ""; // $scope.documentName = $scope.documentName || '';
        $scope.dbCollection = $scope.dbCollection || "";
        $scope.archivosCargados = $scope.archivosCargados || [];

        if ($attrs.templateType === "edit-view") {
          $scope.archivosPorEliminar = $scope.archivosPorEliminar || [];
        }

        // Verificar si se proporcionaron atributos "requeridos"
        if (!$attrs.templateType) {
          // throw new Error('archivoManager: El atributo templateType es requerido.');
          console.warn(
            "archivoManager: El atributo templateType no fue proporcionado. Usando valor por defecto."
          );
        }

        ArchivoService.agregarListener();

        console.log("🎬 Directiva archivo-manager inicializada");
        console.log("📋 archivosCargados inicial:", $scope.archivosCargados);

        // Listener para el evento nativo de JavaScript
        function onFileUploadSuccess(event) {
          console.log(
            "📬 [DIRECTIVA] CustomEvent 'fileUploadSuccess' recibido!"
          );
          const fileInfo = event.detail;
          console.log("📦 Datos del archivo:", fileInfo);
          console.log(
            "📋 archivosCargados antes de agregar:",
            $scope.archivosCargados
          );

          try {
            // Crear objeto con la estructura correcta
            const archivoParaFormulario = {
              id: fileInfo.id || fileInfo.documentId,
              _id: fileInfo.id || fileInfo.documentId,
              filename: fileInfo.filename,
              originalName: fileInfo.originalName,
              mimetype: fileInfo.mimetype,
              size: fileInfo.size,
              uploadDate: fileInfo.uploadDate,
              minioObjectName: fileInfo.minioObjectName,
              // Campos adicionales
              nombre: fileInfo.originalName,
              url: fileInfo.filename,
            };

            console.log("🔧 Objeto procesado:", archivoParaFormulario);

            // Asegurar que archivosCargados está inicializado
            if (!$scope.archivosCargados) {
              console.log(
                "⚠️ archivosCargados no estaba inicializado, creando array"
              );
              $scope.archivosCargados = [];
            }

            $scope.archivosCargados.push(archivoParaFormulario);
            console.log(
              "✅ Archivo agregado a archivosCargados en directiva:",
              $scope.archivosCargados
            );
            console.log(
              "📊 Total de archivos:",
              $scope.archivosCargados.length
            );

            // Forzar actualización de la vista de manera segura
            if (!$scope.$$phase && !$scope.$root.$$phase) {
              $scope.$apply();
              console.log("🔄 $apply ejecutado");
            } else {
              console.log("⏭️ Ya en ciclo digest, $apply no necesario");
            }
          } catch (error) {
            console.error("❌ Error al agregar archivo:", error);
          }
        }

        // Agregar el listener del evento nativo
        window.addEventListener("fileUploadSuccess", onFileUploadSuccess);

        $scope.subirArchivo = function () {
          ArchivoService.subirArchivo();
        };

        $scope.mostrarArchivos = function () {
          ArchivoService.mostrarArchivos(
            $scope.documentId,
            $scope.documentName,
            $scope.dbCollection
          );
        };

        $scope.eliminarArchivo = function (archivo) {
          console.log("(Directiva) archivosCargados:", $scope.archivosCargados);
          console.log("(Eliminar archivo) archivo:", archivo);
          console.log(
            "documentId:",
            $scope.documentId,
            "dbCollection",
            $scope.dbCollection
          );
          const index = $scope.archivosCargados.indexOf(archivo);
          if (index > -1) {
            Swal.fire({
              title: "¡Advertencia de eliminación!",
              text: "Va a eliminar:" + $scope.archivosCargados[index].nombre,
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: "Confirmar",
              cancelButtonText: "Cancelar",
            }).then((result) => {
              if (result.isConfirmed) {
                ArchivoService.deleteFile(archivo.minioObjectName, archivo.id);
                $scope.archivosCargados.splice(index, 1);
                Swal.fire(
                  "Eliminado!",
                  "El archivo ha sido eliminado.",
                  "success"
                );
              }
            });
          }
        };

        // COMENTADO: Este listener duplica archivos porque también tenemos el CustomEvent listener
        // $scope.$on("archivoSubido", function (event, fileInfo) {
        //   console.log("📬 [DIRECTIVA] Evento 'archivoSubido' recibido!");
        //   console.log("📦 Datos del archivo:", fileInfo);
        //   console.log(
        //     "📋 archivosCargados antes de agregar:",
        //     $scope.archivosCargados
        //   );

        //   try {
        //     // Crear objeto con la estructura correcta
        //     const archivoParaFormulario = {
        //       id: fileInfo.id || fileInfo.documentId,
        //       _id: fileInfo.id || fileInfo.documentId,
        //       filename: fileInfo.filename,
        //       originalName: fileInfo.originalName,
        //       mimetype: fileInfo.mimetype,
        //       size: fileInfo.size,
        //       uploadDate: fileInfo.uploadDate,
        //       minioObjectName: fileInfo.minioObjectName,
        //       // Campos adicionales
        //       nombre: fileInfo.originalName,
        //       url: fileInfo.filename,
        //     };

        //     console.log("🔧 Objeto procesado:", archivoParaFormulario);

        //     // Asegurar que archivosCargados está inicializado
        //     if (!$scope.archivosCargados) {
        //       console.log(
        //         "⚠️ archivosCargados no estaba inicializado, creando array"
        //       );
        //       $scope.archivosCargados = [];
        //     }

        //     $scope.archivosCargados.push(archivoParaFormulario);
        //     console.log(
        //       "✅ Archivo agregado a archivosCargados en directiva:",
        //       $scope.archivosCargados
        //     );
        //     console.log(
        //       "📊 Total de archivos:",
        //       $scope.archivosCargados.length
        //     );
        //   } catch (error) {
        //     console.error("❌ Error al agregar archivo:", error);
        //   }
        // });

        $scope.$on("$destroy", function () {
          ArchivoService.removerListener();
          // Remover el listener del CustomEvent
          window.removeEventListener("fileUploadSuccess", onFileUploadSuccess);
          console.log("🧹 Listeners removidos en directiva");
        });
      },
    };
  },
]);

"use strict";

//Controller listas
angular.module("listas").controller("ListasController", [
  "$scope",
  "$routeParams",
  "$location",
  "Authentication",
  "Listas",
  "ListasElementos",
  function (
    $scope,
    $routeParams,
    $location,
    Authentication,
    Listas,
    ListasElementos
  ) {
    // Depuración: ver cambios en el filtro
    $scope.$watch("filtroLista", function (newVal, oldVal) {
      console.log("Filtro cambiado:", newVal);
    });
    //Exponer el servicio Authentication
    $scope.auth = Authentication.state;

    //Variables para filtros y gestión
    $scope.filtroLista = "";
    $scope.listas = [];
    $scope.selectedLista = null;
    $scope.newElement = "";
    $scope.newElementSigla = "";
    $scope.newElementFrase = "";
    $scope.editElement = "";
    $scope.editIndex = -1;

    //Cargar todas las listas
    $scope.find = function () {
      Listas.query(
        function (listas) {
          $scope.listas = listas;
          console.log("Listas cargadas:", $scope.listas.length);
        },
        function (error) {
          console.error("Error al cargar listas:", error);
          Swal.fire({
            title: "¡Error!",
            text: "Error al cargar las listas",
            icon: "error",
            confirmButtonText: "Cerrar",
          });
        }
      );
    };

    //Verificar si la lista seleccionada es nNormalizados
    $scope.isNNormalizados = function () {
      return (
        $scope.selectedLista &&
        $scope.selectedLista.nombre_lista === "nNormalizados"
      );
    };

    //Obtener sigla de metadata
    $scope.getMetadataSigla = function (index) {
      if (
        $scope.selectedLista &&
        $scope.selectedLista.metadata &&
        $scope.selectedLista.metadata[index]
      ) {
        return $scope.selectedLista.metadata[index].sigla;
      }
      return "";
    };

    //Obtener frase de metadata
    $scope.getMetadataFrase = function (index) {
      if (
        $scope.selectedLista &&
        $scope.selectedLista.metadata &&
        $scope.selectedLista.metadata[index]
      ) {
        return $scope.selectedLista.metadata[index].frase;
      }
      return "";
    };

    //Filtrar listas por nombre
    $scope.getFilteredListas = function () {
      // Si no hay listas cargadas, retornar array vacío
      if (!$scope.listas || !Array.isArray($scope.listas)) {
        return [];
      }

      // Si no hay filtro o es cadena vacía, retornar todas las listas
      if (!$scope.filtroLista || $scope.filtroLista.trim() === "") {
        return $scope.listas;
      }

      // Filtrar por nombre
      var filtro = $scope.filtroLista.toLowerCase().trim();
      var filtradas = $scope.listas.filter(function (lista) {
        if (!lista || !lista.nombre_lista) {
          return false;
        }
        return lista.nombre_lista.toLowerCase().indexOf(filtro) !== -1;
      });

      return filtradas;
    };

    //Limpiar el filtro
    $scope.limpiarFiltro = function () {
      $scope.filtroLista = "";
    };

    //Seleccionar una lista para gestión
    $scope.selectLista = function (lista) {
      $scope.selectedLista = lista;
      $scope.newElement = "";
      $scope.newElementSigla = "";
      $scope.newElementFrase = "";
      $scope.editElement = "";
      $scope.editIndex = -1;
    };

    //Agregar elemento a una lista
    $scope.addElement = function () {
      var elementoData;

      //Verificar si es nNormalizados
      if ($scope.isNNormalizados()) {
        if (
          !$scope.newElementSigla ||
          !$scope.newElementSigla.trim() ||
          !$scope.selectedLista
        )
          return;

        elementoData = {
          elemento: $scope.newElementSigla.trim(),
          metadata: {
            sigla: $scope.newElementSigla.trim(),
            frase: $scope.newElementFrase ? $scope.newElementFrase.trim() : "",
          },
        };
      } else {
        if (!$scope.newElement.trim() || !$scope.selectedLista) return;

        elementoData = {
          elemento: $scope.newElement.trim(),
        };
      }

      ListasElementos.save(
        {
          nombre_lista: $scope.selectedLista.nombre_lista,
        },
        elementoData,
        function (response) {
          //Actualizar la lista localmente
          if ($scope.isNNormalizados()) {
            $scope.selectedLista.elementos.push($scope.newElementSigla.trim());
            if (!$scope.selectedLista.metadata) {
              $scope.selectedLista.metadata = [];
            }
            $scope.selectedLista.metadata.push({
              sigla: $scope.newElementSigla.trim(),
              frase: $scope.newElementFrase
                ? $scope.newElementFrase.trim()
                : "",
            });
            $scope.newElementSigla = "";
            $scope.newElementFrase = "";
          } else {
            $scope.selectedLista.elementos.push($scope.newElement.trim());
            $scope.newElement = "";
          }
          $scope.selectedLista.fecha_modificacion = response.fecha_modificacion;

          Swal.fire({
            title: "¡Elemento agregado!",
            text: "El elemento se ha agregado correctamente",
            icon: "success",
            confirmButtonText: "Cerrar",
          });
        },
        function (error) {
          Swal.fire({
            title: "¡Error!",
            text: error.data.message || "Error al agregar elemento",
            icon: "error",
            confirmButtonText: "Cerrar",
          });
        }
      );
    };

    //Editar elemento
    $scope.startEdit = function (index) {
      $scope.editIndex = index;
      if ($scope.isNNormalizados()) {
        //Para nNormalizados, cargar sigla y frase
        $scope.editElement = {
          sigla:
            $scope.selectedLista.metadata &&
            $scope.selectedLista.metadata[index]
              ? $scope.selectedLista.metadata[index].sigla
              : "",
          frase:
            $scope.selectedLista.metadata &&
            $scope.selectedLista.metadata[index]
              ? $scope.selectedLista.metadata[index].frase
              : "",
        };
      } else {
        $scope.editElement = $scope.selectedLista.elementos[index];
      }
    };

    $scope.cancelEdit = function () {
      $scope.editIndex = -1;
      $scope.editElement = "";
    };

    $scope.saveEdit = function () {
      if ($scope.editIndex === -1) return;

      var elementoData;

      if ($scope.isNNormalizados()) {
        if (!$scope.editElement.sigla || !$scope.editElement.sigla.trim())
          return;

        elementoData = {
          elemento: $scope.editElement.sigla.trim(),
          metadata: {
            sigla: $scope.editElement.sigla.trim(),
            frase: $scope.editElement.frase
              ? $scope.editElement.frase.trim()
              : "",
          },
        };
      } else {
        if (!$scope.editElement.trim()) return;

        elementoData = {
          elemento: $scope.editElement.trim(),
        };
      }

      ListasElementos.update(
        {
          lista_id: $scope.selectedLista._id,
          elemento_index: $scope.editIndex,
        },
        elementoData,
        function (response) {
          //Actualizar la lista localmente
          if ($scope.isNNormalizados()) {
            $scope.selectedLista.elementos[$scope.editIndex] =
              $scope.editElement.sigla.trim();
            if (!$scope.selectedLista.metadata) {
              $scope.selectedLista.metadata = [];
            }
            $scope.selectedLista.metadata[$scope.editIndex] = {
              sigla: $scope.editElement.sigla.trim(),
              frase: $scope.editElement.frase
                ? $scope.editElement.frase.trim()
                : "",
            };
          } else {
            $scope.selectedLista.elementos[$scope.editIndex] =
              $scope.editElement.trim();
          }
          $scope.selectedLista.fecha_modificacion = response.fecha_modificacion;
          $scope.cancelEdit();

          Swal.fire({
            title: "¡Elemento actualizado!",
            text: "El elemento se ha actualizado correctamente",
            icon: "success",
            confirmButtonText: "Cerrar",
          });
        },
        function (error) {
          Swal.fire({
            title: "¡Error!",
            text: error.data.message || "Error al actualizar elemento",
            icon: "error",
            confirmButtonText: "Cerrar",
          });
        }
      );
    };

    //Eliminar elemento
    $scope.deleteElement = function (index) {
      Swal.fire({
        title: "¡Advertencia de eliminación!",
        text: "¿Realmente desea eliminar este elemento?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          ListasElementos.delete(
            {
              lista_id: $scope.selectedLista._id,
              elemento_index: index,
            },
            function (response) {
              //Actualizar la lista localmente
              $scope.selectedLista.elementos.splice(index, 1);
              $scope.selectedLista.fecha_modificacion =
                response.fecha_modificacion;

              Swal.fire({
                title: "¡Elemento eliminado!",
                text: "El elemento se ha eliminado correctamente",
                icon: "success",
                confirmButtonText: "Cerrar",
              });
            },
            function (error) {
              Swal.fire({
                title: "¡Error!",
                text: error.data.message || "Error al eliminar elemento",
                icon: "error",
                confirmButtonText: "Cerrar",
              });
            }
          );
        }
      });
    };

    //Crear nueva lista (comentado porque las listas se crean desde código)
    /*
    $scope.createLista = function () {
      var listaData = {
        nombre_lista: $scope.newListaNombre,
        elementos: [],
      };

      var nuevaLista = new Listas(listaData);
      nuevaLista.$save(
        function (response) {
          $scope.listas.push(response);
          $scope.newListaNombre = "";

          Swal.fire({
            title: "¡Lista creada!",
            text: "La lista se ha creado correctamente",
            icon: "success",
            confirmButtonText: "Cerrar",
          });
        },
        function (error) {
          Swal.fire({
            title: "¡Error!",
            text: error.data.message || "Error al crear lista",
            icon: "error",
            confirmButtonText: "Cerrar",
          });
        }
      );
    };
    */

    //Eliminar lista completa
    $scope.deleteLista = function (lista) {
      Swal.fire({
        title: "¡Advertencia de eliminación!",
        text: "¿Realmente desea eliminar esta lista completa?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          lista.$remove(
            function () {
              //Eliminar de la lista local
              var index = $scope.listas.indexOf(lista);
              if (index > -1) {
                $scope.listas.splice(index, 1);
              }
              if ($scope.selectedLista === lista) {
                $scope.selectedLista = null;
              }

              Swal.fire({
                title: "¡Lista eliminada!",
                text: "La lista se ha eliminado correctamente",
                icon: "success",
                confirmButtonText: "Cerrar",
              });
            },
            function (error) {
              Swal.fire({
                title: "¡Error!",
                text: error.data.message || "Error al eliminar lista",
                icon: "error",
                confirmButtonText: "Cerrar",
              });
            }
          );
        }
      });
    };

    //Inicializar
    $scope.find();
  },
]);

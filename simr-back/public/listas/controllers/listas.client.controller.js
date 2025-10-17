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
    //Exponer el servicio Authentication
    $scope.auth = Authentication.state;

    //Variables para filtros y gestión
    $scope.filtroLista = "";
    $scope.listas = [];
    $scope.selectedLista = null;
    $scope.newElement = "";
    $scope.editElement = "";
    $scope.editIndex = -1;

    //Cargar todas las listas
    $scope.find = function () {
      $scope.listas = Listas.query();
    };

    //Filtrar listas por nombre
    $scope.getFilteredListas = function () {
      // Obtener el valor del filtro desde el DOM si el scope está vacío
      var filtroValue =
        $scope.filtroLista ||
        (document.getElementById("filtroListaInput")
          ? document.getElementById("filtroListaInput").value
          : "");

      if (!filtroValue) {
        return $scope.listas;
      }
      return $scope.listas.filter(function (lista) {
        return lista.nombre_lista
          .toLowerCase()
          .includes(filtroValue.toLowerCase());
      });
    };

    //Seleccionar una lista para gestión
    $scope.selectLista = function (lista) {
      console.log("Seleccionando lista:", lista.nombre_lista);
      $scope.selectedLista = lista;
      // NO limpiar newElement aquí para evitar conflictos
      // $scope.newElement = "";
      $scope.editElement = "";
      $scope.editIndex = -1;
    };

    //Agregar elemento a una lista
    $scope.addElement = function () {
      console.log("=== INICIANDO addElement ===");

      // Intentar obtener el valor del DOM directamente
      var inputValue = document.getElementById("newElementInput")
        ? document.getElementById("newElementInput").value
        : "";
      console.log("Valor del input del DOM:", inputValue);
      console.log("Valor de $scope.newElement:", $scope.newElement);

      // Usar el valor del DOM si el scope está vacío
      var elementToAdd = $scope.newElement || inputValue;
      console.log("Elemento a agregar (final):", elementToAdd);

      console.log("Lista seleccionada:", $scope.selectedLista);

      if (!elementToAdd || !elementToAdd.trim() || !$scope.selectedLista) {
        console.log(
          "Validación fallida: elemento vacío o lista no seleccionada"
        );
        console.log("elementToAdd:", elementToAdd);
        console.log(
          "elementToAdd trimmed:",
          elementToAdd ? elementToAdd.trim() : "undefined/null"
        );
        console.log("selectedLista:", $scope.selectedLista);
        return;
      }

      console.log("=== VALIDACIÓN PASADA, ENVIANDO PETICIÓN ===");

      var elementoData = {
        elemento: elementToAdd.trim(),
      };

      console.log(
        "Enviando petición a:",
        "/api/listas/" + $scope.selectedLista.nombre_lista + "/elementos"
      );
      console.log("Datos:", elementoData);

      ListasElementos.save(
        {
          nombre_lista: $scope.selectedLista.nombre_lista,
        },
        elementoData,
        function (response) {
          console.log("Respuesta exitosa:", response);
          //Actualizar la lista localmente
          $scope.selectedLista.elementos.push(elementToAdd.trim());
          $scope.selectedLista.fecha_modificacion = response.fecha_modificacion;
          $scope.newElement = "";
          // Limpiar también el input del DOM
          if (document.getElementById("newElementInput")) {
            document.getElementById("newElementInput").value = "";
          }

          Swal.fire({
            title: "¡Elemento agregado!",
            text: "El elemento se ha agregado correctamente",
            icon: "success",
            confirmButtonText: "Cerrar",
          });
        },
        function (error) {
          console.error("Error al agregar elemento:", error);
          Swal.fire({
            title: "¡Error!",
            text: error.data?.message || "Error al agregar elemento",
            icon: "error",
            confirmButtonText: "Cerrar",
          });
        }
      );
    };

    //Editar elemento
    $scope.startEdit = function (index) {
      $scope.editIndex = index;
      $scope.editElement = $scope.selectedLista.elementos[index];
    };

    $scope.cancelEdit = function () {
      $scope.editIndex = -1;
      $scope.editElement = "";
    };

    $scope.saveEdit = function () {
      if (!$scope.editElement.trim() || $scope.editIndex === -1) return;

      var elementoData = {
        elemento: $scope.editElement.trim(),
      };

      ListasElementos.update(
        {
          lista_id: $scope.selectedLista._id,
          elemento_index: $scope.editIndex,
        },
        elementoData,
        function (response) {
          //Actualizar la lista localmente
          $scope.selectedLista.elementos[$scope.editIndex] =
            $scope.editElement.trim();
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

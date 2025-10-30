"use strict";

// Controlador principal de búsqueda
angular.module("search").controller("SearchController", [
  "$scope",
  "$location",
  "SearchService",
  "Authentication",
  function ($scope, $location, SearchService, Authentication) {
    var vm = this;

    // Inicialización
    vm.authentication = Authentication;
    vm.searchQuery = "";
    vm.searchResults = [];
    vm.isLoading = false;
    vm.error = null;
    vm.currentPage = 1;
    vm.totalResults = 0;
    vm.pageSize = 20;

    // Opciones de búsqueda
    vm.searchOptions = {
      entities: [], // Todas por defecto
      fields: [], // Todos los campos por defecto
      exact: false,
      limit: vm.pageSize,
      skip: 0,
    };

    // Metadatos de búsqueda
    vm.metadata = null;
    vm.availableEntities = [];
    vm.selectedEntities = [];

    // Cargar metadatos al inicializar
    loadMetadata();

    // Funciones del controlador
    vm.performSearch = function () {
      if (!vm.searchQuery.trim()) {
        vm.error = "Por favor ingrese un término de búsqueda";
        return;
      }

      vm.isLoading = true;
      vm.error = null;

      // Preparar opciones
      var options = angular.copy(vm.searchOptions);
      options.entities =
        vm.selectedEntities.length > 0 ? vm.selectedEntities : null;
      options.skip = (vm.currentPage - 1) * vm.pageSize;
      options.limit = vm.pageSize;

      SearchService.search(vm.searchQuery, options)
        .then(function (results) {
          vm.searchResults = results.results || [];
          vm.totalResults = results.total || 0;
          vm.isLoading = false;

          // Actualizar URL con parámetros de búsqueda
          $location.search({
            q: vm.searchQuery,
            entities: vm.selectedEntities.join(","),
            exact: vm.searchOptions.exact,
            page: vm.currentPage,
          });
        })
        .catch(function (error) {
          vm.error =
            "Error al realizar la búsqueda: " +
            (error.data ? error.data.message : error.message);
          vm.searchResults = [];
          vm.totalResults = 0;
          vm.isLoading = false;
        });
    };

    vm.clearSearch = function () {
      vm.searchQuery = "";
      vm.searchResults = [];
      vm.totalResults = 0;
      vm.currentPage = 1;
      vm.error = null;
      $location.search({});
    };

    vm.toggleEntity = function (entity) {
      var index = vm.selectedEntities.indexOf(entity);
      if (index > -1) {
        vm.selectedEntities.splice(index, 1);
      } else {
        vm.selectedEntities.push(entity);
      }
    };

    vm.isEntitySelected = function (entity) {
      return vm.selectedEntities.indexOf(entity) > -1;
    };

    vm.selectAllEntities = function () {
      vm.selectedEntities = angular.copy(vm.availableEntities);
    };

    vm.clearEntitySelection = function () {
      vm.selectedEntities = [];
    };

    vm.getEntityDisplayName = function (entity) {
      var displayNames = {
        Obra: "Obras",
        Actor: "Actores",
        Recurso: "Recursos",
        Genero: "Géneros",
        GeneroNoMusical: "Géneros No Musicales",
        Materia: "Materias",
        Instrumento: "Instrumentos",
        Proyecto: "Proyectos",
        Medio: "Medios",
        Sistema: "Sistemas",
        Fondo: "Fondos",
        Coleccion: "Colecciones",
        Ejemplar: "Ejemplares",
        Idioma: "Idiomas",
        Diccionario: "Diccionarios",
        Archivo: "Archivos",
        Lista: "Listas",
      };
      return displayNames[entity] || entity;
    };

    vm.getResultTitle = function (result) {
      // Determinar el título basado en el tipo de entidad
      switch (result._entityType) {
        case "Obra":
          return result.titulo || "Sin título";
        case "Actor":
          return (
            (result.nombres + " " + result.apellidos).trim() || "Sin nombre"
          );
        case "Recurso":
          return result.titulo || "Sin título";
        case "Genero":
        case "GeneroNoMusical":
          return result.nombre || "Sin nombre";
        default:
          return result.titulo || result.nombre || "Sin título";
      }
    };

    vm.getResultDescription = function (result) {
      // Determinar la descripción basada en el tipo de entidad
      switch (result._entityType) {
        case "Obra":
          return result.descripcion || "Sin descripción";
        case "Actor":
          return result.nombreReunion || "Sin información adicional";
        case "Recurso":
          return result.descripcion || "Sin descripción";
        case "Genero":
        case "GeneroNoMusical":
          return result.descripcion || "Sin descripción";
        default:
          return result.descripcion || "Sin descripción";
      }
    };

    vm.getResultLink = function (result) {
      // Generar enlace basado en el tipo de entidad
      var baseUrls = {
        Obra: "#/obras/",
        Actor: "#/actores/",
        Recurso: "#/recursos/",
        Genero: "#/generos/",
        GeneroNoMusical: "#/generosnomusicales/",
      };

      var baseUrl = baseUrls[result._entityType];
      if (baseUrl && result._id) {
        return baseUrl + result._id;
      }

      return "#";
    };

    // Paginación
    vm.nextPage = function () {
      if (vm.currentPage * vm.pageSize < vm.totalResults) {
        vm.currentPage++;
        vm.performSearch();
      }
    };

    vm.previousPage = function () {
      if (vm.currentPage > 1) {
        vm.currentPage--;
        vm.performSearch();
      }
    };

    vm.goToPage = function (page) {
      if (page >= 1 && page <= vm.getTotalPages()) {
        vm.currentPage = page;
        vm.performSearch();
      }
    };

    vm.getTotalPages = function () {
      return Math.ceil(vm.totalResults / vm.pageSize);
    };

    vm.getPageNumbers = function () {
      var totalPages = vm.getTotalPages();
      var pages = [];
      var start = Math.max(1, vm.currentPage - 2);
      var end = Math.min(totalPages, vm.currentPage + 2);

      for (var i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    };

    // Funciones auxiliares
    function loadMetadata() {
      SearchService.getMetadata()
        .then(function (metadata) {
          vm.metadata = metadata;
          vm.availableEntities = metadata.entities || [];
        })
        .catch(function (error) {
          console.error("Error cargando metadatos:", error);
          vm.availableEntities = [];
        });
    }

    // Verificar si hay parámetros de búsqueda en la URL
    var searchParams = $location.search();
    if (searchParams.q) {
      vm.searchQuery = searchParams.q;
      if (searchParams.entities) {
        vm.selectedEntities = searchParams.entities.split(",");
      }
      if (searchParams.exact) {
        vm.searchOptions.exact = searchParams.exact === "true";
      }
      if (searchParams.page) {
        vm.currentPage = parseInt(searchParams.page) || 1;
      }
      vm.performSearch();
    }
  },
]);

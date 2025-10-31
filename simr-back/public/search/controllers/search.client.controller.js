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
    vm.showEntityFilters = false;
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
      limit: vm.pageSize,
      skip: 0,
    };
    // Metadatos de búsqueda
    vm.metadata = null;
    vm.availableEntities = [];
    vm.selectedEntities = [];

    // Cargar metadatos al inicializar
    loadMetadata();

    // Función principal de búsqueda
    vm.performSearch = function (resetPage) {
      if (!vm.searchQuery.trim()) {
        vm.error = "Por favor ingrese un término de búsqueda";
        return;
      }
      if (resetPage) vm.currentPage = 1;
      if (vm.currentPage < 1) vm.currentPage = 1;
      vm.isLoading = true;
      vm.error = null;
      // Preparar opciones
      var options = angular.copy(vm.searchOptions);
      options.entities =
        vm.selectedEntities.length > 0 ? vm.selectedEntities : [];
      options.skip = (vm.currentPage - 1) * vm.pageSize;
      options.limit = vm.pageSize;
      SearchService.search(vm.searchQuery, options)
        .then(function (results) {
          // LOG: Mostrar resultados crudos en consola para depuración
          console.log("[SEARCH DEBUG] Resultados crudos:", results.results);
          vm.searchResults = results.results || [];
          vm.totalResults = results.total || 0;
          // Si la página actual no tiene resultados pero existen resultados, ir a la última página válida
          var totalPages = vm.getTotalPages();
          if (vm.currentPage > totalPages && totalPages > 0) {
            vm.currentPage = totalPages;
            vm.performSearch();
            return;
          }
          vm.isLoading = false;
          // Forzar la ruta a /search antes de actualizar los parámetros
          $location.path("/search");
          $location.search({
            q: vm.searchQuery,
            entities: vm.selectedEntities.join(","),
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
      vm.performSearch(true);
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

    // Mostrar en el título el primer campo válido, y en la descripción los demás campos, eliminando cualquier campo que sea id
    vm.getResultTitle = function (result) {
      const exclude = [
        "_id",
        "__v",
        "_entityType",
        "_searchScore",
        "creado",
        "modificado",
        "$hashKey",
        "$id",
        "$$hashKey",
      ];
      let first = null;
      for (const key in result) {
        if (
          !exclude.includes(key) &&
          typeof result[key] !== "object" &&
          result[key] !== undefined &&
          result[key] !== null &&
          String(result[key]).trim() !== "" &&
          !/id$/i.test(key)
        ) {
          first = result[key];
          break;
        }
      }
      let entityType = "";
      if (result._entityType && typeof vm.getEntityDisplayName === "function") {
        entityType = " (" + vm.getEntityDisplayName(result._entityType) + ")";
      } else if (result._entityType) {
        entityType = " (" + result._entityType + ")";
      }
      return first
        ? String(first) + entityType
        : "Sin información" + entityType;
    };

    vm.getResultDescription = function (result) {
      const exclude = [
        "_id",
        "__v",
        "_entityType",
        "_searchScore",
        "creado",
        "modificado",
        "$hashKey",
        "$id",
        "$$hashKey",
      ];
      let desc = [];
      let foundFirst = false;
      for (const key in result) {
        if (
          !exclude.includes(key) &&
          typeof result[key] !== "object" &&
          result[key] !== undefined &&
          result[key] !== null &&
          String(result[key]).trim() !== "" &&
          !/id$/i.test(key) // Excluir cualquier campo que termine en id (mayúscula o minúscula)
        ) {
          if (!foundFirst) {
            foundFirst = true;
            continue; // Saltar el primer campo (ya mostrado en título)
          }
          desc.push(key + ": " + result[key]);
        }
      }
      return desc.length > 0 ? desc.join(" | ") : "Sin información";
    };

    vm.getResultLink = function (result) {
      var baseUrls = {
        Obra: "#!/obras/",
        Actor: "#!/actores/",
        Recurso: "#!/recursos/",
        Genero: "#!/generos/",
        GeneroNoMusical: "#!/generosnomusicales/",
        Materia: "#!/materias/",
        Instrumento: "#!/instrumentos/",
        Proyecto: "#!/proyectos/",
        Medio: "#!/medios/",
        Sistema: "#!/sistemas/",
        Fondo: "#!/fondos/",
        Coleccion: "#!/colecciones/",
        Ejemplar: "#!/ejemplares/",
        Idioma: "#!/idiomas/",
        Diccionario: "#!/diccionarios/",
        Archivo: "#!/archivos/",
        Lista: "#!/listas/",
      };

      // Si hay _entityType y _id, usar baseUrl o fallback pluralizado
      if (result._entityType && result._id) {
        var baseUrl = baseUrls[result._entityType];
        if (baseUrl) {
          return baseUrl + result._id;
        }
        // Fallback: usar nombre en minúsculas y pluralizar (agregar 's')
        return "#!/" + result._entityType.toLowerCase() + "s/" + result._id;
      }

      // Si no hay _entityType pero hay _id, intentar deducir entidad por campos típicos
      if (result._id) {
        // Heurística: buscar campo característico
        if (result.titulo) return "#!/obras/" + result._id;
        if (result.nombres && result.apellidos)
          return "#!/actores/" + result._id;
        if (result.nombreReunion) return "#!/actores/" + result._id;
        if (result.nombre) return "#!/generos/" + result._id;
        // Fallback genérico: usar 'obras'
        return "#!/obras/" + result._id;
      }

      // Si no hay _id, no generar enlace
      return "#!/";
    };

    // Paginación
    vm.nextPage = function () {
      if (vm.currentPage * vm.pageSize < vm.totalResults) {
        vm.currentPage++;
        $location.path("/search");
        vm.performSearch();
      }
    };

    vm.previousPage = function () {
      if (vm.currentPage > 1) {
        vm.currentPage--;
        $location.path("/search");
        vm.performSearch();
      }
    };

    vm.goToPage = function (page) {
      if (page >= 1 && page <= vm.getTotalPages()) {
        vm.currentPage = page;
        $location.path("/search");
        vm.performSearch();
      }
    };

    vm.getTotalPages = function () {
      return Math.ceil(vm.totalResults / vm.pageSize);
    };

    vm.getPageNumbers = function () {
      var totalPages = vm.getTotalPages();
      var pages = [];
      var maxPagesToShow = 5;
      var start = Math.max(1, vm.currentPage - Math.floor(maxPagesToShow / 2));
      var end = Math.min(totalPages, start + maxPagesToShow - 1);
      if (end - start < maxPagesToShow - 1) {
        start = Math.max(1, end - maxPagesToShow + 1);
      }
      // Solo agregar páginas si hay resultados para esa página
      for (var i = start; i <= end; i++) {
        var skip = (i - 1) * vm.pageSize;
        // Si la página tiene al menos un resultado, mostrarla
        if (skip < vm.totalResults) {
          pages.push(i);
        }
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
      if (searchParams.page) {
        vm.currentPage = parseInt(searchParams.page) || 1;
      }
      vm.performSearch();
    }
  },
]);

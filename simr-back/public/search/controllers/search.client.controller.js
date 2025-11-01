"use strict";

// Controlador principal de búsqueda
angular.module("search").controller("SearchController", [
  "$scope",
  "$location",
  "$sce",
  "$filter",
  "SearchService",
  "Authentication",
  "MetadataMapper",
  function (
    $scope,
    $location,
    $sce,
    $filter,
    SearchService,
    Authentication,
    MetadataMapper
  ) {
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

    // Formato de visualización de metadatos
    vm.metadataFormat = "simr"; // Por defecto: SIMR nativo
    vm.availableFormats = MetadataMapper.getAvailableFormats();
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

    // Función para cambiar formato de metadatos
    vm.changeMetadataFormat = function (format) {
      vm.metadataFormat = format;
    };

    // Función para obtener metadatos formateados según el formato seleccionado
    vm.getFormattedMetadata = function (result) {
      // Usar el resultado original - el populate se hace en tiempo real en la vista
      switch (vm.metadataFormat) {
        case "marc21":
          return MetadataMapper.toMARC21(result);
        case "dublincore":
          return MetadataMapper.toDublinCore(result);
        case "simr":
        default:
          return MetadataMapper.toSIMR(result);
      }
    };

    // Función para poblar referencias en un resultado
    vm.populateResultReferences = function (result) {
      // Crear una copia del resultado para no modificar el original
      var populatedResult = angular.copy(result);

      // Recopilar todas las referencias que necesitan poblarse
      var referencesToPopulate = MetadataMapper.populateReferences(result);

      // Si no hay referencias que poblar, devolver el resultado original
      if (Object.keys(referencesToPopulate).length === 0) {
        return populatedResult;
      }

      // Función recursiva para poblar referencias en el objeto
      function populateObject(obj) {
        if (obj && typeof obj === "object") {
          if (Array.isArray(obj)) {
            return obj.map(function (item) {
              return populateObject(item);
            });
          } else {
            var populatedObj = {};
            for (var key in obj) {
              if (obj[key] && typeof obj[key] === "object" && obj[key]._id) {
                // Es una referencia, intentar poblarla desde cache
                var populatedRef = vm.getPopulatedReference(key, obj[key]);
                populatedObj[key] = populatedRef;
              } else if (obj[key] && typeof obj[key] === "object") {
                populatedObj[key] = populateObject(obj[key]);
              } else {
                populatedObj[key] = obj[key];
              }
            }
            return populatedObj;
          }
        }
        return obj;
      }

      // Poblar las referencias que ya están en cache
      populatedResult = populateObject(populatedResult);

      // Hacer llamadas AJAX para poblar las referencias faltantes
      for (var entityType in referencesToPopulate) {
        var ids = referencesToPopulate[entityType];
        // Eliminar duplicados
        ids = ids.filter(function (item, pos) {
          return ids.indexOf(item) === pos;
        });

        // Filtrar IDs que no están en cache
        var uncachedIds = ids.filter(function (id) {
          if (!vm.referenceCache) vm.referenceCache = {};
          if (!vm.referenceCache[entityType])
            vm.referenceCache[entityType] = {};
          return !vm.referenceCache[entityType][id];
        });

        if (uncachedIds.length > 0) {
          // Hacer llamada AJAX para obtener los datos faltantes (sin esperar)
          vm.fetchEntityData(entityType, uncachedIds);
        }
      }

      return populatedResult;
    };

    // Función para obtener datos de entidades por tipo e IDs
    vm.fetchEntityData = function (entityType, ids) {
      // Crear endpoint basado en el tipo de entidad
      var endpointMap = {
        Genero: "/api/generos",
        GeneroNoMusical: "/api/generosnomusicales",
        Materia: "/api/materias",
        Medio: "/api/medios",
        Sistema: "/api/sistemas",
        Idioma: "/api/idiomas",
        Actor: "/api/actores",
        Proyecto: "/api/proyectos",
        Recurso: "/api/recursos",
        NumeroNormalizado: "/api/numeros-normalizados",
      };

      var endpoint = endpointMap[entityType];
      if (!endpoint) {
        console.warn("No endpoint found for entity type:", entityType);
        return Promise.resolve([]);
      }

      // Hacer llamada AJAX para obtener los datos
      return SearchService.get(endpoint, {
        params: { ids: ids.join(",") },
      })
        .then(function (response) {
          var entities = response || [];

          // Guardar en cache
          if (!vm.referenceCache) vm.referenceCache = {};
          if (!vm.referenceCache[entityType])
            vm.referenceCache[entityType] = {};

          entities.forEach(function (entity) {
            vm.referenceCache[entityType][entity._id] = entity;
          });

          console.log(
            "Fetched and cached entities for",
            entityType,
            ":",
            entities.length
          );
          return entities;
        })
        .catch(function (error) {
          console.error(
            "Error fetching entity data for",
            entityType,
            ":",
            error
          );
          return [];
        });
    };

    // Función para obtener una referencia poblada desde cache o API
    vm.getPopulatedReference = function (fieldName, refObj) {
      if (!refObj || !refObj._id) return refObj;

      var cacheKey = refObj._id.toString();
      var entityType = MetadataMapper.getReferenceType(fieldName, refObj);

      if (!entityType) return refObj;

      // Verificar si ya tenemos esta referencia en cache
      if (!vm.referenceCache) vm.referenceCache = {};
      if (!vm.referenceCache[entityType]) vm.referenceCache[entityType] = {};

      if (vm.referenceCache[entityType][cacheKey]) {
        return vm.referenceCache[entityType][cacheKey];
      }

      // Si no está en cache, intentar obtenerla (por ahora devolver el objeto original)
      // En una implementación completa, aquí se haría una llamada AJAX para poblar
      return refObj;
    };

    // Función auxiliar para aplicar resaltado a texto
    vm.highlightText = function (text) {
      if (!text || !vm.searchQuery) {
        return text;
      }
      var highlightFilter = $filter("highlight");
      var highlighted = highlightFilter(text, vm.searchQuery);
      return $sce.trustAsHtml(highlighted);
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
      var title = first
        ? String(first) + entityType
        : "Sin información" + entityType;
      return title;
    };

    // Versión con resaltado del título
    vm.getResultTitleHighlighted = function (result) {
      var title = vm.getResultTitle(result);
      return vm.highlightText(title);
    };

    vm.getResultDescription = function (result) {
      // Usar el resultado poblado para mostrar referencias correctamente
      var populatedResult = vm.populateResultReferences(result);

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
      for (const key in populatedResult) {
        if (
          !exclude.includes(key) &&
          populatedResult[key] !== undefined &&
          populatedResult[key] !== null &&
          !/id$/i.test(key) // Excluir cualquier campo que termine en id (mayúscula o minúscula)
        ) {
          if (!foundFirst) {
            foundFirst = true;
            continue; // Saltar el primer campo (ya mostrado en título)
          }

          // Procesar el valor según su tipo
          var value = populatedResult[key];
          if (typeof value === "object") {
            if (Array.isArray(value)) {
              // Para arrays, extraer los nombres de las referencias pobladas
              var names = value
                .map(function (item) {
                  if (typeof item === "object" && item) {
                    return (
                      item.nombre ||
                      item.titulo ||
                      item.nombres ||
                      item._id ||
                      "Sin nombre"
                    );
                  }
                  return String(item);
                })
                .filter(function (name) {
                  return name && name.trim() !== "";
                });
              value = names.join(", ");
            } else if (value) {
              // Para objetos individuales, extraer el nombre
              value =
                value.nombre ||
                value.titulo ||
                value.nombres ||
                value._id ||
                "Sin nombre";
            }
          }

          if (String(value).trim() !== "") {
            desc.push(key + ": " + value);
          }
        }
      }
      var description = desc.length > 0 ? desc.join(" | ") : "Sin información";
      return description;
    };

    // Versión con resaltado de la descripción
    vm.getResultDescriptionHighlighted = function (result) {
      var description = vm.getResultDescription(result);
      return vm.highlightText(description);
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

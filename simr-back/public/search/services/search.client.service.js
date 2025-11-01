"use strict";

// Servicio de búsqueda para el frontend
angular.module("search").factory("SearchService", [
  "$http",
  "$q",
  function ($http, $q) {
    var service = {
      // Buscar en todas las entidades
      search: function (query, options) {
        options = options || {};
        var params = {
          q: query,
        };

        // Agregar opciones adicionales
        if (options.entities && options.entities.length > 0) {
          params.entities = Array.isArray(options.entities)
            ? options.entities
            : [options.entities];
        }
        if (options.fields) {
          params.fields = Array.isArray(options.fields)
            ? options.fields
            : [options.fields];
        }
        if (options.exact !== undefined) {
          params.exact = options.exact;
        }
        if (options.limit) {
          params.limit = options.limit;
        }
        if (options.skip) {
          params.skip = options.skip;
        }
        if (options.sort) {
          params.sort = JSON.stringify(options.sort);
        }

        return $http
          .get("/api/search", { params: params })
          .then(function (response) {
            return response.data;
          })
          .catch(function (error) {
            console.error("Error en búsqueda:", error);
            return $q.reject(error);
          });
      },

      // Buscar en entidad específica
      searchEntity: function (entity, query, options) {
        options = options || {};
        var params = {
          q: query,
        };

        // Agregar opciones adicionales
        if (options.fields) {
          params.fields = Array.isArray(options.fields)
            ? options.fields
            : [options.fields];
        }
        if (options.exact !== undefined) {
          params.exact = options.exact;
        }
        if (options.limit) {
          params.limit = options.limit;
        }
        if (options.skip) {
          params.skip = options.skip;
        }
        if (options.sort) {
          params.sort = JSON.stringify(options.sort);
        }

        return $http
          .get("/api/search/" + entity, { params: params })
          .then(function (response) {
            return response.data;
          })
          .catch(function (error) {
            console.error("Error en búsqueda por entidad:", error);
            return $q.reject(error);
          });
      },

      // Obtener metadatos de búsqueda
      getMetadata: function () {
        return $http
          .get("/api/search/metadata")
          .then(function (response) {
            return response.data;
          })
          .catch(function (error) {
            console.error("Error obteniendo metadatos:", error);
            return $q.reject(error);
          });
      },

      // Validar consulta
      validateQuery: function (query) {
        return $http
          .get("/api/search/validate", { params: { q: query } })
          .then(function (response) {
            return response.data;
          })
          .catch(function (error) {
            console.error("Error validando consulta:", error);
            return $q.reject(error);
          });
      },

      // Obtener sugerencias de autocompletado
      getSuggestions: function (query, limit) {
        limit = limit || 10;
        return $http
          .get("/api/search", {
            params: {
              q: query,
              limit: limit,
              exact: false,
            },
          })
          .then(function (response) {
            var suggestions = [];
            if (response.data.success && response.data.results) {
              // Extraer términos únicos de los resultados
              var terms = new Set();
              response.data.results.forEach(function (result) {
                // Agregar términos del título/descripción si existen
                if (result.titulo) terms.add(result.titulo);
                if (result.nombre) terms.add(result.nombre);
                if (result.nombres && result.apellidos) {
                  terms.add(result.nombres + " " + result.apellidos);
                }
              });
              suggestions = Array.from(terms).slice(0, limit);
            }
            return suggestions;
          })
          .catch(function (error) {
            console.error("Error obteniendo sugerencias:", error);
            return [];
          });
      },
    };

    // Función auxiliar para hacer llamadas GET genéricas
    service.get = function (url, config) {
      return $http
        .get(url, config || {})
        .then(function (response) {
          return response.data;
        })
        .catch(function (error) {
          console.error("Error en llamada GET:", error);
          return $q.reject(error);
        });
    };

    return service;
  },
]);
